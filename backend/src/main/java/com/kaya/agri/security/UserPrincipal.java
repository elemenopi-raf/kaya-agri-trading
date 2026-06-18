package com.kaya.agri.security;

import jakarta.ws.rs.core.SecurityContext;

import java.security.Principal;
import java.util.Set;

public class UserPrincipal implements Principal {

    private final String name;
    private final Set<String> roles;

    public UserPrincipal(String name, Set<String> roles) {
        this.name = name;
        this.roles = roles;
    }

    @Override
    public String getName() {
        return name;
    }

    public boolean isInRole(String role) {
        return roles.contains(role);
    }

    public Set<String> getRoles() {
        return roles;
    }

    public SecurityContext toSecurityContext() {
        return new SecurityContext() {
            @Override
            public Principal getUserPrincipal() {
                return UserPrincipal.this;
            }

            @Override
            public boolean isUserInRole(String role) {
                return UserPrincipal.this.isInRole(role);
            }

            @Override
            public boolean isSecure() {
                return false;
            }

            @Override
            public String getAuthenticationScheme() {
                return "Bearer";
            }
        };
    }
}
