package com.kaya.agri.resource;

import com.kaya.agri.dto.PagedResponse;
import com.kaya.agri.dto.StockMovementRequest;
import com.kaya.agri.dto.StockMovementResponse;
import com.kaya.agri.service.StockMovementService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

@Path("/stock-movements")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class StockMovementResource {

    @Inject
    private StockMovementService service;

    @GET
    public Response list(
            @QueryParam("productId") Integer productId,
            @QueryParam("movementType") String movementType,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
        PagedResponse<StockMovementResponse> result = service.list(productId, movementType, page, pageSize);
        return Response.ok(result).build();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Integer id) {
        return service.getById(id)
            .map(Response::ok)
            .orElse(Response.status(Response.Status.NOT_FOUND))
            .build();
    }

    @POST
    public Response create(StockMovementRequest request, @Context SecurityContext ctx) {
        try {
            String username = ctx.getUserPrincipal().getName();
            StockMovementResponse created = service.create(request, username);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("{\"error\":\"" + e.getMessage() + "\"}")
                .build();
        }
    }
}
