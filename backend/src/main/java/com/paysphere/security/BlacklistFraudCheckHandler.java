package com.paysphere.security;

import com.paysphere.domain.CreditCardInstrument;
import com.paysphere.domain.PaymentInstrument;
import com.paysphere.domain.Transaction;
import com.paysphere.domain.UpiInstrument;
import com.paysphere.exception.FraudDetectedException;

import java.util.Set;

public class BlacklistFraudCheckHandler extends AbstractFraudCheckHandler {

    private static final Set<String> BLOCKED_KEYWORDS = Set.of(
            "fraud", "blacklisted", "hacker", "stolen", "blocked", "malicious"
    );

    @Override
    protected void doCheck(Transaction transaction) {
        if (transaction.getCustomer() != null) {
            String email = transaction.getCustomer().getEmail();
            if (email != null && isBlocked(email)) {
                throw new FraudDetectedException("Customer account is flagged as fraudulent or blacklisted: " + email);
            }
        }

        PaymentInstrument instrument = transaction.getInstrument();
        if (instrument instanceof UpiInstrument upi) {
            if (isBlocked(upi.getUpiId())) {
                throw new FraudDetectedException("UPI VPA is blacklisted: " + upi.getUpiId());
            }
        } else if (instrument instanceof CreditCardInstrument card) {
            if (isBlocked(card.getMaskedCardNumber())) {
                throw new FraudDetectedException("Card is flagged as stolen or blacklisted.");
            }
        }
    }

    private boolean isBlocked(String value) {
        if (value == null) {
            return false;
        }
        String lower = value.toLowerCase();
        for (String keyword : BLOCKED_KEYWORDS) {
            if (lower.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
}

