package com.kaya.agri.service;

import com.kaya.agri.entity.Role;
import com.kaya.agri.entity.User;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;
import java.util.Set;

@Stateless
public class SeedService {

    @PersistenceContext
    private EntityManager em;

    @Inject
    private PasswordService passwordService;

    public void seed() {
        seedRole("ADMIN");
        seedRole("MANAGER");
        seedRole("CASHIER");

        seedOrUpdateUser("admin", "admin123", "Admin User", "admin@kaya.com",
            Set.of("ADMIN", "MANAGER", "CASHIER"));
        seedOrUpdateUser("manager", "manager123", "Manager User", "manager@kaya.com",
            Set.of("MANAGER"));
        seedOrUpdateUser("cashier", "cashier123", "Cashier User", "cashier@kaya.com",
            Set.of("CASHIER"));

        removeObsoleteRoles();
    }

    private void seedRole(String name) {
        try {
            em.createQuery("SELECT r FROM Role r WHERE r.name = :name", Role.class)
                .setParameter("name", name).getSingleResult();
        } catch (jakarta.persistence.NoResultException e) {
            Role role = new Role();
            role.setName(name);
            em.persist(role);
        }
    }

    private void removeObsoleteRoles() {
        for (String obsolete : List.of("CLERK", "VIEWER")) {
            try {
                Role role = em.createQuery("SELECT r FROM Role r WHERE r.name = :name", Role.class)
                    .setParameter("name", obsolete).getSingleResult();
                em.createNativeQuery("DELETE FROM user_roles WHERE role_id = ?1")
                    .setParameter(1, role.getId()).executeUpdate();
                em.remove(role);
            } catch (jakarta.persistence.NoResultException ignored) {}
        }
    }

    private void seedOrUpdateUser(String username, String password, String displayName, String email, Set<String> roleNames) {
        try {
            User existing = em.createQuery("SELECT u FROM User u WHERE u.username = :username", User.class)
                .setParameter("username", username).getSingleResult();
            existing.setPasswordHash(passwordService.hash(password));
            existing.setDisplayName(displayName);
            existing.setEmail(email);
            existing.setActive(true);
            existing.getRoles().clear();
            for (String rn : roleNames) {
                try {
                    Role role = em.createQuery("SELECT r FROM Role r WHERE r.name = :name", Role.class)
                        .setParameter("name", rn).getSingleResult();
                    existing.getRoles().add(role);
                } catch (jakarta.persistence.NoResultException ignored) {}
            }
        } catch (jakarta.persistence.NoResultException e) {
            User user = new User();
            user.setUsername(username);
            user.setPasswordHash(passwordService.hash(password));
            user.setDisplayName(displayName);
            user.setEmail(email);
            user.setActive(true);
            for (String rn : roleNames) {
                try {
                    Role role = em.createQuery("SELECT r FROM Role r WHERE r.name = :name", Role.class)
                        .setParameter("name", rn).getSingleResult();
                    user.getRoles().add(role);
                } catch (jakarta.persistence.NoResultException ignored) {}
            }
            em.persist(user);
        }
    }
}
