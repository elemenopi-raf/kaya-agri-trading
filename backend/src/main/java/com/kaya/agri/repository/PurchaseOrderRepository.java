package com.kaya.agri.repository;

import com.kaya.agri.entity.*;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.util.List;
import java.util.Optional;

@Stateless
public class PurchaseOrderRepository {

    @PersistenceContext
    private EntityManager em;

    public List<PurchaseOrder> findAll(String status, Integer supplierId, String search, int page, int pageSize) {
        StringBuilder jpql = new StringBuilder(
            "SELECT DISTINCT po FROM PurchaseOrder po JOIN FETCH po.supplier s LEFT JOIN FETCH po.createdBy LEFT JOIN FETCH po.items WHERE 1=1");
        if (status != null && !status.isBlank()) jpql.append(" AND po.status = :status");
        if (supplierId != null) jpql.append(" AND s.id = :supplierId");
        if (search != null && !search.isBlank()) jpql.append(" AND (LOWER(po.poNumber) LIKE :search OR LOWER(s.name) LIKE :search)");
        jpql.append(" ORDER BY po.createdAt DESC");

        TypedQuery<PurchaseOrder> query = em.createQuery(jpql.toString(), PurchaseOrder.class);
        if (status != null && !status.isBlank()) query.setParameter("status", status.toUpperCase());
        if (supplierId != null) query.setParameter("supplierId", supplierId);
        if (search != null && !search.isBlank()) query.setParameter("search", "%" + search.toLowerCase() + "%");
        query.setFirstResult(page * pageSize);
        query.setMaxResults(pageSize);
        return query.getResultList();
    }

    public long count(String status, Integer supplierId, String search) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(po) FROM PurchaseOrder po WHERE 1=1");
        if (status != null && !status.isBlank()) jpql.append(" AND po.status = :status");
        if (supplierId != null) jpql.append(" AND po.supplier.id = :supplierId");
        if (search != null && !search.isBlank()) jpql.append(" AND (LOWER(po.poNumber) LIKE :search OR LOWER(po.supplier.name) LIKE :search)");

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        if (status != null && !status.isBlank()) query.setParameter("status", status.toUpperCase());
        if (supplierId != null) query.setParameter("supplierId", supplierId);
        if (search != null && !search.isBlank()) query.setParameter("search", "%" + search.toLowerCase() + "%");
        return query.getSingleResult();
    }

    public Optional<PurchaseOrder> findById(Integer id) {
        try {
            PurchaseOrder po = em.createQuery(
                "SELECT po FROM PurchaseOrder po JOIN FETCH po.supplier s LEFT JOIN FETCH po.createdBy LEFT JOIN FETCH po.items i LEFT JOIN FETCH i.product WHERE po.id = :id",
                PurchaseOrder.class)
                .setParameter("id", id)
                .getSingleResult();
            return Optional.of(po);
        } catch (jakarta.persistence.NoResultException e) {
            return Optional.empty();
        }
    }

    public void persist(PurchaseOrder po) {
        em.persist(po);
    }

    public PurchaseOrder merge(PurchaseOrder po) {
        return em.merge(po);
    }

    public void delete(PurchaseOrder po) {
        em.remove(po);
    }

    public Supplier findSupplierById(Integer id) {
        return em.find(Supplier.class, id);
    }

    public Product findProductById(Integer id) {
        return em.find(Product.class, id);
    }

    public User findUserByUsername(String username) {
        try {
            return em.createQuery("SELECT u FROM User u WHERE u.username = :username", User.class)
                .setParameter("username", username).getSingleResult();
        } catch (jakarta.persistence.NoResultException e) {
            return null;
        }
    }
}
