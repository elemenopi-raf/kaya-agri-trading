package com.kaya.agri.repository;

import com.kaya.agri.entity.*;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.util.List;
import java.util.Optional;

@Stateless
public class StockMovementRepository {

    @PersistenceContext
    private EntityManager em;

    public List<StockMovement> findAll(Integer productId, String movementType,
                                        int page, int pageSize) {
        StringBuilder jpql = new StringBuilder(
            "SELECT sm FROM StockMovement sm JOIN FETCH sm.product p LEFT JOIN FETCH sm.batch b LEFT JOIN FETCH sm.createdBy WHERE 1=1");

        if (productId != null) {
            jpql.append(" AND p.id = :productId");
        }
        if (movementType != null && !movementType.isBlank()) {
            jpql.append(" AND sm.movementType = :movementType");
        }
        jpql.append(" ORDER BY sm.createdAt DESC");

        TypedQuery<StockMovement> query = em.createQuery(jpql.toString(), StockMovement.class);
        if (productId != null) query.setParameter("productId", productId);
        if (movementType != null && !movementType.isBlank()) query.setParameter("movementType", movementType.toUpperCase());

        query.setFirstResult(page * pageSize);
        query.setMaxResults(pageSize);
        return query.getResultList();
    }

    public long count(Integer productId, String movementType) {
        StringBuilder jpql = new StringBuilder(
            "SELECT COUNT(sm) FROM StockMovement sm WHERE 1=1");
        if (productId != null) jpql.append(" AND sm.product.id = :productId");
        if (movementType != null && !movementType.isBlank()) jpql.append(" AND sm.movementType = :movementType");

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        if (productId != null) query.setParameter("productId", productId);
        if (movementType != null && !movementType.isBlank()) query.setParameter("movementType", movementType.toUpperCase());

        return query.getSingleResult();
    }

    public Optional<StockMovement> findById(Integer id) {
        try {
            StockMovement sm = em.createQuery(
                "SELECT sm FROM StockMovement sm JOIN FETCH sm.product p LEFT JOIN FETCH sm.batch b LEFT JOIN FETCH sm.createdBy WHERE sm.id = :id",
                StockMovement.class)
                .setParameter("id", id)
                .getSingleResult();
            return Optional.of(sm);
        } catch (jakarta.persistence.NoResultException e) {
            return Optional.empty();
        }
    }

    public void persist(StockMovement sm) {
        em.persist(sm);
    }

    public Product findProductById(Integer id) {
        return em.find(Product.class, id);
    }

    public Batch findBatchById(Integer id) {
        return em.find(Batch.class, id);
    }

    public User findUserById(Integer id) {
        return em.find(User.class, id);
    }

    public User findByUsername(String username) {
        try {
            return em.createQuery("SELECT u FROM User u WHERE u.username = :username", User.class)
                .setParameter("username", username)
                .getSingleResult();
        } catch (jakarta.persistence.NoResultException e) {
            return null;
        }
    }
}
