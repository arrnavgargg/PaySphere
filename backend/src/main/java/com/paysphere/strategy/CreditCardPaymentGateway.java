package com.paysphere.strategy;

import com.paysphere.domain.CreditCardInstrument;
import com.paysphere.domain.Transaction;
import com.paysphere.exception.PaySphereException;
import org.springframework.stereotype.Component;

@Component
public class CreditCardPaymentGateway implements PaymentGateway {

    @Override
    public void authorize(Transaction transaction) {
        if (transaction.getInstrument() instanceof CreditCardInstrument card) {
            String cardNumber = card.getMaskedCardNumber();
            if (cardNumber == null || cardNumber.replaceAll("[^0-9]", "").length() < 12) {
                throw new PaySphereException("Invalid Card Number specification.");
            }
        }
        // Simulates card network ISO-8583 authorization hold
    }

    @Override
    public void capture(Transaction transaction) {
        // Simulates card settlement capture batch
    }

    @Override
    public void refund(Transaction transaction) {
        // Simulates card merchant refund credit
    }

    @Override
    public boolean supports(String paymentMode) {
        return paymentMode != null && (
                paymentMode.equalsIgnoreCase("CREDIT_CARD") ||
                paymentMode.equalsIgnoreCase("CARD") ||
                paymentMode.equalsIgnoreCase("DEBIT_CARD")
        );
    }
}

