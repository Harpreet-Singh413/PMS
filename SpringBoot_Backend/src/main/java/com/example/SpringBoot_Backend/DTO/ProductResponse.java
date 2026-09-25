package com.example.SpringBoot_Backend.DTO;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private String id;
    private String name;
    private String sku;
    private String category;
    private String description;
    private Double price;
    private Integer stock;
    private String supplier;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
