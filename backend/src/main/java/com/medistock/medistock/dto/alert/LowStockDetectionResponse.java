package com.medistock.medistock.dto.alert;

import java.util.List;

public record LowStockDetectionResponse(
        int checked,
        int lowStock,
        int outOfStock,
        int recovered,
        List<AlertResponse> activeAlerts
) {}
