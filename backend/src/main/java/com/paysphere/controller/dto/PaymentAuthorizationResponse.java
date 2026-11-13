package com.paysphere.controller.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.paysphere.domain.Transaction;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentAuthorizationResponse {

    private String transactionReference;
    private String idempotencyKey;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String paymentMode;
    private String message;
    private OffsetDateTime createdAt;

    public PaymentAuthorizationResponse() {
    }

    public PaymentAuthorizationResponse(String transactionReference, String status, String message) {
        this.transactionReference = transactionReference;
        this.status = status;
        this.message = message;
    }

    public PaymentAuthorizationResponse(Transaction transaction, String message) {
        if (transaction != null) {
            this.transactionReference = transaction.getReferenceId();
            this.idempotencyKey = transaction.getIdempotencyKey();
            this.amount = transaction.getAmount();
            this.currency = transaction.getCurrency();
            this.status = transaction.getStatus() != null ? transaction.getStatus().name() : null;
            if (transaction.getInstrument() != null) {
                this.paymentMode = transaction.getInstrument().getInstrumentLabel();
            }
            this.createdAt = transaction.getCreatedAt();
        }
        this.message = message;
    }

    public PaymentAuthorizationResponse(String transactionReference, String idempotencyKey, BigDecimal amount,
                                        String currency, String status, String paymentMode, String message,
                                        OffsetDateTime createdAt) {
        this.transactionReference = transactionReference;
        this.idempotencyKey = idempotencyKey;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.paymentMode = paymentMode;
        this.message = message;
        this.createdAt = createdAt;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
