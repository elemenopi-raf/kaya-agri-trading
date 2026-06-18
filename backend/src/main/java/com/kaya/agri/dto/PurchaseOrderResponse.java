package com.kaya.agri.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseOrderResponse {
    private Integer id;
    private String poNumber;
    private Integer supplierId;
    private String supplierName;
    private String status;
    private LocalDate orderDate;
    private LocalDate expectedDate;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PurchaseOrderItemResponse> items;

    public PurchaseOrderResponse() {}

    public PurchaseOrderResponse(Integer id, String poNumber, Integer supplierId, String supplierName,
                                  String status, LocalDate orderDate, LocalDate expectedDate,
                                  String notes, String createdBy, LocalDateTime createdAt,
                                  LocalDateTime updatedAt, List<PurchaseOrderItemResponse> items) {
        this.id = id;
        this.poNumber = poNumber;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.status = status;
        this.orderDate = orderDate;
        this.expectedDate = expectedDate;
        this.notes = notes;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.items = items;
    }

    public Integer getId() { return id; }
    public String getPoNumber() { return poNumber; }
    public Integer getSupplierId() { return supplierId; }
    public String getSupplierName() { return supplierName; }
    public String getStatus() { return status; }
    public LocalDate getOrderDate() { return orderDate; }
    public LocalDate getExpectedDate() { return expectedDate; }
    public String getNotes() { return notes; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<PurchaseOrderItemResponse> getItems() { return items; }
}
