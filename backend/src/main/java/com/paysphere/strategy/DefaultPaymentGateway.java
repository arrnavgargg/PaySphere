package com.paysphere.strategy;

import com.paysphere.domain.Transaction;
import org.springframework.stereotype.Component;

@Component
public class DefaultPaymentGateway implements PaymentGateway {

    @Override
    public void authorize(Transaction transaction) {
        // Default gateway simulation: auto-approves compliant transactions
    }

    @Override
    public void capture(Transaction transaction) {
        // Default gateway capture simulation
    }

    @Override
    public void refund(Transaction transaction) {
        // Default gateway refund simulation
    }

    @Override
    public boolean supports(String paymentMode) {
        return paymentMode == null || paymentMode.equalsIgnoreCase("DEFAULT");
    }
}
