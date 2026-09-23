package com.medistock.medistock.controller;

import com.medistock.medistock.dto.dashboard.DashboardSummary;
import com.medistock.medistock.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public DashboardSummary summary() {
        return dashboardService.summary();
    }
}
