package com.medistock.medistock.controller;

import com.medistock.medistock.dto.MedicineRequest;
import com.medistock.medistock.dto.MedicineResponse;
import com.medistock.medistock.service.MedicineService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @PostMapping
    public ResponseEntity<MedicineResponse> createMedicine(
            @RequestBody MedicineRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(medicineService.createMedicine(request));
    }

    @GetMapping
    public ResponseEntity<List<MedicineResponse>> getAllMedicines(
            @RequestParam(required = false) String search) {

        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(
                    medicineService.searchMedicines(search)
            );
        }

        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicineResponse> getMedicineById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                medicineService.getMedicineById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineResponse> updateMedicine(
            @PathVariable Long id,
            @RequestBody MedicineRequest request) {

        return ResponseEntity.ok(
                medicineService.updateMedicine(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(
            @PathVariable Long id) {

        medicineService.deleteMedicine(id);

        return ResponseEntity.noContent().build();
    }
}