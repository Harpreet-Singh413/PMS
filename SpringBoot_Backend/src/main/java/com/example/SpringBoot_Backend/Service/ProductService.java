package com.example.SpringBoot_Backend.Service;

import com.example.SpringBoot_Backend.DTO.ProductRequest;
import com.example.SpringBoot_Backend.DTO.ProductResponse;
import com.example.SpringBoot_Backend.Exception.DuplicateSkuException;
import com.example.SpringBoot_Backend.Exception.ProductNotFoundException;
import com.example.SpringBoot_Backend.Model.Product;
import com.example.SpringBoot_Backend.Repository.ProductRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepo productRepo;

    public Page<ProductResponse> getProducts(String search, String category, Pageable pageable) {
        String searchRegex = (search != null && !search.trim().isEmpty()) ? search : "";
        String categoryRegex = (category != null && !category.trim().isEmpty()) ? category : "";

        Page<Product> productPage = productRepo.searchAndFilterProducts(searchRegex, categoryRegex, pageable);
        return productPage.map(this::mapToResponse);
    }

    public ProductResponse getProductById(String id) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    public ProductResponse createProduct(ProductRequest request) {
        if (productRepo.findBySku(request.getSku()).isPresent()) {
            throw new DuplicateSkuException("SKU already exists: " + request.getSku());
        }

        Product product = Product.builder()
                .name(request.getName())
                .sku(request.getSku())
                .category(request.getCategory())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .supplier(request.getSupplier())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return mapToResponse(productRepo.save(product));
    }

    public ProductResponse updateProduct(String id, ProductRequest request) {
        Product existing = productRepo.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

        // Check if SKU changed and if new SKU already exists
        if (!existing.getSku().equals(request.getSku()) && productRepo.findBySku(request.getSku()).isPresent()) {
            throw new DuplicateSkuException("SKU already exists: " + request.getSku());
        }

        existing.setName(request.getName());
        existing.setSku(request.getSku());
        existing.setCategory(request.getCategory());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setStock(request.getStock());
        existing.setSupplier(request.getSupplier());
        existing.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(productRepo.save(existing));
    }

    public void deleteProduct(String id) {
        if (!productRepo.existsById(id)) {
            throw new ProductNotFoundException("Product not found with id: " + id);
        }
        productRepo.deleteById(id);
    }

    public List<String> getDistinctCategories() {
        return productRepo.findAll().stream()
                .map(Product::getCategory)
                .filter(category -> category != null && !category.trim().isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .category(product.getCategory())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .supplier(product.getSupplier())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
