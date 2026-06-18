package com.kaya.agri.repository;

import com.kaya.agri.entity.Supplier;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.util.List;
import java.util.Optional;

@Stateless
public class SupplierRepository {

    @PersistenceContext
    private EntityManager em;

    public List<Supplier> findAll(String search, Boolean active, int page, int pageSize) {
        StringBuilder jpql = new StringBuilder("SELECT s FROM Supplier s WHERE 1=1");
        if (search != null && !search.isBlank()) jpql.append(" AND LOWER(s.name) LIKE :search");
        if (active != null) jpql.append(" AND s.active = :active");
        jpql.append(" ORDER BY s.name");

        TypedQuery<Supplier> query = em.createQuery(jpql.toString(), Supplier.class);
        if (search != null && !search.isBlank()) query.setParameter("search", "%" + search.toLowerCase() + "%");
        if (active != null) query.setParameter("active", active);
        query.setFirstResult(page * pageSize);
        query.setMaxResults(pageSize);
        return query.getResultList();
    }

    public long count(String search, Boolean active) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(s) FROM Supplier s WHERE 1=1");
        if (search != null && !search.isBlank()) jpql.append(" AND LOWER(s.name) LIKE :search");
        if (active != null) jpql.append(" AND s.active = :active");

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        if (search != null && !search.isBlank()) query.setParameter("search", "%" + search.toLowerCase() + "%");
        if (active != null) query.setParameter("active", active);
        return query.getSingleResult();
    }

    public Optional<Supplier> findById(Integer id) {
        Supplier s = em.find(Supplier.class, id);
        return Optional.ofNullable(s);
    }

    public void persist(Supplier supplier) {
        em.persist(supplier);
    }

    public Supplier merge(Supplier supplier) {
        return em.merge(supplier);
    }

    public void delete(Supplier supplier) {
        em.remove(supplier);
    }
}
