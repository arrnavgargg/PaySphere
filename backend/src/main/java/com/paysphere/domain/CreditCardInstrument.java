package com.paysphere.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "credit_card_instruments")
public class CreditCardInstrument extends PaymentInstrument {

    @Column(name = "masked_card_number", nullable = false, length = 19)
    private String maskedCardNumber;

    @Column(name = "card_network", nullable = false)
    private String cardNetwork;

    public CreditCardInstrument() {
    }

    public CreditCardInstrument(String instrumentLabel, Customer customer, String maskedCardNumber, String cardNetwork) {
        super(instrumentLabel, customer);
        this.maskedCardNumber = maskedCardNumber;
        this.cardNetwork = cardNetwork;
    }

    public String getMaskedCardNumber() {
        return maskedCardNumber;
    }

    public void setMaskedCardNumber(String maskedCardNumber) {
        this.maskedCardNumber = maskedCardNumber;
    }

    public String getCardNetwork() {
        return cardNetwork;
    }

    public void setCardNetwork(String cardNetwork) {
        this.cardNetwork = cardNetwork;
    }
}
