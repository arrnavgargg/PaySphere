package com.paysphere.repository;

import com.paysphere.domain.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

    boolean existsByIdempotencyKey(String idempotencyKey);

    Optional<Transaction> findByReferenceId(String referenceId);

    List<Transaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Transaction> findAllByOrderByCreatedAtDesc();
}
