package com.medistock.medistock.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineRequest {

    private String name;
    private String category;
    private String manufacturer;
    private String description;
    private BigDecimal price;
    private Integer reorderLevel;
}