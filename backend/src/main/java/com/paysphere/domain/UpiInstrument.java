package com.paysphere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "upi_instruments")
public class UpiInstrument extends PaymentInstrument {

    @Column(name = "upi_id", nullable = false, unique = true)
    private String upiId;

    @Column(name = "provider", nullable = false)
    private String provider;

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }
}
