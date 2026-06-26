package com.kaya.agri.dto;

import java.math.BigDecimal;

public class SalesTrendResponse {
    private String date;
    private BigDecimal total;

    public SalesTrendResponse() {}

    public SalesTrendResponse(String date, BigDecimal total) {
        this.date = date;
        this.total = total;
    }

    public String getDate() { return date; }
    public BigDecimal getTotal() { return total; }
}
