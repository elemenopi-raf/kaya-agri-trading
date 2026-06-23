package com.kaya.agri.service;

import com.kaya.agri.dto.CustomerRequest;
import com.kaya.agri.dto.CustomerResponse;
import com.kaya.agri.dto.PagedResponse;
import com.kaya.agri.entity.Customer;
import com.kaya.agri.repository.CustomerRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Stateless
public class CustomerService {

    @Inject
    private CustomerRepository repository;

    public PagedResponse<CustomerResponse> list(String search, Boolean active, int page, int pageSize) {
        List<Customer> customers = repository.findAll(search, active, page, pageSize);
        long total = repository.count(search, active);
        return new PagedResponse<>(
            customers.stream().map(this::toResponse).collect(Collectors.toList()),
            total, page, pageSize);
    }

    public Optional<CustomerResponse> getById(Integer id) {
        return repository.findById(id).map(this::toResponse);
    }

    public List<CustomerResponse> search(String search) {
        return repository.findByNameSearch(search).stream()
            .map(this::toResponse).collect(Collectors.toList());
    }

    public CustomerResponse create(CustomerRequest request) {
        Customer c = new Customer();
        c.setName(request.getName());
        c.setPhone(request.getPhone());
        c.setEmail(request.getEmail());
        c.setAddress(request.getAddress());
        c.setActive(request.getActive() != null ? request.getActive() : true);
        repository.persist(c);
        return toResponse(c);
    }

    public Optional<CustomerResponse> update(Integer id, CustomerRequest request) {
        return repository.findById(id).map(c -> {
            c.setName(request.getName());
            c.setPhone(request.getPhone());
            c.setEmail(request.getEmail());
            c.setAddress(request.getAddress());
            if (request.getActive() != null) c.setActive(request.getActive());
            return toResponse(repository.merge(c));
        });
    }

    public boolean delete(Integer id) {
        return repository.findById(id).map(c -> { repository.delete(c); return true; }).orElse(false);
    }

    private CustomerResponse toResponse(Customer c) {
        return new CustomerResponse(c.getId(), c.getName(), c.getPhone(), c.getEmail(),
            c.getAddress(), c.getActive(), c.getCreatedAt());
    }
}
