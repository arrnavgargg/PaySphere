package com.paysphere.service;

import com.paysphere.controller.dto.AuthorizePaymentRequest;
import com.paysphere.domain.Customer;
import com.paysphere.domain.Transaction;
import com.paysphere.domain.TransactionStatus;
import com.paysphere.exception.FraudDetectedException;
import com.paysphere.exception.InsufficientFundsException;
import com.paysphere.factory.PaymentGatewayFactory;
import com.paysphere.repository.CustomerRepository;
import com.paysphere.repository.TransactionRepository;
import com.paysphere.security.FraudCheckHandler;
import com.paysphere.singleton.IdempotencyRegistry;
import com.paysphere.strategy.PaymentGateway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentOrchestratorTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private FraudCheckHandler fraudCheckHandler;

    @Mock
    private PaymentGatewayFactory paymentGatewayFactory;

    @Mock
    private PaymentGateway paymentGateway;

    @Mock
    private IdempotencyRegistry idempotencyRegistry;

    @InjectMocks
    private PaymentOrchestrator paymentOrchestrator;

    private AuthorizePaymentRequest request;
    private Customer customer;

    @BeforeEach
    void setUp() {
        request = new AuthorizePaymentRequest();
        request.setCustomerId(101L);
        request.setAmount(new BigDecimal("1250.00"));
        request.setCurrency("INR");
        request.setIdempotencyKey("idem-abc-123");

        customer = new Customer();
        customer.setFullName("Arnav Garg");
        customer.setEmail("arnav@paysphere.com");
    }

    @Test
    void authorize_successfulFlow_runsFraudChecksExecutesGatewayAndSaves() {
        when(transactionRepository.findByIdempotencyKey(request.getIdempotencyKey())).thenReturn(Optional.empty());
        when(customerRepository.findById(request.getCustomerId())).thenReturn(Optional.of(customer));
        when(paymentGatewayFactory.getGateway(request)).thenReturn(paymentGateway);
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Transaction result = paymentOrchestrator.authorize(request);

        assertEquals(TransactionStatus.AUTHORIZED, result.getStatus());
        assertEquals(request.getAmount(), result.getAmount());
        assertEquals(request.getCurrency(), result.getCurrency());
        assertEquals(request.getIdempotencyKey(), result.getIdempotencyKey());

        verify(fraudCheckHandler, times(1)).check(any(Transaction.class));
        verify(paymentGatewayFactory, times(1)).getGateway(request);
        verify(paymentGateway, times(1)).authorize(any(Transaction.class));
        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(idempotencyRegistry, times(1)).put(request.getIdempotencyKey(), result.getId());
    }

    @Test
    void authorize_duplicateIdempotencyKey_returnsExistingTransactionWithoutFraudOrGateway() {
        Transaction cached = new Transaction();
        cached.setIdempotencyKey(request.getIdempotencyKey());
        cached.setStatus(TransactionStatus.AUTHORIZED);

        when(transactionRepository.findByIdempotencyKey(request.getIdempotencyKey())).thenReturn(Optional.of(cached));

        Transaction result = paymentOrchestrator.authorize(request);

        assertSame(cached, result);
        verify(transactionRepository, never()).save(any(Transaction.class));
        verifyNoInteractions(customerRepository);
        verifyNoInteractions(fraudCheckHandler);
        verifyNoInteractions(paymentGatewayFactory);
        verifyNoInteractions(paymentGateway);
        verifyNoInteractions(idempotencyRegistry);
    }

    @Test
    void authorize_fraudBlocked_setsFailedAndPropagatesFraudException() {
        when(transactionRepository.findByIdempotencyKey(request.getIdempotencyKey())).thenReturn(Optional.empty());
        when(customerRepository.findById(request.getCustomerId())).thenReturn(Optional.of(customer));
        org.mockito.Mockito.doThrow(new FraudDetectedException("Fraud detected"))
            .when(fraudCheckHandler)
            .check(any(Transaction.class));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThrows(FraudDetectedException.class, () -> paymentOrchestrator.authorize(request));

        ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository, times(1)).save(transactionCaptor.capture());
        assertEquals(TransactionStatus.FAILED, transactionCaptor.getValue().getStatus());

        verify(paymentGatewayFactory, never()).getGateway(any());
        verifyNoInteractions(paymentGateway);
        verify(idempotencyRegistry, never()).put(any(), any());
    }

    @Test
    void authorize_insufficientFunds_setsFailedAndPropagatesException() {
        when(transactionRepository.findByIdempotencyKey(request.getIdempotencyKey())).thenReturn(Optional.empty());
        when(customerRepository.findById(request.getCustomerId())).thenReturn(Optional.of(customer));
        when(paymentGatewayFactory.getGateway(request)).thenReturn(paymentGateway);
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        org.mockito.Mockito.doThrow(new InsufficientFundsException("Insufficient funds"))
                .when(paymentGateway)
                .authorize(any(Transaction.class));

        assertThrows(InsufficientFundsException.class, () -> paymentOrchestrator.authorize(request));

        ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository, times(1)).save(transactionCaptor.capture());
        assertEquals(TransactionStatus.FAILED, transactionCaptor.getValue().getStatus());

        verify(fraudCheckHandler, times(1)).check(any(Transaction.class));
        verify(paymentGatewayFactory, times(1)).getGateway(request);
        verify(idempotencyRegistry, never()).put(any(), any());
    }
}
