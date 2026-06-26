package com.kaya.agri.resource;

import com.kaya.agri.service.ReSeedService;
import com.kaya.agri.security.RoleUtil;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import java.util.Map;

@Path("/admin")
@Produces(MediaType.APPLICATION_JSON)
public class AdminResource {

    @Inject
    private ReSeedService reSeedService;

    @POST
    @Path("/re-seed")
    public Response reSeed(@Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN");
        try {
            reSeedService.reSeed();
            return Response.ok(Map.of("message", "Users re-seeded successfully")).build();
        } catch (Exception e) {
            return Response.serverError()
                .entity(Map.of("error", "Re-seed failed"))
                .build();
        }
    }
}
