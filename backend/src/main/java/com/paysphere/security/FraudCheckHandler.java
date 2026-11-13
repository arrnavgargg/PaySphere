package com.paysphere.security;

import com.paysphere.domain.Transaction;

public interface FraudCheckHandler {

    void check(Transaction transaction);
}
