package com.kaya.agri.resource;

import com.kaya.agri.dto.*;
import com.kaya.agri.service.DashboardService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/dashboard")
@Produces(MediaType.APPLICATION_JSON)
public class DashboardResource {

    @Inject
    private DashboardService service;

    @GET
    public Response summary() {
        DashboardResponse summary = service.summary();
        return Response.ok(summary).build();
    }

    @GET
    @Path("/sales-trend")
    public Response salesTrend(@QueryParam("days") @DefaultValue("7") int days) {
        if (days < 1 || days > 90) days = 7;
        List<SalesTrendResponse> trend = service.salesTrend(days);
        return Response.ok(trend).build();
    }

    @GET
    @Path("/top-products")
    public Response topProducts(@QueryParam("limit") @DefaultValue("5") int limit) {
        if (limit < 1 || limit > 20) limit = 5;
        List<TopProductResponse> top = service.topProducts(limit);
        return Response.ok(top).build();
    }

    @GET
    @Path("/low-stock")
    public Response lowStock(@QueryParam("threshold") @DefaultValue("0") int threshold) {
        List<ProductResponse> products = service.lowStockProducts(threshold);
        return Response.ok(products).build();
    }
}
