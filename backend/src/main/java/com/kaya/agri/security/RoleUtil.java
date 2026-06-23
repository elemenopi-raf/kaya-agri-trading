package com.kaya.agri.security;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.Arrays;

public class RoleUtil {

    public static void requireRole(SecurityContext ctx, String... roles) {
        if (ctx == null || ctx.getUserPrincipal() == null) {
            throw new WebApplicationException(
                Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\":\"unauthorized\"}")
                    .build()
            );
        }
        boolean hasRole = Arrays.stream(roles).anyMatch(ctx::isUserInRole);
        if (!hasRole) {
            throw new WebApplicationException(
                Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\":\"forbidden\"}")
                    .build()
            );
        }
    }
}
