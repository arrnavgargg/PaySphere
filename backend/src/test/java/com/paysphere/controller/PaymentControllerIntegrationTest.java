package com.paysphere.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PaymentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAuthorizePaymentUpiSuccess() throws Exception {
        String payload = """
                {
                    "idempotencyKey": "TEST-INT-001",
                    "amount": 1800.00,
                    "paymentMode": "UPI",
                    "identifier": "arnav@okaxis"
                }
                """;

        mockMvc.perform(post("/api/v1/payments/authorize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("AUTHORIZED")))
                .andExpect(jsonPath("$.transactionReference", notNullValue()))
                .andExpect(jsonPath("$.idempotencyKey", is("TEST-INT-001")));
    }

    @Test
    void testAuthorizeDuplicateIdempotencyKey() throws Exception {
        String payload = """
                {
                    "idempotencyKey": "TEST-INT-IDEM-001",
                    "amount": 950.00,
                    "paymentMode": "UPI",
                    "identifier": "arnav@okaxis"
                }
                """;

        // Initial request
        mockMvc.perform(post("/api/v1/payments/authorize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("AUTHORIZED")));

        // Duplicate request returns existing record idempotently
        mockMvc.perform(post("/api/v1/payments/authorize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("AUTHORIZED")))
                .andExpect(jsonPath("$.idempotencyKey", is("TEST-INT-IDEM-001")));
    }

    @Test
    void testZeroAmountFraudAnomaly() throws Exception {
        String payload = """
                {
                    "idempotencyKey": "TEST-INT-FRAUD-001",
                    "amount": 0.00,
                    "paymentMode": "UPI",
                    "identifier": "arnav@okaxis"
                }
                """;

        mockMvc.perform(post("/api/v1/payments/authorize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is("FAILED")))
                .andExpect(jsonPath("$.code", is("FRAUD_DETECTED")));
    }

    @Test
    void testGetByIdempotencyKey() throws Exception {
        String payload = """
                {
                    "idempotencyKey": "TEST-INT-LOOKUP-001",
                    "amount": 320.00,
                    "paymentMode": "UPI",
                    "identifier": "arnav@okaxis"
                }
                """;

        mockMvc.perform(post("/api/v1/payments/authorize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/payments/idempotency/TEST-INT-LOOKUP-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idempotencyKey", is("TEST-INT-LOOKUP-001")))
                .andExpect(jsonPath("$.status", is("AUTHORIZED")));
    }

    @Test
    void testFullPaymentLifecycleAuthorizeCaptureRefundAndLedger() throws Exception {
        String authorizePayload = """
                {
                    "idempotencyKey": "TEST-LIFECYCLE-001",
                    "amount": 5000.00,
                    "paymentMode": "UPI",
                    "identifier": "arnav@okaxis"
                }
                """;

        // 1. Authorize
        MvcResult authResult = mockMvc.perform(post("/api/v1/payments/authorize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(authorizePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("AUTHORIZED")))
                .andReturn();

        JsonNode authJson = objectMapper.readTree(authResult.getResponse().getContentAsString());
        String referenceId = authJson.get("transactionReference").asText();

        // 2. Capture
        mockMvc.perform(post("/api/v1/payments/" + referenceId + "/capture")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\": 5000.00}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CAPTURED")));

        // 3. Refund
        mockMvc.perform(post("/api/v1/payments/" + referenceId + "/refund")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\": 5000.00, \"reason\": \"Order cancelled\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("REFUNDED")));

        // 4. Ledger entries audit trail (AUTH_HOLD, CAPTURE, REFUND CREDIT, REFUND DEBIT)
        mockMvc.perform(get("/api/v1/payments/" + referenceId + "/ledger"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[0].type", is("AUTH_HOLD")))
                .andExpect(jsonPath("$[0].direction", is("DEBIT")))
                .andExpect(jsonPath("$[1].type", is("CAPTURE")))
                .andExpect(jsonPath("$[1].direction", is("CREDIT")))
                .andExpect(jsonPath("$[2].type", is("REFUND")))
                .andExpect(jsonPath("$[2].direction", is("CREDIT")))
                .andExpect(jsonPath("$[3].type", is("REFUND")))
                .andExpect(jsonPath("$[3].direction", is("DEBIT")));
    }
}
