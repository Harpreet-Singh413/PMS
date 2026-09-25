package com.example.SpringBoot_Backend.Service;

import com.example.SpringBoot_Backend.DTO.DashboardSummary;
import com.example.SpringBoot_Backend.Model.Product;
import com.example.SpringBoot_Backend.Repository.ProductRepo;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.ArithmeticOperators;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepo productRepo;
    private final MongoTemplate mongoTemplate;

    public DashboardSummary getSummary(boolean isAdmin) {
        long totalProducts = productRepo.count();

        Query availableQuery = new Query(Criteria.where("stock").gt(0));
        long availableProducts = mongoTemplate.count(availableQuery, Product.class);

        List<String> categories = mongoTemplate.findDistinct(new Query(), "category", Product.class, String.class);
        long totalCategories = categories.size();

        DashboardSummary.DashboardSummaryBuilder builder = DashboardSummary.builder()
                .totalProducts(totalProducts)
                .availableProducts(availableProducts)
                .totalCategories(totalCategories);

        if (isAdmin) {
            Query lowStockQuery = new Query(Criteria.where("stock").lt(10));
            long lowStockCount = mongoTemplate.count(lowStockQuery, Product.class);
            builder.lowStockCount(lowStockCount);

            // Total inventory value aggregation: sum(price * stock)
            Aggregation agg = Aggregation.newAggregation(
                    Aggregation.group().sum(
                            ArithmeticOperators.Multiply.valueOf("price").multiplyBy("stock")
                    ).as("totalValue")
            );
            
            AggregationResults<Document> results = mongoTemplate.aggregate(agg, "products", Document.class);
            Document doc = results.getUniqueMappedResult();
            
            double totalValue = 0.0;
            if (doc != null && doc.get("totalValue") != null) {
                totalValue = ((Number) doc.get("totalValue")).doubleValue();
            }
            
            builder.totalInventoryValue(totalValue);
        }

        return builder.build();
    }
}
