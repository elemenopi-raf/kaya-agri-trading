package com.kaya.agri.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {
    private Integer id;
    private Integer saleId;
    private BigDecimal amount;
    private String paymentMethod;
    private String referenceNo;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;

    public PaymentResponse() {}

    public PaymentResponse(Integer id, Integer saleId, BigDecimal amount, String paymentMethod,
                            String referenceNo, String notes, String createdBy, LocalDateTime createdAt) {
        this.id = id;
        this.saleId = saleId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.referenceNo = referenceNo;
        this.notes = notes;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public Integer getId() { return id; }
    public Integer getSaleId() { return saleId; }
    public BigDecimal getAmount() { return amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getReferenceNo() { return referenceNo; }
    public String getNotes() { return notes; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
