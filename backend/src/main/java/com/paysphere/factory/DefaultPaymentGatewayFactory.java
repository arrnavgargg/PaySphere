package com.paysphere.factory;

import com.paysphere.controller.dto.AuthorizePaymentRequest;
import com.paysphere.strategy.DefaultPaymentGateway;
import com.paysphere.strategy.PaymentGateway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Primary
public class DefaultPaymentGatewayFactory implements PaymentGatewayFactory {

    private final List<PaymentGateway> paymentGateways;
    private final DefaultPaymentGateway defaultPaymentGateway;

    @Autowired
    public DefaultPaymentGatewayFactory(List<PaymentGateway> paymentGateways, DefaultPaymentGateway defaultPaymentGateway) {
        this.paymentGateways = paymentGateways;
        this.defaultPaymentGateway = defaultPaymentGateway;
    }

    public DefaultPaymentGatewayFactory(PaymentGateway paymentGateway) {
        this.paymentGateways = List.of(paymentGateway);
        this.defaultPaymentGateway = paymentGateway instanceof DefaultPaymentGateway d ? d : new DefaultPaymentGateway();
    }

    @Override
    public PaymentGateway getGateway(AuthorizePaymentRequest request) {
        String mode = request != null ? request.getPaymentMode() : null;
        if (mode == null && request != null && request.getIdentifier() != null && request.getIdentifier().contains("@")) {
            mode = "UPI";
        }
        if (mode != null) {
            for (PaymentGateway gateway : paymentGateways) {
                if (gateway.supports(mode)) {
                    return gateway;
                }
            }
        }
        return defaultPaymentGateway;
    }
}
