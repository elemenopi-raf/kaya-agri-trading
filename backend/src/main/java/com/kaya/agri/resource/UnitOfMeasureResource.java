package com.kaya.agri.resource;

import com.kaya.agri.entity.UnitOfMeasure;
import com.kaya.agri.repository.ProductRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/uoms")
@Produces(MediaType.APPLICATION_JSON)
public class UnitOfMeasureResource {

    @Inject
    private ProductRepository productRepository;

    @GET
    public Response listAll() {
        List<UnitOfMeasure> uoms = productRepository.findAllUoms();
        return Response.ok(uoms).build();
    }
}
