package com.kaya.agri.dto;

import java.util.Set;

public class LoginResponse {
    private String token;
    private String username;
    private String displayName;
    private Set<String> roles;

    public LoginResponse(String token, String username, String displayName, Set<String> roles) {
        this.token = token;
        this.username = username;
        this.displayName = displayName;
        this.roles = roles;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
    public String getDisplayName() { return displayName; }
    public Set<String> getRoles() { return roles; }
}
