package com.paysphere.security;

import com.paysphere.domain.Transaction;
import com.paysphere.exception.FraudDetectedException;

import java.math.BigDecimal;

public class AmountAnomalyFraudHandler extends AbstractFraudCheckHandler {

    private static final BigDecimal MAX_TRANSACTION_LIMIT = new BigDecimal("10000000.00");

    @Override
    protected void doCheck(Transaction tx) throws FraudDetectedException {
        if (tx.getAmount() == null || tx.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new FraudDetectedException("Transaction amount must be strictly positive.");
        }
        if (tx.getAmount().compareTo(MAX_TRANSACTION_LIMIT) > 0) {
            throw new FraudDetectedException("Transaction amount exceeds maximum allowable threshold.");
        }
    }
}
