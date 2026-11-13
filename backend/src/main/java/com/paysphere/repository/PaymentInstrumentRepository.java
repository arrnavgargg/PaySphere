package com.paysphere.repository;

import com.paysphere.domain.PaymentInstrument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentInstrumentRepository extends JpaRepository<PaymentInstrument, Long> {

    List<PaymentInstrument> findByCustomerId(Long customerId);
}

