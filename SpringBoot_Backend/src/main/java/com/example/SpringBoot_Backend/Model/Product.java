package com.example.SpringBoot_Backend.Model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String sku;

    private String category;

    private String description;

    private Double price;

    private Integer stock;

    private String supplier;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}