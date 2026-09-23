package com.medistock.medistock.controller;

import com.medistock.medistock.dto.alert.*;
import com.medistock.medistock.service.AlertService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public List<AlertResponse> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String type
    ) {
        return alertService.getAll(status, severity, type);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public AlertResponse getById(@PathVariable Long id) {
        return alertService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<AlertResponse> create(@Valid @RequestBody AlertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alertService.create(request));
    }

    @PostMapping("/detect-low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public LowStockDetectionResponse detectLowStock(@Valid @RequestBody LowStockDetectionRequest request) {
        return alertService.detectLowStock(request);
    }

    @PatchMapping("/{id}/acknowledge")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public AlertResponse acknowledge(@PathVariable Long id, Authentication authentication) {
        return alertService.acknowledge(id, authentication.getName());
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public AlertResponse resolve(@PathVariable Long id, Authentication authentication) {
        return alertService.resolve(id, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        alertService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
