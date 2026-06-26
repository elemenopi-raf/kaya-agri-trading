package com.kaya.agri.resource;

import com.kaya.agri.dto.PagedResponse;
import com.kaya.agri.dto.StockMovementRequest;
import com.kaya.agri.dto.StockMovementResponse;
import com.kaya.agri.entity.StockMovement;
import com.kaya.agri.service.StockMovementService;
import com.kaya.agri.security.RoleUtil;
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
            @QueryParam("from") String from,
            @QueryParam("to") String to,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("pageSize") @DefaultValue("20") int pageSize) {
        LocalDate fromDate = from != null && !from.isBlank() ? LocalDate.parse(from) : null;
        LocalDate toDate = to != null && !to.isBlank() ? LocalDate.parse(to) : null;
        PagedResponse<StockMovementResponse> result = service.list(productId, movementType, fromDate, toDate, page, pageSize);
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

    @GET
    @Path("/export")
    @Produces(MediaType.TEXT_PLAIN)
    public Response exportCsv(
            @QueryParam("productId") Integer productId,
            @QueryParam("movementType") String movementType,
            @QueryParam("from") String from,
            @QueryParam("to") String to,
            @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER");
        LocalDate fromDate = from != null && !from.isBlank() ? LocalDate.parse(from) : null;
        LocalDate toDate = to != null && !to.isBlank() ? LocalDate.parse(to) : null;
        List<StockMovement> movements = service.findAllForExport(productId, movementType, fromDate, toDate);
        String csv = movements.stream()
            .map(sm -> {
                String product = sm.getProduct() != null ? escapeCsv(sm.getProduct().getName()) : "";
                String sku = sm.getProduct() != null ? escapeCsv(sm.getProduct().getSku()) : "";
                String uom = sm.getProduct() != null && sm.getProduct().getUnitOfMeasure() != null
                    ? sm.getProduct().getUnitOfMeasure().getAbbreviation() : "";
                String batch = sm.getBatch() != null ? escapeCsv(sm.getBatch().getBatchCode()) : "";
                String source = "";
                if (sm.getReferenceType() != null && sm.getReferenceId() != null) {
                    source = sm.getReferenceType() + " #" + sm.getReferenceId();
                }
                String creator = sm.getCreatedBy() != null ? escapeCsv(sm.getCreatedBy().getDisplayName()) : "";
                return String.join(",",
                    sm.getCreatedAt() != null ? sm.getCreatedAt().toString() : "",
                    escapeCsv(sm.getMovementType()),
                    product,
                    sku,
                    sm.getQuantity().toPlainString(),
                    escapeCsv(uom),
                    batch,
                    escapeCsv(source),
                    sm.getNotes() != null ? escapeCsv(sm.getNotes()) : "",
                    creator);
            })
            .collect(Collectors.joining("\n"));
        String header = "Date,Type,Product,SKU,Qty,UoM,Batch,Source,Notes,Created By\n";
        return Response.ok(header + csv)
            .header("Content-Disposition", "attachment; filename=stock-movements.csv")
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

    @POST
    public Response create(StockMovementRequest request, @Context SecurityContext ctx) {
        RoleUtil.requireRole(ctx, "ADMIN", "MANAGER");
        try {
            String username = ctx.getUserPrincipal().getName();
            StockMovementResponse created = service.create(request, username);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage()))
                .build();
        }
    }
}
