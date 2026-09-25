package com.example.SpringBoot_Backend.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummary {
    private long totalProducts;
    private long availableProducts;
    private long totalCategories;
    
    // Admin only fields (will be null for USER)
    private Long lowStockCount;
    private Double totalInventoryValue;
}
