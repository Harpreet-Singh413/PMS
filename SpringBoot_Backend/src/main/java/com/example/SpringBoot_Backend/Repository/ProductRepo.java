package com.example.SpringBoot_Backend.Repository;

import com.example.SpringBoot_Backend.Model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepo extends MongoRepository<Product,String> {
}
