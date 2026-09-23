package com.medistock.medistock.dto.supplier;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SupplierResponse(
        Long id,
        String name,
        String contactPerson,
        String email,
        String phone,
        String address,
        String city,
        String state,
        String pincode,
        String gstNumber,
        String licenseNumber,
        String status,
        BigDecimal rating,
        Integer leadTimeDays,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
