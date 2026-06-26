package com.kaya.agri.service;

import com.kaya.agri.dto.*;
import com.kaya.agri.entity.*;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Stateless
public class DashboardService {

    @PersistenceContext
    private EntityManager em;

    public DashboardResponse summary() {
        LocalDate today = LocalDate.now();

        BigDecimal todaySalesTotal = getTodaySalesTotal(today);
        BigDecimal todayCompletedSales = getTodaySalesByStatus(today, "COMPLETED");
        BigDecimal todayPendingSales = getTodaySalesByStatus(today, "PENDING");
        long todaySalesCount = getTodaySalesCount(today);
        long pendingPOCount = getPendingPOCount();
        long lowStockCount = getLowStockCount();
        long totalProducts = getTotalProducts();
        List<SaleResponse> recentSales = getRecentSales();

        return new DashboardResponse(todaySalesTotal, todayCompletedSales, todayPendingSales,
            todaySalesCount, pendingPOCount, lowStockCount, totalProducts, recentSales);
    }

    private BigDecimal getTodaySalesTotal(LocalDate today) {
        return em.createQuery(
            "SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleDate >= :todayStart AND s.saleDate < :tomorrow AND s.status != 'CANCELLED'",
            BigDecimal.class)
            .setParameter("todayStart", today.atStartOfDay())
            .setParameter("tomorrow", today.plusDays(1).atStartOfDay())
            .getSingleResult();
    }

    private BigDecimal getTodaySalesByStatus(LocalDate today, String status) {
        return em.createQuery(
            "SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleDate >= :todayStart AND s.saleDate < :tomorrow AND s.status = :status",
            BigDecimal.class)
            .setParameter("todayStart", today.atStartOfDay())
            .setParameter("tomorrow", today.plusDays(1).atStartOfDay())
            .setParameter("status", status)
            .getSingleResult();
    }

    private long getTodaySalesCount(LocalDate today) {
        return em.createQuery(
            "SELECT COUNT(s) FROM Sale s WHERE s.saleDate >= :todayStart AND s.saleDate < :tomorrow AND s.status != 'CANCELLED'",
            Long.class)
            .setParameter("todayStart", today.atStartOfDay())
            .setParameter("tomorrow", today.plusDays(1).atStartOfDay())
            .getSingleResult();
    }

    private long getPendingPOCount() {
        return em.createQuery(
            "SELECT COUNT(po) FROM PurchaseOrder po WHERE po.status = 'PENDING'",
            Long.class)
            .getSingleResult();
    }

    private long getLowStockCount() {
        return em.createQuery(
            "SELECT COUNT(p) FROM Product p WHERE p.active = true AND p.currentStock <= p.reorderLevel AND p.reorderLevel > 0",
            Long.class)
            .getSingleResult();
    }

    private long getTotalProducts() {
        return em.createQuery("SELECT COUNT(p) FROM Product p WHERE p.active = true", Long.class)
            .getSingleResult();
    }

    public List<SalesTrendResponse> salesTrend(int days) {
        LocalDate startDate = LocalDate.now().minusDays(days - 1);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM-dd");

        List<Object[]> rows = em.createQuery(
            "SELECT FUNCTION('DATE', s.saleDate), COALESCE(SUM(s.totalAmount), 0) " +
            "FROM Sale s WHERE s.saleDate >= :start AND s.status != 'CANCELLED' " +
            "GROUP BY FUNCTION('DATE', s.saleDate) ORDER BY FUNCTION('DATE', s.saleDate)",
            Object[].class)
            .setParameter("start", startDate.atStartOfDay())
            .getResultList();

        Map<String, BigDecimal> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String date = row[0].toString().substring(5, 10);
            map.put(date, (BigDecimal) row[1]);
        }

        List<SalesTrendResponse> trend = new ArrayList<>();
        for (LocalDate d = startDate; !d.isAfter(LocalDate.now()); d = d.plusDays(1)) {
            String key = d.format(fmt);
            trend.add(new SalesTrendResponse(key, map.getOrDefault(key, BigDecimal.ZERO)));
        }
        return trend;
    }

    public List<TopProductResponse> topProducts(int limit) {
        return em.createQuery(
            "SELECT si.product.id, si.product.name, SUM(si.quantity), SUM(si.quantity * si.unitPrice) " +
            "FROM SaleItem si JOIN si.sale s WHERE s.status != 'CANCELLED' " +
            "GROUP BY si.product.id, si.product.name ORDER BY SUM(si.quantity * si.unitPrice) DESC",
            Object[].class)
            .setMaxResults(limit)
            .getResultList()
            .stream()
            .map(r -> new TopProductResponse((Integer) r[0], (String) r[1],
                BigDecimal.valueOf(((Number) r[2]).longValue()), (BigDecimal) r[3]))
            .collect(Collectors.toList());
    }

    public List<ProductResponse> lowStockProducts(int threshold) {
        List<Product> products = em.createQuery(
            "SELECT p FROM Product p WHERE p.active = true AND p.currentStock <= p.reorderLevel " +
            "AND p.reorderLevel > 0 ORDER BY p.currentStock ASC",
            Product.class)
            .getResultList();

        return products.stream()
            .filter(p -> threshold <= 0 || p.getReorderLevel().compareTo(BigDecimal.valueOf(threshold)) <= 0)
            .map(p -> new ProductResponse(
                p.getId(), p.getName(), p.getSku(), p.getDescription(),
                p.getSubcategory().getId(), p.getSubcategory().getName(),
                p.getSubcategory().getCategory().getId(), p.getSubcategory().getCategory().getName(),
                p.getUnitOfMeasure().getId(), p.getUnitOfMeasure().getName(),
                p.getUnitOfMeasure().getAbbreviation(),
                p.getUnitPrice(), p.getReorderLevel(), p.getCurrentStock(),
                p.getActive(), p.getCreatedAt(), p.getUpdatedAt()))
            .collect(Collectors.toList());
    }

    private List<SaleResponse> getRecentSales() {
        List<Sale> sales = em.createQuery(
            "SELECT s FROM Sale s ORDER BY s.createdAt DESC", Sale.class)
            .setMaxResults(5)
            .getResultList();

        return sales.stream().map(this::toSaleResponse).collect(Collectors.toList());
    }

    private SaleResponse toSaleResponse(Sale sale) {
        List<SaleItemResponse> itemResponses = sale.getItems().stream()
            .map(i -> {
                Product p = i.getProduct();
                return new SaleItemResponse(i.getId(), p.getId(), p.getName(), p.getSku(),
                    p.getUnitOfMeasure().getAbbreviation(), i.getQuantity(), i.getUnitPrice(), i.getTotalPrice());
            })
            .collect(Collectors.toList());

        List<PaymentResponse> paymentResponses = sale.getPayments().stream()
            .map(p -> new PaymentResponse(p.getId(), sale.getId(), p.getAmount(), p.getPaymentMethod(),
                p.getReferenceNo(), p.getNotes(),
                p.getCreatedBy() != null ? p.getCreatedBy().getDisplayName() : null,
                p.getCreatedAt()))
            .collect(Collectors.toList());

        String creator = sale.getCreatedBy() != null ? sale.getCreatedBy().getDisplayName() : null;
        return new SaleResponse(sale.getId(),
            sale.getCustomer() != null ? sale.getCustomer().getId() : null,
            sale.getCustomer() != null ? sale.getCustomer().getName() : "Walk-in",
            sale.getSaleDate(), sale.getTotalAmount(), sale.getPaidAmount(),
            sale.getStatus(), sale.getNotes(), sale.getCancelReason(), creator,
            sale.getCreatedAt(), sale.getUpdatedAt(),
            itemResponses, paymentResponses);
    }
}
