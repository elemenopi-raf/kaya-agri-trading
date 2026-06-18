package com.kaya.agri.service;

import com.kaya.agri.entity.Role;
import com.kaya.agri.entity.User;
import com.kaya.agri.repository.UserRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Stateless
public class UserService {

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
}
