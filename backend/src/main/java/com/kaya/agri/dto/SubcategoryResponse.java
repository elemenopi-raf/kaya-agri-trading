package com.kaya.agri.dto;

public class SubcategoryResponse {
    private Integer id;
    private String name;
    private String description;
    private Integer categoryId;

    public SubcategoryResponse() {}

    public SubcategoryResponse(Integer id, String name, String description, Integer categoryId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.categoryId = categoryId;
    }

    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Integer getCategoryId() { return categoryId; }
}
