package com.paysphere.controller.dto;

import jakarta.validation.constraints.NotBlank;

public class AddPaymentInstrumentRequest {

    @NotBlank(message = "type is required (UPI or CREDIT_CARD)")
    private String type;

    @NotBlank(message = "identifier is required")
    private String identifier;

    private String label;

    private String providerOrNetwork;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getProviderOrNetwork() {
        return providerOrNetwork;
    }

    public void setProviderOrNetwork(String providerOrNetwork) {
        this.providerOrNetwork = providerOrNetwork;
    }
}

