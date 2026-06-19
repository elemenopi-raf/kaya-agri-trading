package com.kaya.agri.repository;

import com.kaya.agri.entity.Payment;
import com.kaya.agri.entity.User;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

@Stateless
public class PaymentRepository {

    @PersistenceContext
    private EntityManager em;

    public List<Payment> findBySaleId(Integer saleId) {
        return em.createQuery("SELECT p FROM Payment p WHERE p.sale.id = :saleId ORDER BY p.createdAt", Payment.class)
            .setParameter("saleId", saleId).getResultList();
    }

    public User findUserByUsername(String username) {
        try {
            return em.createQuery("SELECT u FROM User u WHERE u.username = :username", User.class)
                .setParameter("username", username).getSingleResult();
        } catch (jakarta.persistence.NoResultException e) {
            return null;
        }
    }

    public void persist(Payment payment) {
        em.persist(payment);
    }
}
