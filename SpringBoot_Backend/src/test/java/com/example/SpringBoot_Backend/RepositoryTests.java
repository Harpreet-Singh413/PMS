package com.example.SpringBoot_Backend;

import com.example.SpringBoot_Backend.Model.Product;
import com.example.SpringBoot_Backend.Model.Role;
import com.example.SpringBoot_Backend.Model.User;
import com.example.SpringBoot_Backend.Repository.ProductRepo;
import com.example.SpringBoot_Backend.Repository.UserRepo;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

@SpringBootTest
public class RepositoryTests {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ProductRepo productRepo;

    @Test
    public void testUserSaveAndFind() {
        User user = User.builder()
                .name("Test User")
                .email("test@example.com")
                .password("password123")
                .role(Role.USER)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepo.save(user);
        Assertions.assertNotNull(savedUser.getId());

        User foundUser = userRepo.findById(savedUser.getId()).orElse(null);
        Assertions.assertNotNull(foundUser);
        Assertions.assertEquals("test@example.com", foundUser.getEmail());

        // Cleanup
        userRepo.delete(savedUser);
    }

    @Test
    public void testProductSaveAndFind() {
        Product product = Product.builder()
                .name("Test Product")
                .sku("TEST-SKU-001")
                .category("Test Category")
                .price(100.0)
                .stock(10)
                .createdAt(LocalDateTime.now())
                .build();

        Product savedProduct = productRepo.save(product);
        Assertions.assertNotNull(savedProduct.getId());

        Product foundProduct = productRepo.findById(savedProduct.getId()).orElse(null);
        Assertions.assertNotNull(foundProduct);
        Assertions.assertEquals("TEST-SKU-001", foundProduct.getSku());

        // Cleanup
        productRepo.delete(savedProduct);
    }
}
