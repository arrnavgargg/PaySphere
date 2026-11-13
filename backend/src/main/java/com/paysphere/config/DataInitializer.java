package com.paysphere.config;

import com.paysphere.domain.CreditCardInstrument;
import com.paysphere.domain.Customer;
import com.paysphere.domain.UpiInstrument;
import com.paysphere.repository.CustomerRepository;
import com.paysphere.repository.PaymentInstrumentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CustomerRepository customerRepository;
    private final PaymentInstrumentRepository paymentInstrumentRepository;

    public DataInitializer(CustomerRepository customerRepository,
                           PaymentInstrumentRepository paymentInstrumentRepository) {
        this.customerRepository = customerRepository;
        this.paymentInstrumentRepository = paymentInstrumentRepository;
    }

    @Override
    public void run(String... args) {
        if (customerRepository.count() == 0) {
            Customer arnav = new Customer();
            arnav.setFullName("Arnav Garg");
            arnav.setEmail("arnav@paysphere.com");
            arnav = customerRepository.save(arnav);

            UpiInstrument upi = new UpiInstrument();
            upi.setCustomer(arnav);
            upi.setUpiId("arnav@okaxis");
            upi.setProvider("Axis Bank");
            upi.setInstrumentLabel("UPI - arnav@okaxis");
            paymentInstrumentRepository.save(upi);

            CreditCardInstrument card = new CreditCardInstrument();
            card.setCustomer(arnav);
            card.setMaskedCardNumber("****-****-****-4242");
            card.setCardNetwork("VISA");
            card.setInstrumentLabel("Visa - 4242");
            paymentInstrumentRepository.save(card);

            Customer merchant = new Customer();
            merchant.setFullName("PaySphere Merchant Operations");
            merchant.setEmail("merchant@paysphere.com");
            merchant = customerRepository.save(merchant);

            UpiInstrument merchantUpi = new UpiInstrument();
            merchantUpi.setCustomer(merchant);
            merchantUpi.setUpiId("merchant@paysphere");
            merchantUpi.setProvider("PaySphere Gateway");
            merchantUpi.setInstrumentLabel("UPI - merchant@paysphere");
            paymentInstrumentRepository.save(merchantUpi);
        }
    }
}

