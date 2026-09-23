package com.medistock.medistock.service;

import com.medistock.medistock.dto.supplier.SupplierRequest;
import com.medistock.medistock.dto.supplier.SupplierResponse;
import com.medistock.medistock.entity.Supplier;
import com.medistock.medistock.exception.ResourceNotFoundException;
import com.medistock.medistock.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getAll(String search, String status) {
        String query = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        Supplier.Status statusFilter = parseStatusNullable(status);

        return supplierRepository.findAllByOrderByNameAsc().stream()
                .filter(s -> statusFilter == null || s.getStatus() == statusFilter)
                .filter(s -> query.isBlank()
                        || contains(s.getName(), query)
                        || contains(s.getContactPerson(), query)
                        || contains(s.getEmail(), query)
                        || contains(s.getPhone(), query)
                        || contains(s.getCity(), query))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public SupplierResponse create(SupplierRequest request) {
        validateUniqueFields(request, null);
        Supplier supplier = new Supplier();
        apply(request, supplier);
        return toResponse(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = findEntity(id);
        validateUniqueFields(request, supplier);
        apply(request, supplier);
        return toResponse(supplierRepository.save(supplier));
    }

    @Transactional
    public void delete(Long id) {
        Supplier supplier = findEntity(id);
        supplierRepository.delete(supplier);
    }

    private Supplier findEntity(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
    }

    private void apply(SupplierRequest request, Supplier supplier) {
        supplier.setName(request.name().trim());
        supplier.setContactPerson(clean(request.contactPerson()));
        supplier.setEmail(clean(request.email()));
        supplier.setPhone(clean(request.phone()));
        supplier.setAddress(clean(request.address()));
        supplier.setCity(clean(request.city()));
        supplier.setState(clean(request.state()));
        supplier.setPincode(clean(request.pincode()));
        supplier.setGstNumber(cleanUpper(request.gstNumber()));
        supplier.setLicenseNumber(cleanUpper(request.licenseNumber()));
        supplier.setStatus(request.status() == null || request.status().isBlank()
                ? Supplier.Status.ACTIVE
                : parseStatus(request.status()));
        supplier.setRating(request.rating());
        supplier.setLeadTimeDays(request.leadTimeDays());
    }

    private void validateUniqueFields(SupplierRequest request, Supplier existing) {
        String gst = cleanUpper(request.gstNumber());
        String license = cleanUpper(request.licenseNumber());

        if (gst != null && (existing == null || !gst.equalsIgnoreCase(existing.getGstNumber()))
                && supplierRepository.existsByGstNumberIgnoreCase(gst)) {
            throw new IllegalArgumentException("GST number already exists");
        }

        if (license != null && (existing == null || !license.equalsIgnoreCase(existing.getLicenseNumber()))
                && supplierRepository.existsByLicenseNumberIgnoreCase(license)) {
            throw new IllegalArgumentException("License number already exists");
        }
    }

    private Supplier.Status parseStatus(String status) {
        try {
            return Supplier.Status.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid supplier status. Use ACTIVE or INACTIVE");
        }
    }

    private Supplier.Status parseStatusNullable(String status) {
        return status == null || status.isBlank() ? null : parseStatus(status);
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private String clean(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private String cleanUpper(String value) {
        String cleaned = clean(value);
        return cleaned == null ? null : cleaned.toUpperCase(Locale.ROOT);
    }

    private SupplierResponse toResponse(Supplier s) {
        return new SupplierResponse(
                s.getId(), s.getName(), s.getContactPerson(), s.getEmail(), s.getPhone(),
                s.getAddress(), s.getCity(), s.getState(), s.getPincode(), s.getGstNumber(),
                s.getLicenseNumber(), s.getStatus().name(), s.getRating(), s.getLeadTimeDays(),
                s.getCreatedAt(), s.getUpdatedAt()
        );
    }
}
