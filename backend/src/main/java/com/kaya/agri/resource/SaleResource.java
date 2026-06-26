package com.kaya.agri.resource;

import com.kaya.agri.dto.*;
import com.kaya.agri.entity.Sale;
import com.kaya.agri.security.RoleUtil;
import com.kaya.agri.service.SaleService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/sales")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SaleResource {

    @Inject
    private SaleService service;

    @GET
    public Response list(
            @QueryParam("customerId") Integer customerId,
            @QueryParam("status") String status,
            @QueryParam("from") String from,
            @QueryParam("to") String to,
            @QueryParam("search") String search,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
        LocalDate fromDate = from != null && !from.isBlank() ? LocalDate.parse(from) : null;
        LocalDate toDate = to != null && !to.isBlank() ? LocalDate.parse(to) : null;
        return Response.ok(service.list(customerId, status, fromDate, toDate, search, page, pageSize)).build();
    }

    @GET @Path("/{id}")
    public Response getById(@PathParam("id") Integer id) {
        return service.getById(id)
            .map(Response::ok).orElse(Response.status(Response.Status.NOT_FOUND)).build();
    }

    @POST
    public Response create(SaleRequest request, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER", "CASHIER");
        try {
            SaleResponse created = service.create(request, ctx.getUserPrincipal().getName());
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage()))
                .build();
        }
    }

    @PUT @Path("/{id}/payment")
    public Response addPayment(@PathParam("id") Integer id, PaymentRequest request,
                                @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER", "CASHIER");
        try {
            return service.addPayment(id, request, ctx.getUserPrincipal().getName())
                .map(Response::ok)
                .orElse(Response.status(Response.Status.NOT_FOUND))
                .build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage()))
                .build();
        }
    }

    @PUT @Path("/{id}/cancel")
    public Response cancel(@PathParam("id") Integer id, String body, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER", "CASHIER");
        try {
            String reason = null;
            if (body != null && !body.isBlank()) {
                reason = body.replaceAll(".*\"reason\"\\s*:\\s*\"", "").replaceAll("\".*", "").trim();
                if (reason.isEmpty()) reason = null;
            }
            return service.cancel(id, reason)
                .map(Response::ok)
                .orElse(Response.status(Response.Status.NOT_FOUND))
                .build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage()))
                .build();
        }
    }

    @POST @Path("/{id}/return")
    public Response returnItems(@PathParam("id") Integer id, ReturnRequest request,
                                 @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER", "CASHIER");
        try {
            SaleResponse result = service.returnItems(id, request, ctx.getUserPrincipal().getName());
            return Response.ok(result).build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage()))
                .build();
        }
    }

    @GET @Path("/export")
    @Produces(MediaType.TEXT_PLAIN)
    public Response exportCsv(
            @QueryParam("from") String from,
            @QueryParam("to") String to,
            @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER");
        LocalDate fromDate = from != null && !from.isBlank() ? LocalDate.parse(from) : null;
        LocalDate toDate = to != null && !to.isBlank() ? LocalDate.parse(to) : null;
        List<Sale> sales = service.findAllForExport(fromDate, toDate);
        String csv = sales.stream()
            .map(s -> {
                String customerName = s.getCustomer() != null ? escapeCsv(s.getCustomer().getName()) : "Walk-in";
                String creator = s.getCreatedBy() != null ? escapeCsv(s.getCreatedBy().getDisplayName()) : "";
                return String.join(",",
                    String.valueOf(s.getId()),
                    customerName,
                    s.getSaleDate().toString(),
                    s.getTotalAmount().toString(),
                    s.getPaidAmount().toString(),
                    escapeCsv(s.getStatus()),
                    s.getNotes() != null ? escapeCsv(s.getNotes()) : "",
                    creator);
            })
            .collect(Collectors.joining("\n"));
        String header = "ID,Customer,Date,Total,Paid,Status,Notes,Created By\n";
        return Response.ok(header + csv)
            .header("Content-Disposition", "attachment; filename=sales.csv")
            .build();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")
            || value.startsWith("=") || value.startsWith("+") || value.startsWith("-") || value.startsWith("@")) {
            return "\"" + value.replace("\"", "\"\"").replace("\r", "") + "\"";
        }
        return value;
    }
}
