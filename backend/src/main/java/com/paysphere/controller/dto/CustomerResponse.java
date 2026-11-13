package com.paysphere.controller.dto;

import com.paysphere.domain.Customer;
import com.paysphere.domain.PaymentInstrument;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class CustomerResponse {

    private Long id;
    private String fullName;
    private String email;
    private List<PaymentInstrumentResponse> instruments;

    public CustomerResponse() {
    }

    public CustomerResponse(Customer customer) {
        if (customer != null) {
            this.id = customer.getId();
            this.fullName = customer.getFullName();
            this.email = customer.getEmail();
            if (customer.getInstruments() != null) {
                this.instruments = customer.getInstruments().stream()
                        .map(PaymentInstrumentResponse::new)
                        .collect(Collectors.toList());
            } else {
                this.instruments = Collections.emptyList();
            }
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<PaymentInstrumentResponse> getInstruments() {
        return instruments;
    }

    public void setInstruments(List<PaymentInstrumentResponse> instruments) {
        this.instruments = instruments;
    }
}

