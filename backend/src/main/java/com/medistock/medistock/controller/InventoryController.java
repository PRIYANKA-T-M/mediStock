package com.medistock.medistock.controller;

import com.medistock.medistock.dto.InventoryRequest;
import com.medistock.medistock.dto.InventoryResponse;
import com.medistock.medistock.service.InventoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    public ResponseEntity<InventoryResponse> createInventory(
            @RequestBody InventoryRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(inventoryService.createInventory(request));
    }

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAllInventory() {

        return ResponseEntity.ok(
                inventoryService.getAllInventory()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getInventoryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                inventoryService.getInventoryById(id)
        );
    }

    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<InventoryResponse> getInventoryByMedicine(
            @PathVariable Long medicineId) {

        return ResponseEntity.ok(
                inventoryService.getInventoryByMedicine(medicineId)
        );
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<InventoryResponse> updateStock(
            @PathVariable Long id,
            @RequestBody InventoryRequest request) {

        return ResponseEntity.ok(
                inventoryService.updateStock(id, request.getQuantity())
        );
    }
}