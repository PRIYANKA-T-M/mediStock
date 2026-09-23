package com.medistock.medistock.dto.dashboard;

public record DashboardSummary(
        long totalSuppliers,
        long activeSuppliers,
        long totalMedicineItems,
        long optimalStockItems,
        long lowStockItems,
        long outOfStockItems,
        long openAlerts,
        long acknowledgedAlerts,
        long criticalActiveAlerts
) {}
