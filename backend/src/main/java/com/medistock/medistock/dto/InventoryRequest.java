package com.medistock.medistock.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryRequest {

    private Long medicineId;
    private Integer quantity;
}