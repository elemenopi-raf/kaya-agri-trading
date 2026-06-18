package com.kaya.agri.dto;

public class PurchaseOrderItemRequest {
    private Integer productId;
    private String qtyOrdered;
    private String unitPrice;

    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }
    public String getQtyOrdered() { return qtyOrdered; }
    public void setQtyOrdered(String qtyOrdered) { this.qtyOrdered = qtyOrdered; }
    public String getUnitPrice() { return unitPrice; }
    public void setUnitPrice(String unitPrice) { this.unitPrice = unitPrice; }
}
