package com.kaya.agri.repository;

import com.kaya.agri.entity.User;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.util.List;
import java.util.Optional;

@Stateless
public class UserRepository {

    @PersistenceContext
    private EntityManager em;

    public Optional<User> findByUsername(String username) {
        try {
            User user = em.createQuery(
                "SELECT u FROM User u WHERE u.username = :username", User.class)
                .setParameter("username", username)
                .getSingleResult();
            return Optional.of(user);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public List<User> findAll(String search, Boolean active, int page, int pageSize) {
        StringBuilder jpql = new StringBuilder("SELECT u FROM User u WHERE 1=1");
        if (search != null && !search.isBlank()) {
            jpql.append(" AND (LOWER(u.username) LIKE :search OR LOWER(u.displayName) LIKE :search)");
        }
        if (active != null) jpql.append(" AND u.active = :active");
        jpql.append(" ORDER BY u.displayName");

        TypedQuery<User> query = em.createQuery(jpql.toString(), User.class);
        if (search != null && !search.isBlank()) query.setParameter("search", "%" + search.toLowerCase() + "%");
        if (active != null) query.setParameter("active", active);
        query.setFirstResult(page * pageSize);
        query.setMaxResults(pageSize);
        return query.getResultList();
    }

    public long count(String search, Boolean active) {
        StringBuilder jpql = new StringBuilder("SELECT COUNT(u) FROM User u WHERE 1=1");
        if (search != null && !search.isBlank()) {
            jpql.append(" AND (LOWER(u.username) LIKE :search OR LOWER(u.displayName) LIKE :search)");
        }
        if (active != null) jpql.append(" AND u.active = :active");

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        if (search != null && !search.isBlank()) query.setParameter("search", "%" + search.toLowerCase() + "%");
        if (active != null) query.setParameter("active", active);
        return query.getSingleResult();
    }

    public Optional<User> findById(Integer id) {
        User u = em.find(User.class, id);
        return Optional.ofNullable(u);
    }

    public void persist(User user) {
        em.persist(user);
    }

    public User merge(User user) {
        return em.merge(user);
    }

    public void delete(User user) {
        em.remove(user);
    }

    public long countAdmins() {
        return em.createQuery("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'ADMIN'", Long.class)
            .getSingleResult();
    }
}
