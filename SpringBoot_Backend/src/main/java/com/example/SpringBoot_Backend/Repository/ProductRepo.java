package com.example.SpringBoot_Backend.Repository;

import com.example.SpringBoot_Backend.Model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepo extends MongoRepository<Product,String> {
    Optional<Product> findBySku(String sku);

    @Query("{ $and: [ " +
           " { $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'sku': { $regex: ?0, $options: 'i' } } ] }, " +
           " { 'category': { $regex: ?1, $options: 'i' } } " +
           "] }")
    Page<Product> searchAndFilterProducts(String search, String category, Pageable pageable);
}
