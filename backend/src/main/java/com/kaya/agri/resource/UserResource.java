package com.kaya.agri.resource;

import com.kaya.agri.dto.UserRequest;
import com.kaya.agri.service.UserService;
import com.kaya.agri.security.RoleUtil;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import java.util.Map;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    private UserService service;

    @GET
    public Response list(
            @Context SecurityContext ctx,
            @QueryParam("search") String search,
            @QueryParam("active") Boolean active,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
        RoleUtil.requireRole(ctx, "ADMIN");
        return Response.ok(service.list(search, active, page, pageSize)).build();
    }

    @GET @Path("/{id}")
    public Response getById(@Context SecurityContext ctx, @PathParam("id") Integer id) {
        RoleUtil.requireRole(ctx, "ADMIN");
        return service.getById(id)
            .map(Response::ok).orElse(Response.status(Response.Status.NOT_FOUND)).build();
    }

    @POST
    public Response create(@Context SecurityContext ctx, UserRequest request) {
        RoleUtil.requireRole(ctx, "ADMIN");
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "Username is required")).build();
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "Password is required")).build();
        }
        if (request.getPassword().length() < 6) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "Password must be at least 6 characters")).build();
        }
        if (request.getDisplayName() == null || request.getDisplayName().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "Display name is required")).build();
        }
        if (service.list(request.getUsername(), null, 0, 1).getItems().stream()
                .anyMatch(u -> u.getUsername().equals(request.getUsername()))) {
            return Response.status(Response.Status.CONFLICT)
                .entity(Map.of("error", "Username already exists")).build();
        }
        return Response.status(Response.Status.CREATED).entity(service.create(request)).build();
    }

    @PUT @Path("/{id}")
    public Response update(@Context SecurityContext ctx, @PathParam("id") Integer id, UserRequest request) {
        RoleUtil.requireRole(ctx, "ADMIN");
        if (request.getDisplayName() == null || request.getDisplayName().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "Display name is required")).build();
        }
        if (request.getPassword() != null && !request.getPassword().isBlank() && request.getPassword().length() < 6) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "Password must be at least 6 characters")).build();
        }
        return service.update(id, request)
            .map(Response::ok).orElse(Response.status(Response.Status.NOT_FOUND)).build();
    }

    @DELETE @Path("/{id}")
    public Response delete(@Context SecurityContext ctx, @PathParam("id") Integer id) {
        RoleUtil.requireRole(ctx, "ADMIN");
        String currentUsername = ctx.getUserPrincipal().getName();
        try {
            service.delete(id, currentUsername);
            return Response.noContent().build();
        } catch (Exception e) {
            String root = e.getMessage();
            if (root == null && e.getCause() != null) root = e.getCause().getMessage();
            if (root == null) root = "";
            if (root.contains("own account")) {
                return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "Cannot delete your own account")).build();
            }
            if (root.contains("last admin")) {
                return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "Cannot delete the last admin account")).build();
            }
            if (root.contains("not found")) {
                return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "User not found")).build();
            }
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "Cannot delete user — may be referenced by other records")).build();
        }
    }
}
