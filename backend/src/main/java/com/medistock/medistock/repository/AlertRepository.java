package com.medistock.medistock.repository;

import com.medistock.medistock.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findAllByOrderByCreatedAtDesc();
    Optional<Alert> findByReferenceKey(String referenceKey);
    long countByStatus(Alert.Status status);
    long countBySeverityAndStatusNot(Alert.Severity severity, Alert.Status status);
}
