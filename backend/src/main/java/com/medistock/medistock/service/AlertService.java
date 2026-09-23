package com.medistock.medistock.service;

import com.medistock.medistock.dto.alert.*;
import com.medistock.medistock.entity.Alert;
import com.medistock.medistock.exception.ResourceNotFoundException;
import com.medistock.medistock.repository.AlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getAll(String status, String severity, String type) {
        Alert.Status statusFilter = parseStatusNullable(status);
        Alert.Severity severityFilter = parseSeverityNullable(severity);
        Alert.Type typeFilter = parseTypeNullable(type);

        return alertRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(a -> statusFilter == null || a.getStatus() == statusFilter)
                .filter(a -> severityFilter == null || a.getSeverity() == severityFilter)
                .filter(a -> typeFilter == null || a.getType() == typeFilter)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlertResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public AlertResponse create(AlertRequest request) {
        Alert alert = Alert.builder()
                .type(parseType(request.type()))
                .severity(parseSeverity(request.severity()))
                .status(Alert.Status.OPEN)
                .title(request.title().trim())
                .message(request.message().trim())
                .medicineId(request.medicineId())
                .medicineName(clean(request.medicineName()))
                .currentStock(request.currentStock())
                .thresholdStock(request.thresholdStock())
                .supplierId(request.supplierId())
                .supplierName(clean(request.supplierName()))
                .build();
        return toResponse(alertRepository.save(alert));
    }

    @Transactional
    public AlertResponse acknowledge(Long id, String username) {
        Alert alert = findEntity(id);
        if (alert.getStatus() == Alert.Status.RESOLVED) {
            throw new IllegalArgumentException("Resolved alerts cannot be acknowledged");
        }
        alert.setStatus(Alert.Status.ACKNOWLEDGED);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setActedBy(username);
        return toResponse(alertRepository.save(alert));
    }

    @Transactional
    public AlertResponse resolve(Long id, String username) {
        Alert alert = findEntity(id);
        alert.setStatus(Alert.Status.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setActedBy(username);
        return toResponse(alertRepository.save(alert));
    }

    @Transactional
    public void delete(Long id) {
        alertRepository.delete(findEntity(id));
    }

    /**
     * Low-stock detector intentionally accepts inventory snapshots instead of owning
     * Medicine/Inventory tables. Backend 1 can call this endpoint after stock changes,
     * so the two team modules remain independent and merge-safe.
     */
    @Transactional
    public LowStockDetectionResponse detectLowStock(LowStockDetectionRequest request) {
        int lowStock = 0;
        int outOfStock = 0;
        int recovered = 0;
        List<AlertResponse> active = new ArrayList<>();

        for (StockSnapshot item : request.items()) {
            String referenceKey = referenceKey(item);
            Alert existing = alertRepository.findByReferenceKey(referenceKey).orElse(null);

            if (item.currentStock() <= item.reorderLevel()) {
                boolean out = item.currentStock() == 0;
                if (out) outOfStock++; else lowStock++;

                boolean becameCritical = existing != null
                        && existing.getType() != Alert.Type.OUT_OF_STOCK
                        && out;

                Alert alert = existing == null ? new Alert() : existing;
                Alert.Status previousStatus = existing == null ? null : existing.getStatus();
                alert.setReferenceKey(referenceKey);
                alert.setType(out ? Alert.Type.OUT_OF_STOCK : Alert.Type.LOW_STOCK);
                alert.setSeverity(out ? Alert.Severity.CRITICAL : Alert.Severity.WARNING);

                // Keep acknowledged alerts acknowledged while the same condition remains.
                // Re-open if the item newly becomes critical or if a resolved alert recurs.
                if (existing == null || previousStatus == Alert.Status.RESOLVED || becameCritical) {
                    alert.setStatus(Alert.Status.OPEN);
                    alert.setAcknowledgedAt(null);
                    alert.setActedBy(null);
                } else {
                    alert.setStatus(previousStatus);
                }

                alert.setMedicineId(item.medicineId());
                alert.setMedicineName(item.medicineName().trim());
                alert.setCurrentStock(item.currentStock());
                alert.setThresholdStock(item.reorderLevel());
                alert.setTitle(out
                        ? "Out of stock: " + item.medicineName().trim()
                        : "Low stock: " + item.medicineName().trim());
                alert.setMessage(out
                        ? item.medicineName().trim() + " has reached zero stock and requires immediate replenishment."
                        : item.medicineName().trim() + " is below or equal to its reorder level (" + item.reorderLevel() + "). Current stock: " + item.currentStock() + ".");
                alert.setResolvedAt(null);
                active.add(toResponse(alertRepository.save(alert)));
            } else if (existing != null && existing.getStatus() != Alert.Status.RESOLVED) {
                existing.setStatus(Alert.Status.RESOLVED);
                existing.setCurrentStock(item.currentStock());
                existing.setThresholdStock(item.reorderLevel());
                existing.setResolvedAt(LocalDateTime.now());
                existing.setActedBy("AUTO_STOCK_RECOVERY");
                alertRepository.save(existing);
                recovered++;
            }
        }

        return new LowStockDetectionResponse(
                request.items().size(), lowStock, outOfStock, recovered, active
        );
    }

    private String referenceKey(StockSnapshot item) {
        if (item.medicineId() != null) {
            return "STOCK:MEDICINE_ID:" + item.medicineId();
        }
        return "STOCK:MEDICINE_NAME:" + item.medicineName().trim().toLowerCase(Locale.ROOT);
    }

    private Alert findEntity(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + id));
    }

    private Alert.Type parseType(String value) {
        try {
            return Alert.Type.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid alert type");
        }
    }

    private Alert.Severity parseSeverity(String value) {
        try {
            return Alert.Severity.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid alert severity");
        }
    }

    private Alert.Status parseStatusNullable(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Alert.Status.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid alert status");
        }
    }

    private Alert.Severity parseSeverityNullable(String value) {
        return value == null || value.isBlank() ? null : parseSeverity(value);
    }

    private Alert.Type parseTypeNullable(String value) {
        return value == null || value.isBlank() ? null : parseType(value);
    }

    private String clean(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private AlertResponse toResponse(Alert a) {
        return new AlertResponse(
                a.getId(), a.getType().name(), a.getSeverity().name(), a.getStatus().name(),
                a.getTitle(), a.getMessage(), a.getReferenceKey(), a.getMedicineId(), a.getMedicineName(),
                a.getCurrentStock(), a.getThresholdStock(), a.getSupplierId(), a.getSupplierName(),
                a.getActedBy(), a.getCreatedAt(), a.getUpdatedAt(), a.getAcknowledgedAt(), a.getResolvedAt()
        );
    }
}
