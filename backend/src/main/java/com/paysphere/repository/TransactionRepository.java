package com.paysphere.repository;

import com.paysphere.domain.Transaction;
import com.paysphere.domain.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

    boolean existsByIdempotencyKey(String idempotencyKey);

    Optional<Transaction> findByReferenceId(String referenceId);

    List<Transaction> findByCustomerId(Long customerId);

    List<Transaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Transaction> findByStatus(TransactionStatus status);

    List<Transaction> findAllByOrderByCreatedAtDesc();
}
