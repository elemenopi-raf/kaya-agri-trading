package com.kaya.agri.service;

import com.kaya.agri.entity.Role;
import com.kaya.agri.entity.User;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import java.util.Set;

@Singleton
@Startup
@Transactional
public class DataInitializer {

    @PersistenceContext
    private EntityManager em;

    @Inject
    private PasswordService passwordService;

    @PostConstruct
    public void init() {
        if (em.createQuery("SELECT COUNT(u) FROM User u", Long.class).getSingleResult() > 0) return;

        Role adminRole = em.createQuery("SELECT r FROM Role r WHERE r.name = 'ADMIN'", Role.class)
            .getSingleResult();
        Role clerkRole = em.createQuery("SELECT r FROM Role r WHERE r.name = 'CLERK'", Role.class)
            .getSingleResult();
        Role viewerRole = em.createQuery("SELECT r FROM Role r WHERE r.name = 'VIEWER'", Role.class)
            .getSingleResult();

        User admin = new User();
        admin.setUsername("admin");
        admin.setPasswordHash(passwordService.hash("admin123"));
        admin.setDisplayName("Admin User");
        admin.setEmail("admin@kaya.com");
        admin.setActive(true);
        admin.setRoles(Set.of(adminRole, clerkRole, viewerRole));
        em.persist(admin);
    }
}
