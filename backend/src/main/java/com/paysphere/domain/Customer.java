package com.paysphere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    /**
     * AGGREGATION: A Customer "has" saved PaymentInstrument records.
     * The payment instruments maintain an independent lifecycle from the Customer.
     * Notice the absence of CascadeType.REMOVE or orphanRemoval: deleting a Customer
     * does not implicitly cascade-destroy payment instruments.
     * Foreign key ownership resides in the child entity (PaymentInstrument.customer).
     */
    @OneToMany(mappedBy = "customer", fetch = FetchType.EAGER)
    private List<PaymentInstrument> instruments = new ArrayList<>();

    public Customer() {
    }

    public Customer(String fullName, String email) {
        this.fullName = fullName;
        this.email = email;
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

    public List<PaymentInstrument> getInstruments() {
        return Collections.unmodifiableList(instruments);
    }

    public void setInstruments(List<PaymentInstrument> instruments) {
        this.instruments = instruments != null ? instruments : new ArrayList<>();
    }

    public void addInstrument(PaymentInstrument instrument) {
        if (instrument != null) {
            instruments.add(instrument);
            instrument.setCustomer(this);
        }
    }

    public void removeInstrument(PaymentInstrument instrument) {
        if (instrument != null) {
            instruments.remove(instrument);
            instrument.setCustomer(null);
        }
    }
}
