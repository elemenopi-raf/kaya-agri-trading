package com.kaya.agri.service;

import com.kaya.agri.dto.PagedResponse;
import com.kaya.agri.dto.ProductRequest;
import com.kaya.agri.dto.ProductResponse;
import com.kaya.agri.entity.Product;
import com.kaya.agri.entity.Subcategory;
import com.kaya.agri.entity.UnitOfMeasure;
import com.kaya.agri.repository.ProductRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Stateless
public class ProductService {

    @Inject
    private ProductRepository productRepository;

    public PagedResponse<ProductResponse> list(String search, Integer categoryId,
                                                Integer subcategoryId, Boolean active,
                                                int page, int pageSize) {
        List<Product> products = productRepository.findAll(
            search, categoryId, subcategoryId, active, page, pageSize);
        long total = productRepository.count(
            search, categoryId, subcategoryId, active);

        List<ProductResponse> items = products.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());

        return new PagedResponse<>(items, total, page, pageSize);
    }

    public Optional<ProductResponse> getById(Integer id) {
        return productRepository.findById(id).map(this::toResponse);
    }

    public ProductResponse create(ProductRequest request) {
        Subcategory subcategory = productRepository.findSubcategoryById(request.getSubcategoryId());
        if (subcategory == null) throw new IllegalArgumentException("Invalid subcategory");

        UnitOfMeasure uom = productRepository.findUomById(request.getUnitOfMeasureId());
        if (uom == null) throw new IllegalArgumentException("Invalid unit of measure");

        Product product = new Product();
        product.setSubcategory(subcategory);
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setUnitOfMeasure(uom);
        product.setUnitPrice(parseDecimal(request.getUnitPrice()));
        product.setReorderLevel(parseDecimal(request.getReorderLevel()));
        product.setCurrentStock(BigDecimal.ZERO);
        product.setActive(true);

        productRepository.persist(product);
        return toResponse(product);
    }

    public Optional<ProductResponse> update(Integer id, ProductRequest request) {
        return productRepository.findById(id).map(product -> {
            Subcategory subcategory = productRepository.findSubcategoryById(request.getSubcategoryId());
            if (subcategory == null) throw new IllegalArgumentException("Invalid subcategory");

            UnitOfMeasure uom = productRepository.findUomById(request.getUnitOfMeasureId());
            if (uom == null) throw new IllegalArgumentException("Invalid unit of measure");

            product.setSubcategory(subcategory);
            product.setName(request.getName());
            product.setSku(request.getSku());
            product.setDescription(request.getDescription());
            product.setUnitOfMeasure(uom);
            product.setUnitPrice(parseDecimal(request.getUnitPrice()));
            product.setReorderLevel(parseDecimal(request.getReorderLevel()));

            return toResponse(productRepository.merge(product));
        });
    }

    public PagedResponse<ProductResponse> lowStock(int page, int pageSize) {
        List<Product> products = productRepository.findLowStock(page, pageSize);
        long total = productRepository.countLowStock();
        return new PagedResponse<>(
            products.stream().map(this::toResponse).collect(Collectors.toList()),
            total, page, pageSize);
    }

    public boolean delete(Integer id) {
        return productRepository.findById(id).map(product -> {
            productRepository.delete(product);
            return true;
        }).orElse(false);
    }

    private BigDecimal parseDecimal(String value) {
        if (value == null || value.isBlank()) return BigDecimal.ZERO;
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(
            p.getId(), p.getName(), p.getSku(), p.getDescription(),
            p.getSubcategory().getId(), p.getSubcategory().getName(),
            p.getSubcategory().getCategory().getId(), p.getSubcategory().getCategory().getName(),
            p.getUnitOfMeasure().getId(), p.getUnitOfMeasure().getName(),
            p.getUnitOfMeasure().getAbbreviation(),
            p.getUnitPrice(), p.getReorderLevel(), p.getCurrentStock(),
            p.getActive(), p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
