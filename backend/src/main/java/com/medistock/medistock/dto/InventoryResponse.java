package com.medistock.medistock.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {

    private Long id;
    private Long medicineId;
    private String medicineName;
    private Integer quantity;
    private Integer reorderLevel;
    private String status;
}