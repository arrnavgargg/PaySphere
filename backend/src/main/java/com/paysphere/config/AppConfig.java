package com.paysphere.config;

import com.paysphere.security.AmountAnomalyFraudHandler;
import com.paysphere.security.BlacklistFraudCheckHandler;
import com.paysphere.security.FraudCheckHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public FraudCheckHandler fraudCheckHandlerChain() {
        AmountAnomalyFraudHandler amountAnomalyHandler = new AmountAnomalyFraudHandler();
        BlacklistFraudCheckHandler blacklistHandler = new BlacklistFraudCheckHandler();

        amountAnomalyHandler.setNext(blacklistHandler);
        return amountAnomalyHandler;
    }
}
