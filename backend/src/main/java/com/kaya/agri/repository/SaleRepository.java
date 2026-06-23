package com.kaya.agri.repository;

import com.kaya.agri.entity.*;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.util.List;
import java.util.Optional;

@Stateless
public class SaleRepository {

    @PersistenceContext
    private EntityManager em;

    public List<Sale> findAll(Integer customerId, String status, int page, int pageSize) {
        StringBuilder jpql = new StringBuilder("SELECT s FROM Sale s WHERE 1=1");
        if (customerId != null) jpql.append(" AND s.customer.id = :customerId");
        if (status != null && !status.isBlank()) jpql.append(" AND s.status = :status");
        jpql.append(" ORDER BY s.createdAt DESC");

        TypedQuery<Sale> query = em.createQuery(jpql.toString(), Sale.class);
        if (customerId != null) query.setParameter("customerId", customerId);
        if (status != null && !status.isBlank()) query.setParameter("status", status);
        query.setFirstResult(page * pageSize);
        query.setMaxResults(pageSize);
        return query.getResultList();
    }

    public long count(Integer customerId, String status) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(s) FROM Sale s WHERE 1=1");
        if (customerId != null) jpql.append(" AND s.customer.id = :customerId");
        if (status != null && !status.isBlank()) jpql.append(" AND s.status = :status");

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        if (customerId != null) query.setParameter("customerId", customerId);
        if (status != null && !status.isBlank()) query.setParameter("status", status);
        return query.getSingleResult();
    }

    public Optional<Sale> findById(Integer id) {
        Sale s = em.find(Sale.class, id);
        return Optional.ofNullable(s);
    }

    public User findUserByUsername(String username) {
        try {
            return em.createQuery("SELECT u FROM User u WHERE u.username = :username", User.class)
                .setParameter("username", username).getSingleResult();
        } catch (jakarta.persistence.NoResultException e) {
            return null;
        }
    }

    public Product findProductById(Integer id) {
        return em.find(Product.class, id);
    }

    public Customer findCustomerById(Integer id) {
        return em.find(Customer.class, id);
    }

    public void persist(Sale sale) {
        em.persist(sale);
    }

    public Sale merge(Sale sale) {
        return em.merge(sale);
    }
}
