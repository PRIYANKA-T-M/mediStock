package com.medistock.medistock.service;

import com.medistock.medistock.dto.alert.LowStockDetectionRequest;
import com.medistock.medistock.dto.alert.StockSnapshot;
import com.medistock.medistock.dto.stock.StockItemResponse;
import com.medistock.medistock.entity.MedicineStock;
import com.medistock.medistock.exception.ResourceNotFoundException;
import com.medistock.medistock.repository.MedicineStockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockService {

    private final MedicineStockRepository stockRepository;
    private final AlertService alertService;

    public StockService(MedicineStockRepository stockRepository, AlertService alertService) {
        this.stockRepository = stockRepository;
        this.alertService = alertService;
    }

    @Transactional(readOnly = true)
    public List<StockItemResponse> getAll() {
        return stockRepository.findAllByOrderByMedicineNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public StockItemResponse updateQuantity(Long id, int quantity) {
        MedicineStock item = stockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock item not found: " + id));
        item.setQuantity(quantity);
        MedicineStock saved = stockRepository.save(item);

        alertService.detectLowStock(new LowStockDetectionRequest(List.of(
                new StockSnapshot(saved.getId(), saved.getMedicineName(), saved.getQuantity(), saved.getReorderLevel())
        )));

        return toResponse(saved);
    }

    @Transactional
    public void refreshAllAlerts() {
        List<StockSnapshot> snapshots = stockRepository.findAllByOrderByMedicineNameAsc().stream()
                .map(item -> new StockSnapshot(item.getId(), item.getMedicineName(), item.getQuantity(), item.getReorderLevel()))
                .toList();
        if (!snapshots.isEmpty()) {
            alertService.detectLowStock(new LowStockDetectionRequest(snapshots));
        }
    }

    public String statusFor(MedicineStock item) {
        if (item.getQuantity() <= 0) return "OUT_OF_STOCK";
        if (item.getQuantity() <= item.getReorderLevel()) return "LOW_STOCK";
        return "OPTIMAL";
    }

    private StockItemResponse toResponse(MedicineStock item) {
        return new StockItemResponse(
                item.getId(), item.getMedicineCode(), item.getMedicineName(), item.getCategory(),
                item.getBatchNumber(), item.getSupplierId(), item.getSupplierName(), item.getQuantity(),
                item.getReorderLevel(), item.getUnit(), item.getExpiryDate(), item.getUnitPrice(),
                statusFor(item), item.getUpdatedAt()
        );
    }
}
