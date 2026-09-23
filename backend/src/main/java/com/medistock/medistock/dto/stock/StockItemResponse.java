package com.medistock.medistock.dto.stock;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record StockItemResponse(
        Long id,
        String medicineCode,
        String medicineName,
        String category,
        String batchNumber,
        Long supplierId,
        String supplierName,
        Integer quantity,
        Integer reorderLevel,
        String unit,
        LocalDate expiryDate,
        BigDecimal unitPrice,
        String status,
        LocalDateTime updatedAt
) {}
