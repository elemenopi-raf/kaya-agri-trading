package com.kaya.agri.service;

import com.kaya.agri.dto.PagedResponse;
import com.kaya.agri.dto.UserRequest;
import com.kaya.agri.dto.UserResponse;
import com.kaya.agri.entity.Role;
import com.kaya.agri.entity.User;
import com.kaya.agri.repository.UserRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Stateless
public class UserService {

    @PersistenceContext
    private EntityManager em;

    @Inject
    private UserRepository userRepository;

    @Inject
    private PasswordService passwordService;

    public Optional<User> authenticate(String username, String password) {
        return userRepository.findByUsername(username)
            .filter(user -> user.getActive())
            .filter(user -> passwordService.verify(password, user.getPasswordHash()));
    }

    public Set<String> getRoleNames(User user) {
        return user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toSet());
    }

    public PagedResponse<UserResponse> list(String search, Boolean active, int page, int pageSize) {
        List<User> users = userRepository.findAll(search, active, page, pageSize);
        long total = userRepository.count(search, active);
        return new PagedResponse<>(
            users.stream().map(this::toResponse).collect(Collectors.toList()),
            total, page, pageSize);
    }

    public Optional<UserResponse> getById(Integer id) {
        return userRepository.findById(id).map(this::toResponse);
    }

    public UserResponse create(UserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordService.hash(request.getPassword()));
        user.setDisplayName(request.getDisplayName());
        user.setEmail(request.getEmail());
        user.setActive(request.getActive() != null ? request.getActive() : true);
        user.setRoles(resolveRoles(request.getRoles()));
        userRepository.persist(user);
        return toResponse(user);
    }

    public Optional<UserResponse> update(Integer id, UserRequest request) {
        return userRepository.findById(id).map(user -> {
            user.setDisplayName(request.getDisplayName());
            user.setEmail(request.getEmail());
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                if (request.getPassword().length() < 6) {
                    throw new IllegalArgumentException("Password must be at least 6 characters");
                }
                user.setPasswordHash(passwordService.hash(request.getPassword()));
            }
            if (request.getActive() != null) user.setActive(request.getActive());
            if (request.getRoles() != null) user.setRoles(resolveRoles(request.getRoles()));
            return toResponse(userRepository.merge(user));
        });
    }

    public boolean delete(Integer id, String currentUsername) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getUsername().equals(currentUsername)) {
            throw new IllegalStateException("Cannot delete your own account");
        }

        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
        if (isAdmin && userRepository.countAdmins() <= 1) {
            throw new IllegalStateException("Cannot delete the last admin account");
        }

        userRepository.delete(user);
        return true;
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        if (roleNames == null) return roles;
        for (String name : roleNames) {
            try {
                Role role = em.createQuery("SELECT r FROM Role r WHERE r.name = :name", Role.class)
                    .setParameter("name", name).getSingleResult();
                roles.add(role);
            } catch (jakarta.persistence.NoResultException ignored) {}
        }
        return roles;
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getDisplayName(), u.getEmail(),
            u.getActive(), getRoleNames(u), u.getCreatedAt());
    }
}
