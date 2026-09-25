package com.example.SpringBoot_Backend.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "SKU is required")
    @Pattern(regexp = "^[A-Za-z0-9\\-]{3,30}$", message = "SKU must be alphanumeric with dashes, 3-30 characters")
    private String sku;

    @NotBlank(message = "Category is required")
    private String category;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than zero")
    private Double price;

    @NotNull(message = "Stock is required")
    @PositiveOrZero(message = "Stock must be zero or positive")
    private Integer stock;

    @Size(max = 150, message = "Supplier must not exceed 150 characters")
    private String supplier;
}
