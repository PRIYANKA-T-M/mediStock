package com.medistock.medistock.dto.alert;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record StockSnapshot(
        Long medicineId,
        @NotBlank String medicineName,
        @Min(0) int currentStock,
        @Min(0) int reorderLevel
) {}
