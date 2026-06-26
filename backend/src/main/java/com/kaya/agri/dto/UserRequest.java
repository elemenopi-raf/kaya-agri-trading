package com.kaya.agri.dto;

import java.util.Set;

public class UserRequest {
    private String username;
    private String displayName;
    private String email;
    private String password;
    private Set<String> roles;
    private Boolean active;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
