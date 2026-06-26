package com.kaya.agri.dto;

import java.util.List;

public class ReturnRequest {
    private List<ReturnItemRequest> items;

    public List<ReturnItemRequest> getItems() { return items; }
    public void setItems(List<ReturnItemRequest> items) { this.items = items; }
}
