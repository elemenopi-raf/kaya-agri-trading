package com.kaya.agri.dto;

import java.util.List;

public class CategoryResponse {
    private Integer id;
    private String name;
    private String description;
    private List<SubcategoryResponse> subcategories;

    public CategoryResponse() {}

    public CategoryResponse(Integer id, String name, String description, List<SubcategoryResponse> subcategories) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.subcategories = subcategories;
    }

    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public List<SubcategoryResponse> getSubcategories() { return subcategories; }
}
