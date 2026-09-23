package com.medistock.medistock.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Lightweight integration stock table used by Backend 2 to demonstrate and test
 * low-stock alert automation. It deliberately does not implement Medicine CRUD;
 * Backend 1 can later replace this source and keep calling the alert detector.
 */
@Entity
@Table(name = "medicine_stock", indexes = {
        @Index(name = "idx_medicine_stock_name", columnList = "medicine_name"),
        @Index(name = "idx_medicine_stock_supplier", columnList = "supplier_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "medicine_code", nullable = false, unique = true, length = 30)
    private String medicineCode;

    @Column(name = "medicine_name", nullable = false, length = 180)
    private String medicineName;

    @Column(length = 100)
    private String category;

    @Column(name = "batch_number", length = 60)
    private String batchNumber;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "supplier_name", length = 150)
    private String supplierName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel;

    @Column(length = 30)
    @Builder.Default
    private String unit = "units";

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (quantity == null) quantity = 0;
        if (reorderLevel == null) reorderLevel = 0;
        if (unit == null || unit.isBlank()) unit = "units";
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
