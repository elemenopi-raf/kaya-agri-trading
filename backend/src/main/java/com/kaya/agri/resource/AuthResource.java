package com.kaya.agri.resource;

import com.kaya.agri.dto.LoginRequest;
import com.kaya.agri.dto.LoginResponse;
import com.kaya.agri.entity.User;
import com.kaya.agri.repository.UserRepository;
import com.kaya.agri.security.JwtProvider;
import com.kaya.agri.service.UserService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.Map;
import java.util.Set;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    private UserService userService;

    @Inject
    private UserRepository userRepository;

    @Inject
    private JwtProvider jwtProvider;

    @POST
    @Path("/login")
    public Response login(LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("{\"error\":\"username and password required\"}")
                .build();
        }

        return userService.authenticate(request.getUsername(), request.getPassword())
            .map(user -> {
                Set<String> roles = userService.getRoleNames(user);
                String token = jwtProvider.generateToken(user.getUsername(), roles);
                return Response.ok(new LoginResponse(
                    token, user.getUsername(), user.getDisplayName(), roles
                )).build();
            })
            .orElse(Response.status(Response.Status.UNAUTHORIZED)
                .entity("{\"error\":\"invalid credentials\"}")
                .build());
    }

    @GET
    @Path("/me")
    public Response me(@Context SecurityContext securityContext) {
        String username = securityContext.getUserPrincipal().getName();
        return userRepository.findByUsername(username)
            .map(user -> Response.ok(Map.of(
                "username", user.getUsername(),
                "displayName", user.getDisplayName(),
                "roles", userService.getRoleNames(user)
            )).build())
            .orElse(Response.status(Response.Status.UNAUTHORIZED).build());
    }
}
