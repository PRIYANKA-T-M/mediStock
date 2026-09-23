package com.medistock.medistock.repository;

import com.medistock.medistock.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByMedicineId(Long medicineId);

    List<Inventory> findByQuantityLessThanEqual(Integer reorderLevel);
}