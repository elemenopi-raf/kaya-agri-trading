package com.kaya.agri.service;

import com.kaya.agri.dto.*;
import com.kaya.agri.entity.*;
import com.kaya.agri.repository.SaleRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Stateless
public class SaleService {

    @Inject
    private SaleRepository repository;

    public PagedResponse<SaleResponse> list(Integer customerId, String status, int page, int pageSize) {
        List<Sale> list = repository.findAll(customerId, status, page, pageSize);
        long total = repository.count(customerId, status);
        return new PagedResponse<>(
            list.stream().map(this::toResponse).collect(Collectors.toList()),
            total, page, pageSize);
    }

    public Optional<SaleResponse> getById(Integer id) {
        return repository.findById(id).map(this::toResponse);
    }

    public SaleResponse create(SaleRequest request, String username) {
        if (request.getItems() == null || request.getItems().isEmpty())
            throw new IllegalArgumentException("At least one item required");

        User user = repository.findUserByUsername(username);

        Sale sale = new Sale();
        sale.setSaleDate(request.getSaleDate() != null ? LocalDate.parse(request.getSaleDate()) : LocalDate.now());
        sale.setNotes(request.getNotes());
        sale.setStatus("PENDING");
        sale.setCreatedBy(user);
        sale.setPaidAmount(BigDecimal.ZERO);

        if (request.getCustomerId() != null) {
            Customer customer = repository.findCustomerById(request.getCustomerId());
            if (customer == null) throw new IllegalArgumentException("Invalid customer");
            sale.setCustomer(customer);
        }

        BigDecimal total = BigDecimal.ZERO;
        for (SaleItemRequest itemReq : request.getItems()) {
            Product product = repository.findProductById(itemReq.getProductId());
            if (product == null) throw new IllegalArgumentException("Invalid product: " + itemReq.getProductId());

            BigDecimal qty = parseDecimal(itemReq.getQuantity());
            BigDecimal price = parseDecimal(itemReq.getUnitPrice());
            BigDecimal lineTotal = qty.multiply(price);

            if (qty.compareTo(product.getCurrentStock()) > 0)
                throw new IllegalArgumentException("Insufficient stock for " + product.getName()
                    + " (available: " + product.getCurrentStock() + ")");

            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setProduct(product);
            item.setQuantity(qty);
            item.setUnitPrice(price);
            sale.getItems().add(item);

            total = total.add(lineTotal);
        }

        sale.setTotalAmount(total);
        repository.persist(sale);

        for (SaleItem item : sale.getItems()) {
            Product p = item.getProduct();
            p.setCurrentStock(p.getCurrentStock().subtract(item.getQuantity()));
        }

        return toResponse(sale);
    }

    public Optional<SaleResponse> addPayment(Integer saleId, PaymentRequest request, String username) {
        return repository.findById(saleId).map(sale -> {
            if ("CANCELLED".equals(sale.getStatus()))
                throw new IllegalStateException("Cannot add payment to cancelled sale");
            if ("COMPLETED".equals(sale.getStatus()))
                throw new IllegalStateException("Sale is already fully paid");

            User user = repository.findUserByUsername(username);

            BigDecimal paymentAmount = parseDecimal(request.getAmount());
            if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0)
                throw new IllegalArgumentException("Payment amount must be positive");

            Payment payment = new Payment();
            payment.setSale(sale);
            payment.setAmount(paymentAmount);
            payment.setPaymentMethod(request.getPaymentMethod());
            payment.setReferenceNo(request.getReferenceNo());
            payment.setNotes(request.getNotes());
            payment.setCreatedBy(user);

            sale.getPayments().add(payment);

            BigDecimal newPaid = sale.getPaidAmount().add(paymentAmount);
            sale.setPaidAmount(newPaid);

            if (newPaid.compareTo(sale.getTotalAmount()) >= 0) {
                sale.setStatus("COMPLETED");
            }

            return toResponse(repository.merge(sale));
        });
    }

    public Optional<SaleResponse> cancel(Integer id) {
        return repository.findById(id).map(sale -> {
            if ("COMPLETED".equals(sale.getStatus()))
                throw new IllegalStateException("Cannot cancel a completed sale");
            if ("CANCELLED".equals(sale.getStatus()))
                throw new IllegalStateException("Sale is already cancelled");
            sale.setStatus("CANCELLED");

            for (SaleItem item : sale.getItems()) {
                Product p = item.getProduct();
                p.setCurrentStock(p.getCurrentStock().add(item.getQuantity()));
            }

            return toResponse(repository.merge(sale));
        });
    }

    private BigDecimal parseDecimal(String value) {
        if (value == null || value.isBlank()) return BigDecimal.ZERO;
        try { return new BigDecimal(value); }
        catch (NumberFormatException e) { return BigDecimal.ZERO; }
    }

    private SaleResponse toResponse(Sale sale) {
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
            sale.getStatus(), sale.getNotes(), creator,
            sale.getCreatedAt(), sale.getUpdatedAt(),
            itemResponses, paymentResponses);
    }
}
