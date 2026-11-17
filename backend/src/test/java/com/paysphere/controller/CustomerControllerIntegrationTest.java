package com.paysphere.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CustomerControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testCreateCustomerAndAddInstruments() throws Exception {
        String customerPayload = """
                {
                    "fullName": "Priya Sharma",
                    "email": "priya.sharma@example.com"
                }
                """;

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(customerPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.fullName", is("Priya Sharma")))
                .andExpect(jsonPath("$.email", is("priya.sharma@example.com")));

        // Add UPI Instrument
        String upiPayload = """
                {
                    "type": "UPI",
                    "identifier": "priya@hdfcbank",
                    "label": "Priya HDFC UPI",
                    "providerOrNetwork": "HDFC Bank"
                }
                """;

        mockMvc.perform(post("/api/v1/customers/1/instruments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(upiPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type", is("UPI")))
                .andExpect(jsonPath("$.detail", is("priya@hdfcbank")));

        // Get Customer Instruments
        mockMvc.perform(get("/api/v1/customers/1/instruments"))
                .andExpect(status().isOk());
    }
}

