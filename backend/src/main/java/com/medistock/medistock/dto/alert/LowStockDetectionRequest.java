package com.medistock.medistock.dto.alert;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record LowStockDetectionRequest(
        @NotEmpty List<@Valid StockSnapshot> items
) {}
