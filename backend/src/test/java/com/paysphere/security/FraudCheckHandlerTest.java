package com.paysphere.security;

import com.paysphere.config.AppConfig;
import com.paysphere.domain.Customer;
import com.paysphere.domain.Transaction;
import com.paysphere.domain.UpiInstrument;
import com.paysphere.exception.FraudDetectedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class FraudCheckHandlerTest {

    private FraudCheckHandler fraudCheckHandlerChain;

    @BeforeEach
    void setUp() {
        AppConfig config = new AppConfig();
        fraudCheckHandlerChain = config.fraudCheckHandlerChain();
    }

    @Test
    void check_validTransaction_passesSuccessfully() {
        Transaction tx = new Transaction();
        tx.setAmount(new BigDecimal("1500.00"));
        Customer customer = new Customer();
        customer.setEmail("legit.user@paysphere.com");
        customer.setFullName("Legit User");
        tx.setCustomer(customer);

        UpiInstrument upi = new UpiInstrument();
        upi.setUpiId("legit@okaxis");
        tx.setInstrument(upi);

        assertDoesNotThrow(() -> fraudCheckHandlerChain.check(tx));
    }

    @Test
    void check_zeroAmount_throwsFraudDetectedException() {
        Transaction tx = new Transaction();
        tx.setAmount(BigDecimal.ZERO);

        FraudDetectedException ex = assertThrows(FraudDetectedException.class, () -> fraudCheckHandlerChain.check(tx));
        assertEquals("Transaction amount must be strictly positive.", ex.getMessage());
    }

    @Test
    void check_negativeAmount_throwsFraudDetectedException() {
        Transaction tx = new Transaction();
        tx.setAmount(new BigDecimal("-50.00"));

        FraudDetectedException ex = assertThrows(FraudDetectedException.class, () -> fraudCheckHandlerChain.check(tx));
        assertEquals("Transaction amount must be strictly positive.", ex.getMessage());
    }

    @Test
    void check_excessiveAmount_throwsFraudDetectedException() {
        Transaction tx = new Transaction();
        tx.setAmount(new BigDecimal("99999999.00"));

        FraudDetectedException ex = assertThrows(FraudDetectedException.class, () -> fraudCheckHandlerChain.check(tx));
        assertEquals("Transaction amount exceeds maximum allowable threshold.", ex.getMessage());
    }

    @Test
    void check_blacklistedEmail_throwsFraudDetectedException() {
        Transaction tx = new Transaction();
        tx.setAmount(new BigDecimal("100.00"));
        Customer customer = new Customer();
        customer.setEmail("fraudulent_actor@malicious.com");
        tx.setCustomer(customer);

        FraudDetectedException ex = assertThrows(FraudDetectedException.class, () -> fraudCheckHandlerChain.check(tx));
        assertEquals("Customer account is flagged as fraudulent or blacklisted: fraudulent_actor@malicious.com", ex.getMessage());
    }

    @Test
    void check_blacklistedUpi_throwsFraudDetectedException() {
        Transaction tx = new Transaction();
        tx.setAmount(new BigDecimal("100.00"));
        Customer customer = new Customer();
        customer.setEmail("regular@domain.com");
        tx.setCustomer(customer);

        UpiInstrument upi = new UpiInstrument();
        upi.setUpiId("hacker123@okaxis");
        tx.setInstrument(upi);

        FraudDetectedException ex = assertThrows(FraudDetectedException.class, () -> fraudCheckHandlerChain.check(tx));
        assertEquals("UPI VPA is blacklisted: hacker123@okaxis", ex.getMessage());
    }
}

