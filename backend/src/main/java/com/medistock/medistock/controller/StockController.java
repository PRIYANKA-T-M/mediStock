package com.medistock.medistock.controller;

import com.medistock.medistock.dto.stock.StockItemResponse;
import com.medistock.medistock.dto.stock.StockQuantityUpdateRequest;
import com.medistock.medistock.service.StockService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public List<StockItemResponse> getAll() {
        return stockService.getAll();
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public StockItemResponse updateQuantity(
            @PathVariable Long id,
            @Valid @RequestBody StockQuantityUpdateRequest request
    ) {
        return stockService.updateQuantity(id, request.quantity());
    }

    @PostMapping("/refresh-alerts")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public void refreshAlerts() {
        stockService.refreshAllAlerts();
    }
}
