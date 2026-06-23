package com.kaya.agri.repository;

import com.kaya.agri.entity.Customer;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.util.List;
import java.util.Optional;

@Stateless
public class CustomerRepository {

    @PersistenceContext
    private EntityManager em;

    public List<Customer> findAll(String search, Boolean active, int page, int pageSize) {
        StringBuilder jpql = new StringBuilder("SELECT c FROM Customer c WHERE 1=1");
        if (search != null && !search.isBlank()) jpql.append(" AND LOWER(c.name) LIKE :search");
        if (active != null) jpql.append(" AND c.active = :active");
        jpql.append(" ORDER BY c.name");

        TypedQuery<Customer> query = em.createQuery(jpql.toString(), Customer.class);
        if (search != null && !search.isBlank()) query.setParameter("search", "%" + search.toLowerCase() + "%");
        if (active != null) query.setParameter("active", active);
        query.setFirstResult(page * pageSize);
        query.setMaxResults(pageSize);
        return query.getResultList();
    }

    public long count(String search, Boolean active) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(c) FROM Customer c WHERE 1=1");
        if (search != null && !search.isBlank()) jpql.append(" AND LOWER(c.name) LIKE :search");
        if (active != null) jpql.append(" AND c.active = :active");

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        if (search != null && !search.isBlank()) query.setParameter("search", "%" + search.toLowerCase() + "%");
        if (active != null) query.setParameter("active", active);
        return query.getSingleResult();
    }

    public Optional<Customer> findById(Integer id) {
        Customer c = em.find(Customer.class, id);
        return Optional.ofNullable(c);
    }

    public List<Customer> findByNameSearch(String search) {
        TypedQuery<Customer> query = em.createQuery(
            "SELECT c FROM Customer c WHERE LOWER(c.name) LIKE :search AND c.active = true ORDER BY c.name",
            Customer.class);
        query.setParameter("search", "%" + search.toLowerCase() + "%");
        query.setMaxResults(20);
        return query.getResultList();
    }

    public void persist(Customer customer) {
        em.persist(customer);
    }

    public Customer merge(Customer customer) {
        return em.merge(customer);
    }

    public void delete(Customer customer) {
        em.remove(customer);
    }
}
