package com.kaya.agri.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class SaleResponse {
    private Integer id;
    private Integer customerId;
    private String customerName;
    private LocalDate saleDate;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private String status;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SaleItemResponse> items;
    private List<PaymentResponse> payments;

    public SaleResponse() {}

    public SaleResponse(Integer id, Integer customerId, String customerName, LocalDate saleDate,
                         BigDecimal totalAmount, BigDecimal paidAmount, String status, String notes,
                         String createdBy, LocalDateTime createdAt, LocalDateTime updatedAt,
                         List<SaleItemResponse> items, List<PaymentResponse> payments) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.saleDate = saleDate;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.status = status;
        this.notes = notes;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.items = items;
        this.payments = payments;
    }

    public Integer getId() { return id; }
    public Integer getCustomerId() { return customerId; }
    public String getCustomerName() { return customerName; }
    public LocalDate getSaleDate() { return saleDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BigDecimal getPaidAmount() { return paidAmount; }
    public String getStatus() { return status; }
    public String getNotes() { return notes; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<SaleItemResponse> getItems() { return items; }
    public List<PaymentResponse> getPayments() { return payments; }
}
