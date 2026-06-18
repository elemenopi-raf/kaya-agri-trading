package com.kaya.agri.dto;

import java.math.BigDecimal;

public class PurchaseOrderItemResponse {
    private Integer id;
    private Integer productId;
    private String productName;
    private String productSku;
    private String productUomAbbr;
    private BigDecimal qtyOrdered;
    private BigDecimal qtyReceived;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    public PurchaseOrderItemResponse() {}

    public PurchaseOrderItemResponse(Integer id, Integer productId, String productName, String productSku,
                                      String productUomAbbr, BigDecimal qtyOrdered, BigDecimal qtyReceived,
                                      BigDecimal unitPrice, BigDecimal totalPrice) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productSku = productSku;
        this.productUomAbbr = productUomAbbr;
        this.qtyOrdered = qtyOrdered;
        this.qtyReceived = qtyReceived;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
    }

    public Integer getId() { return id; }
    public Integer getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getProductSku() { return productSku; }
    public String getProductUomAbbr() { return productUomAbbr; }
    public BigDecimal getQtyOrdered() { return qtyOrdered; }
    public BigDecimal getQtyReceived() { return qtyReceived; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public BigDecimal getTotalPrice() { return totalPrice; }
}
