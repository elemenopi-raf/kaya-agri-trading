package com.kaya.agri.resource;

import com.kaya.agri.dto.CategoryResponse;
import com.kaya.agri.dto.SubcategoryResponse;
import com.kaya.agri.entity.Category;
import com.kaya.agri.entity.Subcategory;
import com.kaya.agri.repository.ProductRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.stream.Collectors;

@Path("/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryResource {

    @Inject
    private ProductRepository productRepository;

    @GET
    public Response listAll() {
        List<Category> categories = productRepository.findAllCategories();
        List<CategoryResponse> result = categories.stream()
            .map(c -> new CategoryResponse(
                c.getId(), c.getName(), c.getDescription(),
                c.getSubcategories().stream()
                    .map(s -> new SubcategoryResponse(
                        s.getId(), s.getName(), s.getDescription(), c.getId()))
                    .collect(Collectors.toList())
            ))
            .collect(Collectors.toList());
        return Response.ok(result).build();
    }

    @GET
    @Path("/{categoryId}/subcategories")
    public Response listSubcategories(@PathParam("categoryId") Integer categoryId) {
        List<Subcategory> subcategories = productRepository.findSubcategoriesByCategory(categoryId);
        List<SubcategoryResponse> result = subcategories.stream()
            .map(s -> new SubcategoryResponse(
                s.getId(), s.getName(), s.getDescription(), categoryId))
            .collect(Collectors.toList());
        return Response.ok(result).build();
    }
}
