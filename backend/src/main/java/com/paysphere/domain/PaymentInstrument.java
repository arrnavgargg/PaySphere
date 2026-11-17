package com.paysphere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment_instruments")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class PaymentInstrument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "instrument_label", nullable = false)
    private String instrumentLabel;

    /**
     * Foreign Key Owner: The 'payment_instruments' table holds the 'customer_id' foreign key
     * column referencing the 'customers' table ('customers.id').
     * This establishes the child side of the Customer -> PaymentInstrument aggregation relationship.
     */
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    public PaymentInstrument() {
    }

    public PaymentInstrument(String instrumentLabel, Customer customer) {
        this.instrumentLabel = instrumentLabel;
        this.customer = customer;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInstrumentLabel() {
        return instrumentLabel;
    }

    public void setInstrumentLabel(String instrumentLabel) {
        this.instrumentLabel = instrumentLabel;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
}
