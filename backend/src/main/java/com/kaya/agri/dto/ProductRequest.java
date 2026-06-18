package com.kaya.agri.dto;

public class ProductRequest {
    private Integer subcategoryId;
    private String name;
    private String sku;
    private String description;
    private Integer unitOfMeasureId;
    private String unitPrice;
    private String reorderLevel;

    public Integer getSubcategoryId() { return subcategoryId; }
    public void setSubcategoryId(Integer subcategoryId) { this.subcategoryId = subcategoryId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getUnitOfMeasureId() { return unitOfMeasureId; }
    public void setUnitOfMeasureId(Integer unitOfMeasureId) { this.unitOfMeasureId = unitOfMeasureId; }
    public String getUnitPrice() { return unitPrice; }
    public void setUnitPrice(String unitPrice) { this.unitPrice = unitPrice; }
    public String getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(String reorderLevel) { this.reorderLevel = reorderLevel; }
}
