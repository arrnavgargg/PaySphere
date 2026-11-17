package com.paysphere.strategy;

import com.paysphere.domain.Transaction;

public interface PaymentGateway {

    void authorize(Transaction transaction);

    default void capture(Transaction transaction) {
    }

    default void refund(Transaction transaction) {
    }

    default boolean supports(String paymentMode) {
        return true;
    }
}
