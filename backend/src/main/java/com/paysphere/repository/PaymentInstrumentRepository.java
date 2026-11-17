package com.paysphere.repository;

import com.paysphere.domain.PaymentInstrument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentInstrumentRepository extends JpaRepository<PaymentInstrument, Long> {

    List<PaymentInstrument> findByCustomerId(Long customerId);
}
