package com.paysphere.service;

import com.paysphere.controller.dto.AuthorizePaymentRequest;
import com.paysphere.domain.Customer;
import com.paysphere.domain.LedgerDirection;
import com.paysphere.domain.LedgerEntry;
import com.paysphere.domain.LedgerEntryType;
import com.paysphere.domain.PaymentInstrument;
import com.paysphere.domain.Transaction;
import com.paysphere.domain.TransactionStatus;
import com.paysphere.exception.FraudDetectedException;
import com.paysphere.exception.InsufficientFundsException;
import com.paysphere.exception.PaySphereException;
import com.paysphere.factory.PaymentGatewayFactory;
import com.paysphere.repository.CustomerRepository;
import com.paysphere.repository.TransactionRepository;
import com.paysphere.security.FraudCheckHandler;
import com.paysphere.singleton.IdempotencyRegistry;
import com.paysphere.strategy.PaymentGateway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentOrchestrator {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final IdempotencyRegistry idempotencyRegistry;
    private final FraudCheckHandler fraudCheckHandler;
    private final PaymentGatewayFactory paymentGatewayFactory;
    private CustomerService customerService;

    public PaymentOrchestrator(
            CustomerRepository customerRepository,
            TransactionRepository transactionRepository,
            IdempotencyRegistry idempotencyRegistry,
            FraudCheckHandler fraudCheckHandler,
            PaymentGatewayFactory paymentGatewayFactory
    ) {
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
        this.idempotencyRegistry = idempotencyRegistry;
        this.fraudCheckHandler = fraudCheckHandler;
        this.paymentGatewayFactory = paymentGatewayFactory;
    }

    @Autowired(required = false)
    public void setCustomerService(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Transactional
    public Transaction authorize(AuthorizePaymentRequest request) {
        Transaction existing = transactionRepository.findByIdempotencyKey(request.getIdempotencyKey()).orElse(null);
        if (existing != null) {
            return existing;
        }

        Customer customer;
        PaymentInstrument instrument = null;

        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new PaySphereException("Customer not found: " + request.getCustomerId()));
            if (!customer.getInstruments().isEmpty()) {
                instrument = customer.getInstruments().get(0);
            }
        } else if (customerService != null) {
            CustomerService.CustomerAndInstrument resolved = customerService.resolveCustomerAndInstrument(
                    null, request.getIdentifier(), request.getPaymentMode());
            customer = resolved.customer();
            instrument = resolved.instrument();
        } else {
            throw new PaySphereException("CustomerId or identifier is required to authorize payment");
        }

        Transaction transaction = new Transaction();
        transaction.setCustomer(customer);
        transaction.setInstrument(instrument);
        transaction.setIdempotencyKey(request.getIdempotencyKey());
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(request.getCurrency());
        transaction.setStatus(TransactionStatus.AUTHORIZED);

        LedgerEntry authorizationHold = new LedgerEntry();
        authorizationHold.setType(LedgerEntryType.AUTH_HOLD);
        authorizationHold.setDirection(LedgerDirection.DEBIT);
        authorizationHold.setAmount(request.getAmount());
        transaction.addLedgerEntry(authorizationHold);

        try {
            fraudCheckHandler.check(transaction);
            PaymentGateway paymentGateway = paymentGatewayFactory.getGateway(request);
            paymentGateway.authorize(transaction);

            transaction.setStatus(TransactionStatus.AUTHORIZED);
            Transaction saved = transactionRepository.save(transaction);
            idempotencyRegistry.put(saved.getIdempotencyKey(), saved.getId());
            return saved;
        } catch (FraudDetectedException | InsufficientFundsException ex) {
            transaction.setStatus(TransactionStatus.FAILED);
            transactionRepository.save(transaction);
            throw ex;
        }
    }

    @Transactional
    public Transaction capture(String referenceId, BigDecimal amount) {
        Transaction transaction = getByReferenceId(referenceId);

        if (transaction.getStatus() != TransactionStatus.AUTHORIZED) {
            throw new PaySphereException("Transaction cannot be captured in status: " + transaction.getStatus());
        }

        BigDecimal captureAmount = (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) ? amount : transaction.getAmount();

        LedgerEntry captureEntry = new LedgerEntry();
        captureEntry.setType(LedgerEntryType.CAPTURE);
        captureEntry.setDirection(LedgerDirection.CREDIT);
        captureEntry.setAmount(captureAmount);
        transaction.addLedgerEntry(captureEntry);

        PaymentGateway paymentGateway = paymentGatewayFactory.getGatewayByMode(
                transaction.getInstrument() != null ? transaction.getInstrument().getInstrumentLabel() : "DEFAULT"
        );
        paymentGateway.capture(transaction);

        transaction.setStatus(TransactionStatus.CAPTURED);
        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction refund(String referenceId, BigDecimal amount, String reason) {
        Transaction transaction = getByReferenceId(referenceId);

        if (transaction.getStatus() != TransactionStatus.CAPTURED && transaction.getStatus() != TransactionStatus.AUTHORIZED) {
            throw new PaySphereException("Transaction cannot be refunded in status: " + transaction.getStatus());
        }

        BigDecimal refundAmount = (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) ? amount : transaction.getAmount();

        LedgerEntry creditEntry = new LedgerEntry();
        creditEntry.setType(LedgerEntryType.REFUND);
        creditEntry.setDirection(LedgerDirection.CREDIT);
        creditEntry.setAmount(refundAmount);
        transaction.addLedgerEntry(creditEntry);

        LedgerEntry debitEntry = new LedgerEntry();
        debitEntry.setType(LedgerEntryType.REFUND);
        debitEntry.setDirection(LedgerDirection.DEBIT);
        debitEntry.setAmount(refundAmount);
        transaction.addLedgerEntry(debitEntry);

        PaymentGateway paymentGateway = paymentGatewayFactory.getGatewayByMode(
                transaction.getInstrument() != null ? transaction.getInstrument().getInstrumentLabel() : "DEFAULT"
        );
        paymentGateway.refund(transaction);

        transaction.setStatus(TransactionStatus.REFUNDED);
        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public Transaction getByIdempotencyKey(String key) {
        Long cachedId = idempotencyRegistry.getTransactionId(key);
        if (cachedId != null) {
            return transactionRepository.findById(cachedId)
                    .orElseGet(() -> transactionRepository.findByIdempotencyKey(key)
                            .orElseThrow(() -> new PaySphereException("No transaction found for idempotency key: " + key)));
        }

        Transaction transaction = transactionRepository.findByIdempotencyKey(key)
                .orElseThrow(() -> new PaySphereException("No transaction found for idempotency key: " + key));

        idempotencyRegistry.put(key, transaction.getId());
        return transaction;
    }

    @Transactional(readOnly = true)
    public Transaction getByReferenceId(String referenceId) {
        return transactionRepository.findByReferenceId(referenceId)
                .orElseThrow(() -> new PaySphereException("Transaction not found for reference: " + referenceId));
    }

    @Transactional(readOnly = true)
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByCustomerId(Long customerId) {
        return transactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional(readOnly = true)
    public List<LedgerEntry> getLedgerEntries(String referenceId) {
        Transaction tx = getByReferenceId(referenceId);
        return tx.getLedgerEntries();
    }
}
