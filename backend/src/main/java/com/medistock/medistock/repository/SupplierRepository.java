package com.medistock.medistock.repository;

import com.medistock.medistock.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsByGstNumberIgnoreCase(String gstNumber);
    boolean existsByLicenseNumberIgnoreCase(String licenseNumber);
    List<Supplier> findAllByOrderByNameAsc();
    long countByStatus(Supplier.Status status);
}
