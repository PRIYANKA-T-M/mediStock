package com.medistock.medistock.dto.stock;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockQuantityUpdateRequest(
        @NotNull @Min(0) Integer quantity
) {}
