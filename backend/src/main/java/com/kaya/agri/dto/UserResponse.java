package com.kaya.agri.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class UserResponse {
    private Integer id;
    private String username;
    private String displayName;
    private String email;
    private boolean active;
    private Set<String> roles;
    private LocalDateTime createdAt;

    public UserResponse() {}

    public UserResponse(Integer id, String username, String displayName, String email,
                        boolean active, Set<String> roles, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
        this.email = email;
        this.active = active;
        this.roles = roles;
        this.createdAt = createdAt;
    }

    public Integer getId() { return id; }
    public String getUsername() { return username; }
    public String getDisplayName() { return displayName; }
    public String getEmail() { return email; }
    public boolean isActive() { return active; }
    public Set<String> getRoles() { return roles; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
