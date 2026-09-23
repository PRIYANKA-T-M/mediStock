package com.medistock.medistock.service;

import com.medistock.medistock.dto.dashboard.DashboardSummary;
import com.medistock.medistock.entity.Alert;
import com.medistock.medistock.entity.MedicineStock;
import com.medistock.medistock.entity.Supplier;
import com.medistock.medistock.repository.AlertRepository;
import com.medistock.medistock.repository.MedicineStockRepository;
import com.medistock.medistock.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private final SupplierRepository supplierRepository;
    private final AlertRepository alertRepository;
    private final MedicineStockRepository stockRepository;

    public DashboardService(
            SupplierRepository supplierRepository,
            AlertRepository alertRepository,
            MedicineStockRepository stockRepository
    ) {
        this.supplierRepository = supplierRepository;
        this.alertRepository = alertRepository;
        this.stockRepository = stockRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummary summary() {
        List<MedicineStock> stock = stockRepository.findAll();
        long out = stock.stream().filter(i -> i.getQuantity() <= 0).count();
        long low = stock.stream().filter(i -> i.getQuantity() > 0 && i.getQuantity() <= i.getReorderLevel()).count();
        long optimal = stock.stream().filter(i -> i.getQuantity() > i.getReorderLevel()).count();

        return new DashboardSummary(
                supplierRepository.count(),
                supplierRepository.countByStatus(Supplier.Status.ACTIVE),
                stock.size(),
                optimal,
                low,
                out,
                alertRepository.countByStatus(Alert.Status.OPEN),
                alertRepository.countByStatus(Alert.Status.ACKNOWLEDGED),
                alertRepository.countBySeverityAndStatusNot(Alert.Severity.CRITICAL, Alert.Status.RESOLVED)
        );
    }
}
