-- ===================================================================
-- PaySphere PostgreSQL Schema DDL
-- Database Lead (Member 2) Persistence Reference
-- ===================================================================

-- 1. Customers Table (Entity Root)
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

-- 2. Payment Instruments Table (Base Table for Joined Inheritance)
-- AGGREGATION: Owned by customer, but independent lifecycle in domain.
CREATE TABLE IF NOT EXISTS payment_instruments (
    id BIGSERIAL PRIMARY KEY,
    instrument_label VARCHAR(255) NOT NULL,
    customer_id BIGINT NOT NULL,
    CONSTRAINT fk_payment_instruments_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 3. Credit Card Instruments Table (Joined Subclass)
CREATE TABLE IF NOT EXISTS credit_card_instruments (
    id BIGINT PRIMARY KEY,
    masked_card_number VARCHAR(19) NOT NULL,
    card_network VARCHAR(255) NOT NULL,
    CONSTRAINT fk_credit_card_instrument
        FOREIGN KEY (id) REFERENCES payment_instruments(id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- 4. UPI Instruments Table (Joined Subclass)
CREATE TABLE IF NOT EXISTS upi_instruments (
    id BIGINT PRIMARY KEY,
    upi_id VARCHAR(255) NOT NULL UNIQUE,
    provider VARCHAR(255) NOT NULL,
    CONSTRAINT fk_upi_instrument
        FOREIGN KEY (id) REFERENCES payment_instruments(id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- 5. Transactions Table
-- References Customer (mandatory) and PaymentInstrument (optional association/aggregation)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    reference_id VARCHAR(255) NOT NULL UNIQUE,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    instrument_id BIGINT,
    amount NUMERIC(19, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_transactions_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_transactions_instrument
        FOREIGN KEY (instrument_id) REFERENCES payment_instruments(id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- 6. Ledger Entries Table (Double-Entry Financial Audit Trail)
-- COMPOSITION: Part-of relationship with Transaction.
-- A ledger entry cannot exist without its parent transaction.
-- ON DELETE CASCADE enforces composition semantics at the DB schema level.
CREATE TABLE IF NOT EXISTS ledger_entries (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    direction VARCHAR(50) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_ledger_entries_transaction
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- Indexes for performance and lookup optimization
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_payment_instruments_customer_id ON payment_instruments(customer_id);
CREATE INDEX IF NOT EXISTS idx_upi_instruments_upi_id ON upi_instruments(upi_id);
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency_key ON transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_transaction_id ON ledger_entries(transaction_id);
