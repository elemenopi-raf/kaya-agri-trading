package com.kaya.agri.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardResponse {
    private BigDecimal todaySalesTotal;
    private BigDecimal todayCompletedSales;
    private BigDecimal todayPendingSales;
    private long todaySalesCount;
    private long pendingPOCount;
    private long lowStockCount;
    private long totalProducts;
    private List<SaleResponse> recentSales;

    public DashboardResponse() {}

    public DashboardResponse(BigDecimal todaySalesTotal, BigDecimal todayCompletedSales,
                              BigDecimal todayPendingSales, long todaySalesCount, long pendingPOCount,
                              long lowStockCount, long totalProducts, List<SaleResponse> recentSales) {
        this.todaySalesTotal = todaySalesTotal;
        this.todayCompletedSales = todayCompletedSales;
        this.todayPendingSales = todayPendingSales;
        this.todaySalesCount = todaySalesCount;
        this.pendingPOCount = pendingPOCount;
        this.lowStockCount = lowStockCount;
        this.totalProducts = totalProducts;
        this.recentSales = recentSales;
    }

    public BigDecimal getTodaySalesTotal() { return todaySalesTotal; }
    public BigDecimal getTodayCompletedSales() { return todayCompletedSales; }
    public BigDecimal getTodayPendingSales() { return todayPendingSales; }
    public long getTodaySalesCount() { return todaySalesCount; }
    public long getPendingPOCount() { return pendingPOCount; }
    public long getLowStockCount() { return lowStockCount; }
    public long getTotalProducts() { return totalProducts; }
    public List<SaleResponse> getRecentSales() { return recentSales; }
}
