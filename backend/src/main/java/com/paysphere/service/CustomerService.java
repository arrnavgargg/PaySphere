package com.paysphere.service;

import com.paysphere.controller.dto.AddPaymentInstrumentRequest;
import com.paysphere.controller.dto.CreateCustomerRequest;
import com.paysphere.domain.CreditCardInstrument;
import com.paysphere.domain.Customer;
import com.paysphere.domain.PaymentInstrument;
import com.paysphere.domain.UpiInstrument;
import com.paysphere.exception.PaySphereException;
import com.paysphere.repository.CreditCardInstrumentRepository;
import com.paysphere.repository.CustomerRepository;
import com.paysphere.repository.PaymentInstrumentRepository;
import com.paysphere.repository.UpiInstrumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PaymentInstrumentRepository paymentInstrumentRepository;
    private final UpiInstrumentRepository upiInstrumentRepository;
    private final CreditCardInstrumentRepository creditCardInstrumentRepository;

    public CustomerService(CustomerRepository customerRepository,
                           PaymentInstrumentRepository paymentInstrumentRepository,
                           UpiInstrumentRepository upiInstrumentRepository,
                           CreditCardInstrumentRepository creditCardInstrumentRepository) {
        this.customerRepository = customerRepository;
        this.paymentInstrumentRepository = paymentInstrumentRepository;
        this.upiInstrumentRepository = upiInstrumentRepository;
        this.creditCardInstrumentRepository = creditCardInstrumentRepository;
    }

    @Transactional
    public Customer createCustomer(CreateCustomerRequest request) {
        customerRepository.findByEmail(request.getEmail()).ifPresent(c -> {
            throw new PaySphereException("Customer with email already exists: " + request.getEmail());
        });

        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setEmail(request.getEmail());
        return customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new PaySphereException("Customer not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Transactional
    public PaymentInstrument addInstrument(Long customerId, AddPaymentInstrumentRequest request) {
        Customer customer = getCustomerById(customerId);

        PaymentInstrument instrument;
        String type = request.getType() != null ? request.getType().toUpperCase() : "UPI";

        if ("UPI".equals(type)) {
            UpiInstrument upi = new UpiInstrument();
            upi.setUpiId(request.getIdentifier());
            upi.setProvider(request.getProviderOrNetwork() != null ? request.getProviderOrNetwork() : "UPI Provider");
            upi.setInstrumentLabel(request.getLabel() != null ? request.getLabel() : "UPI - " + request.getIdentifier());
            instrument = upi;
        } else if ("CREDIT_CARD".equals(type) || "CARD".equals(type)) {
            CreditCardInstrument card = new CreditCardInstrument();
            card.setMaskedCardNumber(maskCardNumber(request.getIdentifier()));
            card.setCardNetwork(request.getProviderOrNetwork() != null ? request.getProviderOrNetwork() : "VISA");
            card.setInstrumentLabel(request.getLabel() != null ? request.getLabel() : "Card - " + card.getMaskedCardNumber());
            instrument = card;
        } else {
            throw new PaySphereException("Unsupported instrument type: " + request.getType());
        }

        instrument.setCustomer(customer);
        customer.addInstrument(instrument);
        return paymentInstrumentRepository.save(instrument);
    }

    @Transactional(readOnly = true)
    public List<PaymentInstrument> getInstrumentsForCustomer(Long customerId) {
        return paymentInstrumentRepository.findByCustomerId(customerId);
    }

    @Transactional
    public CustomerAndInstrument resolveCustomerAndInstrument(Long customerId, String identifier, String paymentMode) {
        Customer customer = null;
        PaymentInstrument instrument = null;

        if (customerId != null) {
            customer = customerRepository.findById(customerId).orElse(null);
        }

        if (identifier != null && !identifier.isBlank()) {
            if (identifier.contains("@")) {
                Optional<UpiInstrument> upiOpt = upiInstrumentRepository.findByUpiId(identifier);
                if (upiOpt.isPresent()) {
                    instrument = upiOpt.get();
                    if (customer == null) {
                        customer = instrument.getCustomer();
                    }
                }
            } else {
                String masked = maskCardNumber(identifier);
                Optional<CreditCardInstrument> cardOpt = creditCardInstrumentRepository.findByMaskedCardNumber(masked);
                if (cardOpt.isPresent()) {
                    instrument = cardOpt.get();
                    if (customer == null) {
                        customer = instrument.getCustomer();
                    }
                }
            }
        }

        if (customer == null) {
            String defaultEmail = identifier != null && identifier.contains("@") ? identifier : "customer@paysphere.com";
            customer = customerRepository.findByEmail(defaultEmail).orElseGet(() -> {
                Customer newCust = new Customer();
                newCust.setFullName(identifier != null ? identifier : "PaySphere User");
                newCust.setEmail(defaultEmail);
                return customerRepository.save(newCust);
            });
        }

        if (instrument == null && identifier != null && !identifier.isBlank()) {
            if (identifier.contains("@") || "UPI".equalsIgnoreCase(paymentMode)) {
                UpiInstrument upi = new UpiInstrument();
                upi.setUpiId(identifier);
                upi.setProvider("Default UPI");
                upi.setInstrumentLabel("UPI - " + identifier);
                upi.setCustomer(customer);
                instrument = paymentInstrumentRepository.save(upi);
            } else {
                CreditCardInstrument card = new CreditCardInstrument();
                card.setMaskedCardNumber(maskCardNumber(identifier));
                card.setCardNetwork("VISA");
                card.setInstrumentLabel("Card - " + card.getMaskedCardNumber());
                card.setCustomer(customer);
                instrument = paymentInstrumentRepository.save(card);
            }
        } else if (instrument == null && !customer.getInstruments().isEmpty()) {
            instrument = customer.getInstruments().get(0);
        }

        return new CustomerAndInstrument(customer, instrument);
    }

    private String maskCardNumber(String raw) {
        if (raw == null) return "XXXX-XXXX-XXXX-0000";
        String cleaned = raw.replaceAll("[^0-9]", "");
        if (cleaned.length() < 4) return "XXXX-XXXX-XXXX-0000";
        String last4 = cleaned.substring(cleaned.length() - 4);
        return "****-****-****-" + last4;
    }

    public record CustomerAndInstrument(Customer customer, PaymentInstrument instrument) {}
}

