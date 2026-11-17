package com.paysphere.repository;

import com.paysphere.domain.UpiInstrument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UpiInstrumentRepository extends JpaRepository<UpiInstrument, Long> {

    Optional<UpiInstrument> findByUpiId(String upiId);
}
