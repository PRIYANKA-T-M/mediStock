package com.medistock.medistock.dto.alert;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlertRequest(
        @NotBlank String type,
        @NotBlank String severity,
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 1000) String message,
        Long medicineId,
        @Size(max = 180) String medicineName,
        Integer currentStock,
        Integer thresholdStock,
        Long supplierId,
        @Size(max = 150) String supplierName
) {}
