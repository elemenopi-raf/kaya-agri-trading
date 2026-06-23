package com.kaya.agri.resource;

import com.kaya.agri.dto.PagedResponse;
import com.kaya.agri.dto.SupplierRequest;
import com.kaya.agri.dto.SupplierResponse;
import com.kaya.agri.service.SupplierService;
import com.kaya.agri.security.RoleUtil;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

@Path("/suppliers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SupplierResource {

    @Inject
    private SupplierService service;

    @GET
    public Response list(
            @QueryParam("search") String search,
            @QueryParam("active") Boolean active,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
        return Response.ok(service.list(search, active, page, pageSize)).build();
    }

    @GET @Path("/{id}")
    public Response getById(@PathParam("id") Integer id) {
        return service.getById(id)
            .map(Response::ok).orElse(Response.status(Response.Status.NOT_FOUND)).build();
    }

    @POST
    public Response create(SupplierRequest request, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER");
        return Response.status(Response.Status.CREATED).entity(service.create(request)).build();
    }

    @PUT @Path("/{id}")
    public Response update(@PathParam("id") Integer id, SupplierRequest request, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER");
        return service.update(id, request)
            .map(Response::ok).orElse(Response.status(Response.Status.NOT_FOUND)).build();
    }

    @DELETE @Path("/{id}")
    public Response delete(@PathParam("id") Integer id, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER");
        return service.delete(id) ? Response.noContent().build() : Response.status(Response.Status.NOT_FOUND).build();
    }
}
