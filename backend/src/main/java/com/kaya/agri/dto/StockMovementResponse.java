package com.kaya.agri.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockMovementResponse {
    private Integer id;
    private Integer productId;
    private String productName;
    private String productSku;
    private String productUomAbbr;
    private Integer batchId;
    private String batchCode;
    private String movementType;
    private BigDecimal quantity;
    private String referenceType;
    private Integer referenceId;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;

    public StockMovementResponse() {}

    public StockMovementResponse(Integer id, Integer productId, String productName, String productSku,
                                  String productUomAbbr, Integer batchId, String batchCode,
                                  String movementType, BigDecimal quantity, String referenceType,
                                  Integer referenceId, String notes, String createdBy, LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productSku = productSku;
        this.productUomAbbr = productUomAbbr;
        this.batchId = batchId;
        this.batchCode = batchCode;
        this.movementType = movementType;
        this.quantity = quantity;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.notes = notes;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public Integer getId() { return id; }
    public Integer getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getProductSku() { return productSku; }
    public String getProductUomAbbr() { return productUomAbbr; }
    public Integer getBatchId() { return batchId; }
    public String getBatchCode() { return batchCode; }
    public String getMovementType() { return movementType; }
    public BigDecimal getQuantity() { return quantity; }
    public String getReferenceType() { return referenceType; }
    public Integer getReferenceId() { return referenceId; }
    public String getNotes() { return notes; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
