package com.paysphere.factory;

import com.paysphere.controller.dto.AuthorizePaymentRequest;
import com.paysphere.strategy.CreditCardPaymentGateway;
import com.paysphere.strategy.DefaultPaymentGateway;
import com.paysphere.strategy.PaymentGateway;
import com.paysphere.strategy.UpiPaymentGateway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class PaymentGatewayFactoryTest {

    private DefaultPaymentGatewayFactory factory;

    @BeforeEach
    void setUp() {
        DefaultPaymentGateway defaultGateway = new DefaultPaymentGateway();
        UpiPaymentGateway upiGateway = new UpiPaymentGateway();
        CreditCardPaymentGateway cardGateway = new CreditCardPaymentGateway();
        factory = new DefaultPaymentGatewayFactory(List.of(defaultGateway, upiGateway, cardGateway), defaultGateway);
    }

    @Test
    void getGateway_upiMode_returnsUpiPaymentGateway() {
        AuthorizePaymentRequest request = new AuthorizePaymentRequest();
        request.setPaymentMode("UPI");

        PaymentGateway gateway = factory.getGateway(request);
        assertInstanceOf(UpiPaymentGateway.class, gateway);
    }

    @Test
    void getGateway_upiIdentifier_returnsUpiPaymentGateway() {
        AuthorizePaymentRequest request = new AuthorizePaymentRequest();
        request.setIdentifier("test@okaxis");

        PaymentGateway gateway = factory.getGateway(request);
        assertInstanceOf(UpiPaymentGateway.class, gateway);
    }

    @Test
    void getGateway_cardMode_returnsCreditCardPaymentGateway() {
        AuthorizePaymentRequest request = new AuthorizePaymentRequest();
        request.setPaymentMode("CREDIT_CARD");

        PaymentGateway gateway = factory.getGateway(request);
        assertInstanceOf(CreditCardPaymentGateway.class, gateway);
    }

    @Test
    void getGateway_nullMode_returnsDefaultPaymentGateway() {
        AuthorizePaymentRequest request = new AuthorizePaymentRequest();

        PaymentGateway gateway = factory.getGateway(request);
        assertInstanceOf(DefaultPaymentGateway.class, gateway);
    }
}

