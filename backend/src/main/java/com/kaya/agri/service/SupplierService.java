package com.kaya.agri.service;

import com.kaya.agri.dto.PagedResponse;
import com.kaya.agri.dto.SupplierRequest;
import com.kaya.agri.dto.SupplierResponse;
import com.kaya.agri.entity.Supplier;
import com.kaya.agri.repository.SupplierRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Stateless
public class SupplierService {

    @Inject
    private SupplierRepository repository;

    public PagedResponse<SupplierResponse> list(String search, Boolean active, int page, int pageSize) {
        List<Supplier> suppliers = repository.findAll(search, active, page, pageSize);
        long total = repository.count(search, active);
        return new PagedResponse<>(
            suppliers.stream().map(this::toResponse).collect(Collectors.toList()),
            total, page, pageSize);
    }

    public Optional<SupplierResponse> getById(Integer id) {
        return repository.findById(id).map(this::toResponse);
    }

    public SupplierResponse create(SupplierRequest request) {
        Supplier s = new Supplier();
        s.setName(request.getName());
        s.setContactPerson(request.getContactPerson());
        s.setPhone(request.getPhone());
        s.setEmail(request.getEmail());
        s.setAddress(request.getAddress());
        s.setActive(request.getActive() != null ? request.getActive() : true);
        repository.persist(s);
        return toResponse(s);
    }

    public Optional<SupplierResponse> update(Integer id, SupplierRequest request) {
        return repository.findById(id).map(s -> {
            s.setName(request.getName());
            s.setContactPerson(request.getContactPerson());
            s.setPhone(request.getPhone());
            s.setEmail(request.getEmail());
            s.setAddress(request.getAddress());
            if (request.getActive() != null) s.setActive(request.getActive());
            return toResponse(repository.merge(s));
        });
    }

    public boolean delete(Integer id) {
        return repository.findById(id).map(s -> { repository.delete(s); return true; }).orElse(false);
    }

    private SupplierResponse toResponse(Supplier s) {
        return new SupplierResponse(s.getId(), s.getName(), s.getContactPerson(), s.getPhone(),
            s.getEmail(), s.getAddress(), s.getActive(), s.getCreatedAt());
    }
}
