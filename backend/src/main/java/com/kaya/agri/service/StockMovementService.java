package com.kaya.agri.service;

import com.kaya.agri.dto.PagedResponse;
import com.kaya.agri.dto.StockMovementRequest;
import com.kaya.agri.dto.StockMovementResponse;
import com.kaya.agri.entity.*;
import com.kaya.agri.repository.StockMovementRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Stateless
public class StockMovementService {

    @Inject
    private StockMovementRepository repository;

    public PagedResponse<StockMovementResponse> list(Integer productId, String movementType,
                                                      int page, int pageSize) {
        List<StockMovement> list = repository.findAll(productId, movementType, page, pageSize);
        long total = repository.count(productId, movementType);

        List<StockMovementResponse> items = list.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());

        return new PagedResponse<>(items, total, page, pageSize);
    }

    public Optional<StockMovementResponse> getById(Integer id) {
        return repository.findById(id).map(this::toResponse);
    }

    public StockMovementResponse create(StockMovementRequest request, String username) {
        Product product = repository.findProductById(request.getProductId());
        if (product == null) throw new IllegalArgumentException("Invalid product");

        String type = request.getMovementType().toUpperCase();
        if (!type.equals("IN") && !type.equals("OUT") && !type.equals("ADJUSTMENT")) {
            throw new IllegalArgumentException("Invalid movement type (must be IN, OUT, or ADJUSTMENT)");
        }

        BigDecimal qty = parseDecimal(request.getQuantity());
        if (qty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        if (type.equals("OUT") && product.getCurrentStock().compareTo(qty) < 0) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        Batch batch = null;
        if (request.getBatchId() != null) {
            batch = repository.findBatchById(request.getBatchId());
        }

        User user = repository.findByUsername(username);

        StockMovement sm = new StockMovement();
        sm.setProduct(product);
        sm.setBatch(batch);
        sm.setMovementType(type);
        sm.setQuantity(qty);
        sm.setNotes(request.getNotes());
        sm.setCreatedBy(user);
        repository.persist(sm);

        BigDecimal newStock;
        switch (type) {
            case "IN":
                newStock = product.getCurrentStock().add(qty);
                break;
            case "OUT":
                newStock = product.getCurrentStock().subtract(qty);
                break;
            case "ADJUSTMENT":
                newStock = request.getNotes() != null && request.getNotes().toLowerCase().contains("set to")
                    ? qty
                    : product.getCurrentStock().add(qty);
                break;
            default:
                newStock = product.getCurrentStock();
        }
        product.setCurrentStock(newStock);

        return toResponse(sm);
    }

    private BigDecimal parseDecimal(String value) {
        if (value == null || value.isBlank()) return BigDecimal.ZERO;
        try { return new BigDecimal(value); }
        catch (NumberFormatException e) { return BigDecimal.ZERO; }
    }

    private StockMovementResponse toResponse(StockMovement sm) {
        Product p = sm.getProduct();
        Batch b = sm.getBatch();
        String creator = sm.getCreatedBy() != null ? sm.getCreatedBy().getDisplayName() : null;
        return new StockMovementResponse(
            sm.getId(),
            p.getId(), p.getName(), p.getSku(), p.getUnitOfMeasure().getAbbreviation(),
            b != null ? b.getId() : null,
            b != null ? b.getBatchCode() : null,
            sm.getMovementType(), sm.getQuantity(),
            sm.getReferenceType(), sm.getReferenceId(),
            sm.getNotes(), creator, sm.getCreatedAt()
        );
    }
}
