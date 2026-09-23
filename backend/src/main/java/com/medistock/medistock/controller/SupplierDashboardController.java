package com.medistock.medistock.controller;

import com.medistock.medistock.dto.dashboard.DashboardSummary;
import com.medistock.medistock.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/supplier/dashboard")
public class SupplierDashboardController {

    private final DashboardService dashboardService;

    public SupplierDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public DashboardSummary stats() {
        return dashboardService.summary();
    }
}
