package com.paysphere.repository;

import com.paysphere.domain.CreditCardInstrument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CreditCardInstrumentRepository extends JpaRepository<CreditCardInstrument, Long> {

    Optional<CreditCardInstrument> findByMaskedCardNumber(String maskedCardNumber);
}
