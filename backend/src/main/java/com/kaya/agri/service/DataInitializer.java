package com.kaya.agri.service;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.EJB;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;

@Singleton
@Startup
public class DataInitializer {

    @EJB
    private SeedService seedService;

    @PostConstruct
    public void init() {
        seedService.seed();
    }
}
