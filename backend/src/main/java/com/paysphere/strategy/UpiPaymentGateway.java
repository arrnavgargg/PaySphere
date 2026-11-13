package com.paysphere.strategy;

import com.paysphere.domain.Transaction;
import com.paysphere.domain.UpiInstrument;
import com.paysphere.exception.PaySphereException;
import org.springframework.stereotype.Component;

@Component
public class UpiPaymentGateway implements PaymentGateway {

    @Override
    public void authorize(Transaction transaction) {
        if (transaction.getInstrument() instanceof UpiInstrument upi) {
            String vpa = upi.getUpiId();
            if (vpa != null && !vpa.contains("@")) {
                throw new PaySphereException("Invalid UPI Virtual Payment Address (VPA): " + vpa);
            }
        }
        // Simulates UPI 2.0 NPCI switch authorization
    }

    @Override
    public void capture(Transaction transaction) {
        // Simulates instant UPI fund settlement
    }

    @Override
    public void refund(Transaction transaction) {
        // Simulates UPI refund request to issuing bank
    }

    @Override
    public boolean supports(String paymentMode) {
        return paymentMode != null && (
                paymentMode.equalsIgnoreCase("UPI") ||
                paymentMode.equalsIgnoreCase("VPA")
        );
    }
}

