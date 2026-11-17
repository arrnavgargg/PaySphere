package com.paysphere.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI paysphereOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PaySphere Universal Payment Processing API")
                        .description("High-throughput, robust enterprise payment orchestration backend supporting multi-instrument processing (UPI, Credit/Debit Cards), double-entry ledger audit trails, idempotency controls, and chain-of-responsibility fraud evaluation.")
                        .version("1.0.0")
                        .contact(new Contact().name("PaySphere Engineering Team").email("engineering@paysphere.internal"))
                        .license(new License().name("Apache 2.0")));
    }
}

