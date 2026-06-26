package com.kaya.agri.resource;

import com.kaya.agri.dto.PurchaseOrderRequest;
import com.kaya.agri.dto.PurchaseOrderResponse;
import com.kaya.agri.service.PurchaseOrderService;
import com.kaya.agri.security.RoleUtil;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.Map;

@Path("/purchase-orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PurchaseOrderResource {

    @Inject
    private PurchaseOrderService service;

    @GET
    public Response list(
            @QueryParam("status") String status,
            @QueryParam("supplierId") Integer supplierId,
            @QueryParam("search") String search,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
        return Response.ok(service.list(status, supplierId, search, page, pageSize)).build();
    }

    @GET @Path("/{id}")
    public Response getById(@PathParam("id") Integer id) {
        return service.getById(id)
            .map(Response::ok).orElse(Response.status(Response.Status.NOT_FOUND)).build();
    }

    @POST
    public Response create(PurchaseOrderRequest request, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER");
        try {
            PurchaseOrderResponse created = service.create(request, ctx.getUserPrincipal().getName());
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage()))
                .build();
        }
    }

    @PUT @Path("/{id}/status")
    public Response updateStatus(@PathParam("id") Integer id, Map<String, String> body,
                                  @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER");
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "status required"))
                .build();
        }
        try {
            return service.updateStatus(id, newStatus, ctx.getUserPrincipal().getName())
                .map(Response::ok)
                .orElse(Response.status(Response.Status.NOT_FOUND))
                .build();
        } catch (IllegalStateException | IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage()))
                .build();
        }
    }
}
