package com.kaya.agri.resource;

import com.kaya.agri.dto.CustomerRequest;
import com.kaya.agri.dto.CustomerResponse;
import com.kaya.agri.dto.PagedResponse;
import com.kaya.agri.security.RoleUtil;
import com.kaya.agri.service.CustomerService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.List;

@Path("/customers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CustomerResource {

    @Inject
    private CustomerService service;

    @GET
    public Response list(
            @QueryParam("search") String search,
            @QueryParam("active") Boolean active,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
        return Response.ok(service.list(search, active, page, pageSize)).build();
    }

    @GET
    @Path("/search")
    public Response search(@QueryParam("q") @DefaultValue("") String q) {
        List<CustomerResponse> results = service.search(q);
        return Response.ok(results).build();
    }

    @GET @Path("/{id}")
    public Response getById(@PathParam("id") Integer id) {
        return service.getById(id)
            .map(Response::ok).orElse(Response.status(Response.Status.NOT_FOUND)).build();
    }

    @POST
    public Response create(CustomerRequest request, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER", "CASHIER");
        return Response.status(Response.Status.CREATED).entity(service.create(request)).build();
    }

    @PUT @Path("/{id}")
    public Response update(@PathParam("id") Integer id, CustomerRequest request, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER", "CASHIER");
        return service.update(id, request)
            .map(Response::ok).orElse(Response.status(Response.Status.NOT_FOUND)).build();
    }

    @DELETE @Path("/{id}")
    public Response delete(@PathParam("id") Integer id, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER", "CASHIER");
        return service.delete(id) ? Response.noContent().build() : Response.status(Response.Status.NOT_FOUND).build();
    }
}
