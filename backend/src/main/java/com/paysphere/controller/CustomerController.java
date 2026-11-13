package com.paysphere.controller;

import com.paysphere.controller.dto.AddPaymentInstrumentRequest;
import com.paysphere.controller.dto.CreateCustomerRequest;
import com.paysphere.controller.dto.CustomerResponse;
import com.paysphere.controller.dto.PaymentInstrumentResponse;
import com.paysphere.domain.Customer;
import com.paysphere.domain.PaymentInstrument;
import com.paysphere.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        Customer customer = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CustomerResponse(customer));
    }

    @GetMapping
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        List<CustomerResponse> responses = customers.stream()
                .map(CustomerResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable("id") Long id) {
        Customer customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(new CustomerResponse(customer));
    }

    @PostMapping("/{id}/instruments")
    public ResponseEntity<PaymentInstrumentResponse> addInstrument(
            @PathVariable("id") Long customerId,
            @Valid @RequestBody AddPaymentInstrumentRequest request
    ) {
        PaymentInstrument instrument = customerService.addInstrument(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new PaymentInstrumentResponse(instrument));
    }

    @GetMapping("/{id}/instruments")
    public ResponseEntity<List<PaymentInstrumentResponse>> getInstruments(@PathVariable("id") Long customerId) {
        List<PaymentInstrument> instruments = customerService.getInstrumentsForCustomer(customerId);
        List<PaymentInstrumentResponse> responses = instruments.stream()
                .map(PaymentInstrumentResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}

