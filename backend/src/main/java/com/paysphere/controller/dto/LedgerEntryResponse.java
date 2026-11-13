package com.paysphere.controller.dto;

import com.paysphere.domain.LedgerDirection;
import com.paysphere.domain.LedgerEntry;
import com.paysphere.domain.LedgerEntryType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class LedgerEntryResponse {

    private Long id;
    private String transactionReference;
    private LedgerEntryType type;
    private LedgerDirection direction;
    private BigDecimal amount;
    private OffsetDateTime createdAt;

    public LedgerEntryResponse() {
    }

    public LedgerEntryResponse(LedgerEntry entry) {
        if (entry != null) {
            this.id = entry.getId();
            if (entry.getTransaction() != null) {
                this.transactionReference = entry.getTransaction().getReferenceId();
            }
            this.type = entry.getType();
            this.direction = entry.getDirection();
            this.amount = entry.getAmount();
            this.createdAt = entry.getCreatedAt();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public LedgerEntryType getType() {
        return type;
    }

    public void setType(LedgerEntryType type) {
        this.type = type;
    }

    public LedgerDirection getDirection() {
        return direction;
    }

    public void setDirection(LedgerDirection direction) {
        this.direction = direction;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

