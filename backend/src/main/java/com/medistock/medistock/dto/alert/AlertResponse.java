package com.medistock.medistock.dto.alert;

import java.time.LocalDateTime;

public record AlertResponse(
        Long id,
        String type,
        String severity,
        String status,
        String title,
        String message,
        String referenceKey,
        Long medicineId,
        String medicineName,
        Integer currentStock,
        Integer thresholdStock,
        Long supplierId,
        String supplierName,
        String actedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime acknowledgedAt,
        LocalDateTime resolvedAt
) {}
