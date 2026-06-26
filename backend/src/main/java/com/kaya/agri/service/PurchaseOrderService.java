package com.kaya.agri.service;

import com.kaya.agri.dto.*;
import com.kaya.agri.entity.*;
import com.kaya.agri.repository.PurchaseOrderRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Stateless
public class PurchaseOrderService {

    @Inject
    private PurchaseOrderRepository repository;

    @PersistenceContext
    private EntityManager em;

    public PagedResponse<PurchaseOrderResponse> list(String status, Integer supplierId, String search,
                                                      int page, int pageSize) {
        List<PurchaseOrder> list = repository.findAll(status, supplierId, search, page, pageSize);
        long total = repository.count(status, supplierId, search);
        return new PagedResponse<>(
            list.stream().map(this::toResponse).collect(Collectors.toList()),
            total, page, pageSize);
    }

    public Optional<PurchaseOrderResponse> getById(Integer id) {
        return repository.findById(id).map(this::toResponse);
    }

    public PurchaseOrderResponse create(PurchaseOrderRequest request, String username) {
        Supplier supplier = repository.findSupplierById(request.getSupplierId());
        if (supplier == null) throw new IllegalArgumentException("Invalid supplier");
        if (request.getItems() == null || request.getItems().isEmpty())
            throw new IllegalArgumentException("At least one item required");

        User user = repository.findUserByUsername(username);

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(generatePoNumber());
        po.setSupplier(supplier);
        po.setStatus("PENDING");
        po.setOrderDate(request.getOrderDate() != null ? LocalDateTime.parse(request.getOrderDate()) : LocalDateTime.now());
        po.setExpectedDate(request.getExpectedDate() != null ? LocalDateTime.parse(request.getExpectedDate()) : null);
        po.setNotes(request.getNotes());
        po.setCreatedBy(user);

        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            Product product = repository.findProductById(itemReq.getProductId());
            if (product == null) throw new IllegalArgumentException("Invalid product: " + itemReq.getProductId());

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(po);
            item.setProduct(product);
            item.setQtyOrdered(parseDecimal(itemReq.getQtyOrdered()));
            item.setUnitPrice(parseDecimal(itemReq.getUnitPrice()));
            item.setQtyReceived(BigDecimal.ZERO);
            po.getItems().add(item);
        }

        repository.persist(po);
        return toResponse(po);
    }

    public Optional<PurchaseOrderResponse> updateStatus(Integer id, String newStatus, String username) {
        return repository.findById(id).map(po -> {
            String current = po.getStatus();

            switch (newStatus.toUpperCase()) {
                case "APPROVED":
                    if (!current.equals("PENDING"))
                        throw new IllegalStateException("Only PENDING orders can be approved");
                    po.setStatus("APPROVED");
                    break;
                case "RECEIVED":
                    if (!current.equals("APPROVED"))
                        throw new IllegalStateException("Only APPROVED orders can be received");
                    po.setStatus("RECEIVED");
                    User user = repository.findUserByUsername(username);
                    for (PurchaseOrderItem item : po.getItems()) {
                        item.setQtyReceived(item.getQtyOrdered());
                        Product p = item.getProduct();
                        BigDecimal qty = item.getQtyOrdered();
                        p.setCurrentStock(p.getCurrentStock().add(qty));

                        StockMovement sm = new StockMovement();
                        sm.setProduct(p);
                        sm.setMovementType("IN");
                        sm.setQuantity(qty);
                        sm.setReferenceType("PURCHASE_ORDER");
                        sm.setReferenceId(po.getId());
                        sm.setNotes("PO " + po.getPoNumber() + " received");
                        sm.setCreatedBy(user);
                        em.persist(sm);
                    }
                    break;
                case "CANCELLED":
                    if (current.equals("RECEIVED"))
                        throw new IllegalStateException("Cannot cancel a RECEIVED order");
                    po.setStatus("CANCELLED");
                    break;
                default:
                    throw new IllegalArgumentException("Invalid status: " + newStatus);
            }
            return toResponse(repository.merge(po));
        });
    }

    private String generatePoNumber() {
        return "PO-" + System.currentTimeMillis();
    }

    private BigDecimal parseDecimal(String value) {
        if (value == null || value.isBlank()) return BigDecimal.ZERO;
        try { return new BigDecimal(value); }
        catch (NumberFormatException e) { return BigDecimal.ZERO; }
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder po) {
        List<PurchaseOrderItemResponse> items = po.getItems().stream()
            .map(i -> {
                Product p = i.getProduct();
                BigDecimal total = i.getQtyOrdered().multiply(i.getUnitPrice());
                return new PurchaseOrderItemResponse(i.getId(), p.getId(), p.getName(), p.getSku(),
                    p.getUnitOfMeasure().getAbbreviation(), i.getQtyOrdered(), i.getQtyReceived(),
                    i.getUnitPrice(), total);
            })
            .collect(Collectors.toList());
        String creator = po.getCreatedBy() != null ? po.getCreatedBy().getDisplayName() : null;
        return new PurchaseOrderResponse(po.getId(), po.getPoNumber(), po.getSupplier().getId(),
            po.getSupplier().getName(), po.getStatus(), po.getOrderDate(), po.getExpectedDate(),
            po.getNotes(), creator, po.getCreatedAt(), po.getUpdatedAt(), items);
    }
}
