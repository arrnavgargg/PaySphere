package com.paysphere.controller;

import com.paysphere.controller.dto.AuthorizePaymentRequest;
import com.paysphere.controller.dto.CapturePaymentRequest;
import com.paysphere.controller.dto.LedgerEntryResponse;
import com.paysphere.controller.dto.PaymentAuthorizationResponse;
import com.paysphere.controller.dto.RefundPaymentRequest;
import com.paysphere.domain.LedgerEntry;
import com.paysphere.domain.Transaction;
import com.paysphere.service.PaymentOrchestrator;
import jakarta.validation.Valid;
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
@RequestMapping({"/api/v1/payments", ""})
public class PaymentController {

    private final PaymentOrchestrator paymentOrchestrator;

    public PaymentController(PaymentOrchestrator paymentOrchestrator) {
        this.paymentOrchestrator = paymentOrchestrator;
    }

    @PostMapping("/authorize")
    public ResponseEntity<PaymentAuthorizationResponse> authorize(@Valid @RequestBody AuthorizePaymentRequest request) {
        Transaction transaction = paymentOrchestrator.authorize(request);
        return ResponseEntity.ok(new PaymentAuthorizationResponse(
                transaction,
                "Payment authorized"
        ));
    }

    @GetMapping("/idempotency/{key}")
    public ResponseEntity<PaymentAuthorizationResponse> getByIdempotencyKey(@PathVariable("key") String key) {
        Transaction transaction = paymentOrchestrator.getByIdempotencyKey(key);
        return ResponseEntity.ok(new PaymentAuthorizationResponse(
                transaction,
                "Idempotent transaction retrieved"
        ));
    }

    @PostMapping("/{referenceId}/capture")
    public ResponseEntity<PaymentAuthorizationResponse> capture(
            @PathVariable("referenceId") String referenceId,
            @RequestBody(required = false) CapturePaymentRequest request
    ) {
        Transaction transaction = paymentOrchestrator.capture(
                referenceId,
                request != null ? request.getAmount() : null
        );
        return ResponseEntity.ok(new PaymentAuthorizationResponse(
                transaction,
                "Payment successfully captured"
        ));
    }

    @PostMapping("/{referenceId}/refund")
    public ResponseEntity<PaymentAuthorizationResponse> refund(
            @PathVariable("referenceId") String referenceId,
            @RequestBody(required = false) RefundPaymentRequest request
    ) {
        Transaction transaction = paymentOrchestrator.refund(
                referenceId,
                request != null ? request.getAmount() : null,
                request != null ? request.getReason() : "Customer refund request"
        );
        return ResponseEntity.ok(new PaymentAuthorizationResponse(
                transaction,
                "Payment successfully refunded"
        ));
    }

    @GetMapping("/{referenceId}")
    public ResponseEntity<PaymentAuthorizationResponse> getByReferenceId(@PathVariable("referenceId") String referenceId) {
        Transaction transaction = paymentOrchestrator.getByReferenceId(referenceId);
        return ResponseEntity.ok(new PaymentAuthorizationResponse(
                transaction,
                "Transaction retrieved"
        ));
    }

    @GetMapping
    public ResponseEntity<List<PaymentAuthorizationResponse>> getAllPayments() {
        List<Transaction> transactions = paymentOrchestrator.getAllTransactions();
        List<PaymentAuthorizationResponse> responses = transactions.stream()
                .map(tx -> new PaymentAuthorizationResponse(tx, "Payment record"))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{referenceId}/ledger")
    public ResponseEntity<List<LedgerEntryResponse>> getLedgerEntries(@PathVariable("referenceId") String referenceId) {
        List<LedgerEntry> entries = paymentOrchestrator.getLedgerEntries(referenceId);
        List<LedgerEntryResponse> responses = entries.stream()
                .map(LedgerEntryResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}
