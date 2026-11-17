package com.paysphere.security;

import com.paysphere.domain.Transaction;

public abstract class AbstractFraudCheckHandler implements FraudCheckHandler {

    private FraudCheckHandler next;

    public FraudCheckHandler setNext(FraudCheckHandler next) {
        this.next = next;
        return next;
    }

    @Override
    public void check(Transaction transaction) {
        doCheck(transaction);
        if (next != null) {
            next.check(transaction);
        }
    }

    protected abstract void doCheck(Transaction transaction);
}

