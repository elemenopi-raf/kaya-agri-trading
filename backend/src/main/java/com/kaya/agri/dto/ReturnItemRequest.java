package com.kaya.agri.dto;

public class ReturnItemRequest {
    private Integer productId;
    private String quantity;

    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }
    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
}
