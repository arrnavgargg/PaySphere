package com.paysphere.repository;

import com.paysphere.domain.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {

    List<LedgerEntry> findByTransactionIdOrderByCreatedAtAsc(Long transactionId);

    List<LedgerEntry> findByTransactionReferenceIdOrderByCreatedAtAsc(String referenceId);
}
