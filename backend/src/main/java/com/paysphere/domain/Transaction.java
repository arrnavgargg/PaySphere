package com.paysphere.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_id", nullable = false, unique = true, updatable = false)
    private String referenceId;

    @Column(name = "idempotency_key", nullable = false, unique = true)
    private String idempotencyKey;

    /**
     * Mandatory Association: The Customer who initiated or is associated with the transaction.
     * Table 'transactions' holds foreign key column 'customer_id' -> 'customers.id'.
     */
    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    /**
     * Optional Association / Aggregation: The PaymentInstrument used for payment processing.
     * Table 'transactions' holds foreign key column 'instrument_id' -> 'payment_instruments.id'.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instrument_id")
    private PaymentInstrument instrument;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * COMPOSITION: A Transaction strictly owns its composed LedgerEntry audit trail.
     * - cascade = CascadeType.ALL propagates all entity lifecycle events (persist, merge, remove, refresh, detach)
     *   from Transaction to LedgerEntry.
     * - orphanRemoval = true enforces that removing a LedgerEntry from this collection permanently deletes it
     *   from the database.
     * - A LedgerEntry cannot exist in isolation without an enclosing Transaction.
     * - Foreign key ownership belongs to LedgerEntry (column 'transaction_id' in 'ledger_entries' table).
     */
    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<LedgerEntry> ledgerEntries = new ArrayList<>();

    public Transaction() {
    }

    public Transaction(Customer customer, PaymentInstrument instrument, String idempotencyKey,
                       BigDecimal amount, String currency, TransactionStatus status) {
        this.customer = customer;
        this.instrument = instrument;
        this.idempotencyKey = idempotencyKey;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
    }

    @PrePersist
    void onCreate() {
        if (this.referenceId == null || this.referenceId.isBlank()) {
            this.referenceId = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
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

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public PaymentInstrument getInstrument() {
        return instrument;
    }

    public void setInstrument(PaymentInstrument instrument) {
        this.instrument = instrument;
    }

    public List<LedgerEntry> getLedgerEntries() {
        return Collections.unmodifiableList(ledgerEntries);
    }

    public void setLedgerEntries(List<LedgerEntry> ledgerEntries) {
        this.ledgerEntries = ledgerEntries != null ? ledgerEntries : new ArrayList<>();
    }

    public void addLedgerEntry(LedgerEntry entry) {
        if (entry != null) {
            ledgerEntries.add(entry);
            entry.setTransaction(this);
        }
    }

    public void removeLedgerEntry(LedgerEntry entry) {
        if (entry != null) {
            ledgerEntries.remove(entry);
            entry.setTransaction(null);
        }
    }
}
