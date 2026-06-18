package com.kaya.agri.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {
    private Integer id;
    private String name;
    private String sku;
    private String description;
    private Integer subcategoryId;
    private String subcategoryName;
    private Integer categoryId;
    private String categoryName;
    private Integer unitOfMeasureId;
    private String unitOfMeasureName;
    private String unitOfMeasureAbbr;
    private BigDecimal unitPrice;
    private BigDecimal reorderLevel;
    private BigDecimal currentStock;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductResponse() {}

    public ProductResponse(Integer id, String name, String sku, String description,
                           Integer subcategoryId, String subcategoryName,
                           Integer categoryId, String categoryName,
                           Integer unitOfMeasureId, String unitOfMeasureName,
                           String unitOfMeasureAbbr,
                           BigDecimal unitPrice, BigDecimal reorderLevel,
                           BigDecimal currentStock, boolean active,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.subcategoryId = subcategoryId;
        this.subcategoryName = subcategoryName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.unitOfMeasureId = unitOfMeasureId;
        this.unitOfMeasureName = unitOfMeasureName;
        this.unitOfMeasureAbbr = unitOfMeasureAbbr;
        this.unitPrice = unitPrice;
        this.reorderLevel = reorderLevel;
        this.currentStock = currentStock;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getSku() { return sku; }
    public String getDescription() { return description; }
    public Integer getSubcategoryId() { return subcategoryId; }
    public String getSubcategoryName() { return subcategoryName; }
    public Integer getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public Integer getUnitOfMeasureId() { return unitOfMeasureId; }
    public String getUnitOfMeasureName() { return unitOfMeasureName; }
    public String getUnitOfMeasureAbbr() { return unitOfMeasureAbbr; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public BigDecimal getReorderLevel() { return reorderLevel; }
    public BigDecimal getCurrentStock() { return currentStock; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
