package com.paysphere.controller.dto;

import java.math.BigDecimal;

public class CapturePaymentRequest {

    private BigDecimal amount;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}

