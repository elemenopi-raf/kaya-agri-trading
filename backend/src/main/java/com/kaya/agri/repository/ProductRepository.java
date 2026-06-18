package com.kaya.agri.repository;

import com.kaya.agri.entity.Category;
import com.kaya.agri.entity.Product;
import com.kaya.agri.entity.Subcategory;
import com.kaya.agri.entity.UnitOfMeasure;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import java.util.List;
import java.util.Optional;

@Stateless
public class ProductRepository {

    @PersistenceContext
    private EntityManager em;

    public List<Product> findAll(String search, Integer categoryId, Integer subcategoryId,
                                  Boolean active, int page, int pageSize) {
        StringBuilder jpql = new StringBuilder(
            "SELECT DISTINCT p FROM Product p JOIN FETCH p.subcategory s JOIN FETCH s.category c JOIN FETCH p.unitOfMeasure WHERE 1=1");

        if (search != null && !search.isBlank()) {
            jpql.append(" AND LOWER(p.name) LIKE :search");
        }
        if (categoryId != null) {
            jpql.append(" AND c.id = :categoryId");
        }
        if (subcategoryId != null) {
            jpql.append(" AND s.id = :subcategoryId");
        }
        if (active != null) {
            jpql.append(" AND p.active = :active");
        }
        jpql.append(" ORDER BY p.name");

        TypedQuery<Product> query = em.createQuery(jpql.toString(), Product.class);
        if (search != null && !search.isBlank()) {
            query.setParameter("search", "%" + search.toLowerCase() + "%");
        }
        if (categoryId != null) query.setParameter("categoryId", categoryId);
        if (subcategoryId != null) query.setParameter("subcategoryId", subcategoryId);
        if (active != null) query.setParameter("active", active);

        query.setFirstResult(page * pageSize);
        query.setMaxResults(pageSize);
        return query.getResultList();
    }

    public long count(String search, Integer categoryId, Integer subcategoryId, Boolean active) {
        StringBuilder jpql = new StringBuilder(
            "SELECT COUNT(DISTINCT p) FROM Product p JOIN p.subcategory s JOIN s.category c WHERE 1=1");

        if (search != null && !search.isBlank()) {
            jpql.append(" AND LOWER(p.name) LIKE :search");
        }
        if (categoryId != null) {
            jpql.append(" AND c.id = :categoryId");
        }
        if (subcategoryId != null) {
            jpql.append(" AND s.id = :subcategoryId");
        }
        if (active != null) {
            jpql.append(" AND p.active = :active");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        if (search != null && !search.isBlank()) {
            query.setParameter("search", "%" + search.toLowerCase() + "%");
        }
        if (categoryId != null) query.setParameter("categoryId", categoryId);
        if (subcategoryId != null) query.setParameter("subcategoryId", subcategoryId);
        if (active != null) query.setParameter("active", active);

        return query.getSingleResult();
    }

    public Optional<Product> findById(Integer id) {
        try {
            Product product = em.createQuery(
                "SELECT p FROM Product p JOIN FETCH p.subcategory s JOIN FETCH s.category c JOIN FETCH p.unitOfMeasure WHERE p.id = :id",
                Product.class)
                .setParameter("id", id)
                .getSingleResult();
            return Optional.of(product);
        } catch (jakarta.persistence.NoResultException e) {
            return Optional.empty();
        }
    }

    public void persist(Product product) {
        em.persist(product);
    }

    public Product merge(Product product) {
        return em.merge(product);
    }

    public void delete(Product product) {
        em.remove(product);
    }

    public Subcategory findSubcategoryById(Integer id) {
        return em.find(Subcategory.class, id);
    }

    public UnitOfMeasure findUomById(Integer id) {
        return em.find(UnitOfMeasure.class, id);
    }

    public List<Category> findAllCategories() {
        return em.createQuery("SELECT c FROM Category c ORDER BY c.name", Category.class).getResultList();
    }

    public List<Subcategory> findSubcategoriesByCategory(Integer categoryId) {
        return em.createQuery(
            "SELECT s FROM Subcategory s WHERE s.category.id = :categoryId ORDER BY s.name", Subcategory.class)
            .setParameter("categoryId", categoryId)
            .getResultList();
    }

    public List<UnitOfMeasure> findAllUoms() {
        return em.createQuery("SELECT u FROM UnitOfMeasure u ORDER BY u.name", UnitOfMeasure.class).getResultList();
    }

    public List<Product> findLowStock(int page, int pageSize) {
        return em.createQuery(
            "SELECT p FROM Product p JOIN FETCH p.subcategory s JOIN FETCH s.category c JOIN FETCH p.unitOfMeasure " +
            "WHERE p.active = true AND p.currentStock <= p.reorderLevel AND p.reorderLevel > 0 ORDER BY (p.currentStock / p.reorderLevel) ASC",
            Product.class)
            .setFirstResult(page * pageSize)
            .setMaxResults(pageSize)
            .getResultList();
    }

    public long countLowStock() {
        return em.createQuery(
            "SELECT COUNT(p) FROM Product p WHERE p.active = true AND p.currentStock <= p.reorderLevel AND p.reorderLevel > 0",
            Long.class)
            .getSingleResult();
    }
}
