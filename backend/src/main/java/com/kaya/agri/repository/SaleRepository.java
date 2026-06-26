package com.kaya.agri.repository;

import com.kaya.agri.entity.*;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Stateless
public class SaleRepository {

    @PersistenceContext
    private EntityManager em;

    public List<Sale> findAll(Integer customerId, String status, LocalDate from, LocalDate to, String search, int page, int pageSize) {
        StringBuilder jpql = new StringBuilder("SELECT s FROM Sale s LEFT JOIN FETCH s.customer WHERE 1=1");
        if (customerId != null) jpql.append(" AND s.customer.id = :customerId");
        if (status != null && !status.isBlank()) jpql.append(" AND s.status = :status");
        if (from != null) jpql.append(" AND s.saleDate >= :from");
        if (to != null) jpql.append(" AND s.saleDate <= :to");
        if (search != null && !search.isBlank()) jpql.append(" AND LOWER(s.customer.name) LIKE :search");
        jpql.append(" ORDER BY s.createdAt DESC");

        TypedQuery<Sale> query = em.createQuery(jpql.toString(), Sale.class);
        if (customerId != null) query.setParameter("customerId", customerId);
        if (status != null && !status.isBlank()) query.setParameter("status", status);
        if (from != null) query.setParameter("from", from.atStartOfDay());
        if (to != null) query.setParameter("to", to.atTime(23, 59, 59));
        if (search != null && !search.isBlank()) query.setParameter("search", "%" + search.toLowerCase() + "%");
        query.setFirstResult(page * pageSize);
        query.setMaxResults(pageSize);
        return query.getResultList();
    }

    public long count(Integer customerId, String status, LocalDate from, LocalDate to, String search) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(s) FROM Sale s WHERE 1=1");
        if (customerId != null) jpql.append(" AND s.customer.id = :customerId");
        if (status != null && !status.isBlank()) jpql.append(" AND s.status = :status");
        if (from != null) jpql.append(" AND s.saleDate >= :from");
        if (to != null) jpql.append(" AND s.saleDate <= :to");
        if (search != null && !search.isBlank()) jpql.append(" AND LOWER(s.customer.name) LIKE :search");

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        if (customerId != null) query.setParameter("customerId", customerId);
        if (status != null && !status.isBlank()) query.setParameter("status", status);
        if (from != null) query.setParameter("from", from.atStartOfDay());
        if (to != null) query.setParameter("to", to.atTime(23, 59, 59));
        if (search != null && !search.isBlank()) query.setParameter("search", "%" + search.toLowerCase() + "%");
        return query.getSingleResult();
    }

    public Optional<Sale> findById(Integer id) {
        Sale s = em.find(Sale.class, id);
        return Optional.ofNullable(s);
    }

    public List<Sale> findAllByDateRange(LocalDate from, LocalDate to) {
        StringBuilder jpql = new StringBuilder("SELECT s FROM Sale s WHERE 1=1");
        if (from != null) jpql.append(" AND s.saleDate >= :from");
        if (to != null) jpql.append(" AND s.saleDate <= :to");
        jpql.append(" ORDER BY s.saleDate DESC");

        TypedQuery<Sale> query = em.createQuery(jpql.toString(), Sale.class);
        if (from != null) query.setParameter("from", from.atStartOfDay());
        if (to != null) query.setParameter("to", to.atTime(23, 59, 59));
        return query.getResultList();
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
