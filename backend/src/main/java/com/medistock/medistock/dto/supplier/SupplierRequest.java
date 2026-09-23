package com.medistock.medistock.dto.supplier;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record SupplierRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 120) String contactPerson,
        @Email @Size(max = 180) String email,
        @Size(max = 30) String phone,
        @Size(max = 300) String address,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Size(max = 20) String pincode,
        @Size(max = 40) String gstNumber,
        @Size(max = 60) String licenseNumber,
        String status,
        @DecimalMin("0.00") @DecimalMax("5.00") BigDecimal rating,
        @Min(0) @Max(365) Integer leadTimeDays
) {}
