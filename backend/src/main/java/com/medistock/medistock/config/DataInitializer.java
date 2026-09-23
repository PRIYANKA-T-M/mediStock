package com.medistock.medistock.config;

import com.medistock.medistock.entity.MedicineStock;
import com.medistock.medistock.entity.Role;
import com.medistock.medistock.entity.Supplier;
import com.medistock.medistock.repository.MedicineStockRepository;
import com.medistock.medistock.repository.RoleRepository;
import com.medistock.medistock.repository.SupplierRepository;
import com.medistock.medistock.service.StockService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeProjectData(
            RoleRepository roleRepository,
            SupplierRepository supplierRepository,
            MedicineStockRepository stockRepository,
            StockService stockService
    ) {
        return args -> {
            createRole(roleRepository, "ADMIN");
            createRole(roleRepository, "PHARMACIST");
            createRole(roleRepository, "STAFF");

            seedSuppliers(supplierRepository);
            seedMedicineStock(stockRepository, supplierRepository);
            stockService.refreshAllAlerts();
        };
    }

    private void createRole(RoleRepository repository, String roleName) {
        if (repository.findByName(roleName).isEmpty()) {
            repository.save(new Role(roleName));
        }
    }

    private void seedSuppliers(SupplierRepository repository) {
        if (repository.count() > 0) return;

        repository.saveAll(List.of(
                supplier("Apollo Pharma Distributors", "Ramesh Kumar", "orders@apollopharmadist.in", "9876543210", "Vijayawada", "Andhra Pradesh", "GST-AP-001", "DL-AP-101", new BigDecimal("4.80"), 2),
                supplier("MedPlus Wholesale Network", "S. Priya", "supply@medpluswholesale.in", "9123456780", "Hyderabad", "Telangana", "GST-TS-002", "DL-TS-204", new BigDecimal("4.60"), 3),
                supplier("CureLine Medical Supplies", "Arjun Reddy", "sales@cureline.in", "9012345678", "Guntur", "Andhra Pradesh", "GST-AP-003", "DL-AP-309", new BigDecimal("4.40"), 4),
                supplier("HealthBridge Lifesciences", "Neha Sharma", "dispatch@healthbridge.in", "9988776655", "Chennai", "Tamil Nadu", "GST-TN-004", "DL-TN-411", new BigDecimal("4.70"), 2)
        ));
    }

    private Supplier supplier(String name, String contact, String email, String phone, String city,
                              String state, String gst, String license, BigDecimal rating, int leadTime) {
        return Supplier.builder()
                .name(name)
                .contactPerson(contact)
                .email(email)
                .phone(phone)
                .city(city)
                .state(state)
                .gstNumber(gst)
                .licenseNumber(license)
                .status(Supplier.Status.ACTIVE)
                .rating(rating)
                .leadTimeDays(leadTime)
                .build();
    }

    private void seedMedicineStock(MedicineStockRepository repository, SupplierRepository supplierRepository) {
        if (repository.count() > 0) return;

        List<Supplier> suppliers = supplierRepository.findAllByOrderByNameAsc();
        Supplier s1 = suppliers.isEmpty() ? null : suppliers.get(0);
        Supplier s2 = suppliers.size() > 1 ? suppliers.get(1) : s1;
        Supplier s3 = suppliers.size() > 2 ? suppliers.get(2) : s1;
        Supplier s4 = suppliers.size() > 3 ? suppliers.get(3) : s1;

        repository.saveAll(List.of(
                stock("MED-001", "Paracetamol 500mg", "Analgesic", "PCM-2608-A", s1, 120, 30, "tablets", LocalDate.now().plusMonths(18), "1.20"),
                stock("MED-002", "Amoxicillin 500mg", "Antibiotic", "AMX-2607-B", s2, 12, 25, "capsules", LocalDate.now().plusMonths(12), "6.50"),
                stock("MED-003", "Ibuprofen 400mg", "Analgesic", "IBU-2606-C", s3, 0, 20, "tablets", LocalDate.now().plusMonths(16), "2.40"),
                stock("MED-004", "Cetirizine 10mg", "Antihistamine", "CTZ-2608-D", s1, 18, 15, "tablets", LocalDate.now().plusMonths(20), "1.80"),
                stock("MED-005", "Metformin 500mg", "Antidiabetic", "MET-2605-E", s4, 8, 20, "tablets", LocalDate.now().plusMonths(14), "2.10"),
                stock("MED-006", "Azithromycin 500mg", "Antibiotic", "AZM-2607-F", s2, 30, 10, "tablets", LocalDate.now().plusMonths(11), "18.00"),
                stock("MED-007", "ORS Sachet", "Rehydration", "ORS-2609-G", s3, 5, 25, "sachets", LocalDate.now().plusMonths(24), "12.00"),
                stock("MED-008", "Pantoprazole 40mg", "Gastrointestinal", "PAN-2608-H", s1, 40, 15, "tablets", LocalDate.now().plusMonths(19), "4.50"),
                stock("MED-009", "Human Insulin 40 IU/ml", "Antidiabetic", "INS-2608-I", s4, 6, 12, "vials", LocalDate.now().plusMonths(8), "165.00"),
                stock("MED-010", "Atorvastatin 10mg", "Cardiovascular", "ATV-2607-J", s2, 55, 20, "tablets", LocalDate.now().plusMonths(17), "5.30")
        ));
    }

    private MedicineStock stock(String code, String name, String category, String batch, Supplier supplier,
                                int quantity, int reorderLevel, String unit, LocalDate expiry, String price) {
        return MedicineStock.builder()
                .medicineCode(code)
                .medicineName(name)
                .category(category)
                .batchNumber(batch)
                .supplierId(supplier == null ? null : supplier.getId())
                .supplierName(supplier == null ? null : supplier.getName())
                .quantity(quantity)
                .reorderLevel(reorderLevel)
                .unit(unit)
                .expiryDate(expiry)
                .unitPrice(new BigDecimal(price))
                .build();
    }
}
