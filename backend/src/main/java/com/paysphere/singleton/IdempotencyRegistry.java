package com.paysphere.singleton;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class IdempotencyRegistry {

    private final ConcurrentMap<String, Long> keyToTransactionId = new ConcurrentHashMap<>();

    public Long getTransactionId(String key) {
        return keyToTransactionId.get(key);
    }

    public void put(String key, Long transactionId) {
        keyToTransactionId.put(key, transactionId);
    }
}
