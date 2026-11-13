package com.paysphere.factory;

import com.paysphere.controller.dto.AuthorizePaymentRequest;
import com.paysphere.strategy.PaymentGateway;

public interface PaymentGatewayFactory {

    PaymentGateway getGateway(AuthorizePaymentRequest request);

    default PaymentGateway getGatewayByMode(String paymentMode) {
        AuthorizePaymentRequest request = new AuthorizePaymentRequest();
        request.setPaymentMode(paymentMode);
        return getGateway(request);
    }
}
