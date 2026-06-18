package com.kaya.agri.dto;

import java.util.List;

public class PagedResponse<T> {
    private List<T> items;
    private long totalCount;
    private int page;
    private int pageSize;

    public PagedResponse() {}

    public PagedResponse(List<T> items, long totalCount, int page, int pageSize) {
        this.items = items;
        this.totalCount = totalCount;
        this.page = page;
        this.pageSize = pageSize;
    }

    public List<T> getItems() { return items; }
    public long getTotalCount() { return totalCount; }
    public int getPage() { return page; }
    public int getPageSize() { return pageSize; }
}
