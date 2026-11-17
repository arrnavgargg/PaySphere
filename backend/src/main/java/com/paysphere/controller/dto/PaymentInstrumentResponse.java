package com.paysphere.controller.dto;

import com.paysphere.domain.CreditCardInstrument;
import com.paysphere.domain.PaymentInstrument;
import com.paysphere.domain.UpiInstrument;

public class PaymentInstrumentResponse {

    private Long id;
    private String label;
    private String type;
    private String detail;
    private String providerOrNetwork;

    public PaymentInstrumentResponse() {
    }

    public PaymentInstrumentResponse(PaymentInstrument instrument) {
        if (instrument != null) {
            this.id = instrument.getId();
            this.label = instrument.getInstrumentLabel();
            if (instrument instanceof UpiInstrument upi) {
                this.type = "UPI";
                this.detail = upi.getUpiId();
                this.providerOrNetwork = upi.getProvider();
            } else if (instrument instanceof CreditCardInstrument card) {
                this.type = "CREDIT_CARD";
                this.detail = card.getMaskedCardNumber();
                this.providerOrNetwork = card.getCardNetwork();
            } else {
                this.type = "OTHER";
            }
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getProviderOrNetwork() {
        return providerOrNetwork;
    }

    public void setProviderOrNetwork(String providerOrNetwork) {
        this.providerOrNetwork = providerOrNetwork;
    }
}

