package com.kaya.agri.resource;

import com.kaya.agri.dto.PagedResponse;
import com.kaya.agri.dto.ProductRequest;
import com.kaya.agri.dto.ProductResponse;
import com.kaya.agri.service.ProductService;
import com.kaya.agri.security.RoleUtil;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {

    @Inject
    private ProductService productService;

    @GET
    public Response list(
            @QueryParam("search") String search,
            @QueryParam("categoryId") Integer categoryId,
            @QueryParam("subcategoryId") Integer subcategoryId,
            @QueryParam("active") Boolean active,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
        PagedResponse<ProductResponse> result = productService.list(
            search, categoryId, subcategoryId, active, page, pageSize);
        return Response.ok(result).build();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Integer id) {
        return productService.getById(id)
            .map(Response::ok)
            .orElse(Response.status(Response.Status.NOT_FOUND))
            .build();
    }

    @GET
    @Path("/low-stock")
    public Response lowStock(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
        return Response.ok(productService.lowStock(page, pageSize)).build();
    }

    @POST
    public Response create(ProductRequest request, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER");
        try {
            ProductResponse created = productService.create(request);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("{\"error\":\"" + e.getMessage() + "\"}")
                .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Integer id, ProductRequest request, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER");
        return productService.update(id, request)
            .map(Response::ok)
            .orElse(Response.status(Response.Status.NOT_FOUND))
            .build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Integer id, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER");
        if (productService.delete(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
