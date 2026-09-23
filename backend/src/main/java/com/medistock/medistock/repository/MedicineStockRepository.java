package com.medistock.medistock.repository;

import com.medistock.medistock.entity.MedicineStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicineStockRepository extends JpaRepository<MedicineStock, Long> {
    List<MedicineStock> findAllByOrderByMedicineNameAsc();
    boolean existsByMedicineCodeIgnoreCase(String medicineCode);
}
