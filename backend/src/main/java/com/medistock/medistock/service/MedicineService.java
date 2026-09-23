package com.medistock.medistock.service;

import com.medistock.medistock.dto.MedicineRequest;
import com.medistock.medistock.dto.MedicineResponse;
import com.medistock.medistock.entity.Medicine;
import com.medistock.medistock.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    public MedicineResponse createMedicine(MedicineRequest request) {

        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .category(request.getCategory())
                .manufacturer(request.getManufacturer())
                .description(request.getDescription())
                .price(request.getPrice())
                .reorderLevel(request.getReorderLevel())
                .build();

        return mapToResponse(medicineRepository.save(medicine));
    }

    public List<MedicineResponse> getAllMedicines() {

        return medicineRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public MedicineResponse getMedicineById(Long id) {

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        return mapToResponse(medicine);
    }

    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        medicine.setName(request.getName());
        medicine.setCategory(request.getCategory());
        medicine.setManufacturer(request.getManufacturer());
        medicine.setDescription(request.getDescription());
        medicine.setPrice(request.getPrice());
        medicine.setReorderLevel(request.getReorderLevel());

        return mapToResponse(medicineRepository.save(medicine));
    }

    public void deleteMedicine(Long id) {

        if (!medicineRepository.existsById(id)) {
            throw new RuntimeException("Medicine not found");
        }

        medicineRepository.deleteById(id);
    }

    public List<MedicineResponse> searchMedicines(String search) {

        return medicineRepository
                .findByNameContainingIgnoreCase(search)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private MedicineResponse mapToResponse(Medicine medicine) {

        return MedicineResponse.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .category(medicine.getCategory())
                .manufacturer(medicine.getManufacturer())
                .description(medicine.getDescription())
                .price(medicine.getPrice())
                .reorderLevel(medicine.getReorderLevel())
                .build();
    }
}