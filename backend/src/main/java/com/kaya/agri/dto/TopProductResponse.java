package com.kaya.agri.dto;

import java.math.BigDecimal;

public class TopProductResponse {
    private Integer productId;
    private String productName;
    private BigDecimal totalQty;
    private BigDecimal totalRevenue;

    public TopProductResponse() {}

    public TopProductResponse(Integer productId, String productName, BigDecimal totalQty, BigDecimal totalRevenue) {
        this.productId = productId;
        this.productName = productName;
        this.totalQty = totalQty;
        this.totalRevenue = totalRevenue;
    }

    public Integer getProductId() { return productId; }
    public String getProductName() { return productName; }
    public BigDecimal getTotalQty() { return totalQty; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
}
