package com.kaya.agri.security;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.util.Map;
import java.util.Set;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class JwtAuthFilter implements ContainerRequestFilter {

    private static final Set<String> PUBLIC_PREFIXES = Set.of(
        "auth/login", "health"
    );

    @Inject
    private JwtProvider jwtProvider;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        String path = requestContext.getUriInfo().getPath();
        String normalized = path.startsWith("/") ? path.substring(1) : path;

        if (isPublic(normalized)) return;

        String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            requestContext.abortWith(
                Response.status(Response.Status.UNAUTHORIZED)
                    .entity(Map.of("error", "unauthorized"))
                    .build()
            );
            return;
        }

        String token = authHeader.substring(7);

        try {
            Set<String> roles = jwtProvider.getRoles(token);
            String username = jwtProvider.getUsername(token);
            requestContext.setSecurityContext(
                new UserPrincipal(username, roles).toSecurityContext()
            );
        } catch (Exception e) {
            requestContext.abortWith(
                Response.status(Response.Status.UNAUTHORIZED)
                    .entity(Map.of("error", "invalid or expired token"))
                    .build()
            );
        }
    }

    private boolean isPublic(String path) {
        return PUBLIC_PREFIXES.stream().anyMatch(path::startsWith);
    }
}
