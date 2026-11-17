package com.paysphere.repository;

import com.paysphere.domain.CreditCardInstrument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CreditCardInstrumentRepository extends JpaRepository<CreditCardInstrument, Long> {

    Optional<CreditCardInstrument> findByMaskedCardNumber(String maskedCardNumber);
}

