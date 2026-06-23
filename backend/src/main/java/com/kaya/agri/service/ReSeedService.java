package com.kaya.agri.service;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;

@Stateless
public class ReSeedService {

    @EJB
    private SeedService seedService;

    public void reSeed() {
        seedService.seed();
    }
}
