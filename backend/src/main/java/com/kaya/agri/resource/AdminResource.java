package com.kaya.agri.resource;

import com.kaya.agri.service.ReSeedService;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/admin")
@Produces(MediaType.APPLICATION_JSON)
public class AdminResource {

    @Inject
    private ReSeedService reSeedService;

    @POST
    @Path("/re-seed")
    public Response reSeed() {
        try {
            reSeedService.reSeed();
            return Response.ok("{\"message\":\"Users re-seeded successfully\"}").build();
        } catch (Exception e) {
            return Response.serverError()
                .entity("{\"error\":\"" + e.getMessage() + "\"}")
                .build();
        }
    }
}
