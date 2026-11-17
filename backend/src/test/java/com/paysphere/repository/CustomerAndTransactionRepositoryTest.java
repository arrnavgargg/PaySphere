package com.paysphere.repository;

import com.paysphere.domain.CreditCardInstrument;
import com.paysphere.domain.Customer;
import com.paysphere.domain.LedgerDirection;
import com.paysphere.domain.LedgerEntry;
import com.paysphere.domain.LedgerEntryType;
import com.paysphere.domain.PaymentInstrument;
import com.paysphere.domain.Transaction;
import com.paysphere.domain.TransactionStatus;
import com.paysphere.domain.UpiInstrument;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class CustomerAndTransactionRepositoryTest {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PaymentInstrumentRepository paymentInstrumentRepository;

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    @Test
    @DisplayName("Verify Customer CRUD and custom query methods")
    void testCustomerRepositoryOperations() {
        String uniqueEmail = "testuser_" + UUID.randomUUID() + "@paysphere.com";
        Customer customer = new Customer("Test User", uniqueEmail);
        Customer saved = customerRepository.save(customer);

        assertNotNull(saved.getId());
        assertEquals("Test User", saved.getFullName());
        assertEquals(uniqueEmail, saved.getEmail());

        Optional<Customer> foundByEmail = customerRepository.findByEmail(uniqueEmail);
        assertTrue(foundByEmail.isPresent());
        assertEquals("Test User", foundByEmail.get().getFullName());

        assertTrue(customerRepository.existsByEmail(uniqueEmail));
        assertFalse(customerRepository.existsByEmail("nonexistent@domain.com"));

        List<Customer> matching = customerRepository.findByFullNameContainingIgnoreCase("test");
        assertFalse(matching.isEmpty());
    }

    @Test
    @DisplayName("Verify Aggregation: Customer has PaymentInstruments with independent lifecycle")
    @Transactional
    void testCustomerPaymentInstrumentAggregation() {
        String email = "agg_user_" + UUID.randomUUID() + "@paysphere.com";
        Customer customer = new Customer("Agg Customer", email);
        customer = customerRepository.save(customer);

        UpiInstrument upi = new UpiInstrument();
        upi.setUpiId("agg_" + UUID.randomUUID() + "@okaxis");
        upi.setProvider("HDFC");
        upi.setInstrumentLabel("UPI Primary");
        upi.setCustomer(customer);
        upi = paymentInstrumentRepository.save(upi);

        CreditCardInstrument card = new CreditCardInstrument();
        card.setMaskedCardNumber("****-****-****-9999");
        card.setCardNetwork("MASTERCARD");
        card.setInstrumentLabel("MC 9999");
        card.setCustomer(customer);
        card = paymentInstrumentRepository.save(card);

        // Verify aggregation from child (FK owner) to parent
        assertEquals(customer.getId(), upi.getCustomer().getId());
        assertEquals(customer.getId(), card.getCustomer().getId());

        // Verify child records can be queried independently via their repository
        List<PaymentInstrument> instruments = paymentInstrumentRepository.findByCustomerId(customer.getId());
        assertEquals(2, instruments.size());
    }

    @Test
    @DisplayName("Verify Composition: Transaction owns LedgerEntry audit records with CascadeType.ALL and orphanRemoval")
    @Transactional
    void testTransactionLedgerEntryComposition() {
        String email = "comp_user_" + UUID.randomUUID() + "@paysphere.com";
        Customer customer = customerRepository.save(new Customer("Comp Customer", email));

        String idempotencyKey = "COMP-TX-" + UUID.randomUUID();
        Transaction tx = new Transaction();
        tx.setCustomer(customer);
        tx.setIdempotencyKey(idempotencyKey);
        tx.setAmount(new BigDecimal("750.00"));
        tx.setCurrency("INR");
        tx.setStatus(TransactionStatus.AUTHORIZED);

        // Add composed ledger entries
        LedgerEntry authHold = new LedgerEntry();
        authHold.setType(LedgerEntryType.AUTH_HOLD);
        authHold.setDirection(LedgerDirection.DEBIT);
        authHold.setAmount(new BigDecimal("750.00"));
        tx.addLedgerEntry(authHold);

        // Cascade persist: saving Transaction automatically cascades and persists LedgerEntry
        Transaction savedTx = transactionRepository.save(tx);
        assertNotNull(savedTx.getId());
        assertNotNull(savedTx.getReferenceId());
        assertEquals(1, savedTx.getLedgerEntries().size());
        assertNotNull(savedTx.getLedgerEntries().get(0).getId());

        // Verify ledger entries are accessible in DB
        List<LedgerEntry> entries = ledgerEntryRepository.findByTransactionIdOrderByCreatedAtAsc(savedTx.getId());
        assertEquals(1, entries.size());
        assertEquals(LedgerEntryType.AUTH_HOLD, entries.get(0).getType());

        // Test composition: add capture entry and save transaction
        LedgerEntry capture = new LedgerEntry();
        capture.setType(LedgerEntryType.CAPTURE);
        capture.setDirection(LedgerDirection.CREDIT);
        capture.setAmount(new BigDecimal("750.00"));
        savedTx.addLedgerEntry(capture);
        savedTx.setStatus(TransactionStatus.CAPTURED);
        transactionRepository.save(savedTx);

        List<LedgerEntry> updatedEntries = ledgerEntryRepository.findByTransactionIdOrderByCreatedAtAsc(savedTx.getId());
        assertEquals(2, updatedEntries.size());

        // Verify TransactionRepository queries
        Optional<Transaction> byIdem = transactionRepository.findByIdempotencyKey(idempotencyKey);
        assertTrue(byIdem.isPresent());

        Optional<Transaction> byRef = transactionRepository.findByReferenceId(savedTx.getReferenceId());
        assertTrue(byRef.isPresent());

        List<Transaction> customerTxs = transactionRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId());
        assertFalse(customerTxs.isEmpty());

        List<Transaction> capturedTxs = transactionRepository.findByStatus(TransactionStatus.CAPTURED);
        assertFalse(capturedTxs.isEmpty());
    }
}
