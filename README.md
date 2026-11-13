# PaySphere: Universal Payment System

PaySphere is an enterprise-grade payment processing platform featuring multi-instrument support (UPI, Credit/Debit cards), real-time fraud mitigation, idempotency enforcement, and double-entry financial ledger accounting.

---

## 🚀 Quick Start

### 1. Run the Backend
```bash
cd backend
mvn spring-boot:run
```
The server will initialize on port `8080`.

### 2. Run Test Suite
Run the verification test suite:
```bash
chmod +x test_paysphere.sh
./test_paysphere.sh
```

Or execute all unit and integration tests via Maven:
```bash
cd backend
mvn test
```

---

## 📖 API Documentation & Tools

- **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI 3.0 Specification**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
- **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - JDBC URL: `jdbc:h2:mem:payspheredb`
  - User: `sa`
  - Password: *(blank)*

Full API reference is available in [BACKEND_API_REFERENCE.md](file:///home/arnavgarg/paysphere/docs/BACKEND_API_REFERENCE.md).

---

## 🛠️ Architecture & Design Patterns

1. **Chain of Responsibility**: Pluggable fraud detection pipeline (`AmountAnomalyFraudHandler`, `BlacklistFraudCheckHandler`).
2. **Strategy Pattern**: Payment processing gateway strategies (`UpiPaymentGateway`, `CreditCardPaymentGateway`, `DefaultPaymentGateway`).
3. **Factory Pattern**: Dynamic gateway resolution based on payment instrument type (`DefaultPaymentGatewayFactory`).
4. **Singleton Pattern**: In-memory and cache-assisted idempotency registry (`IdempotencyRegistry`).
5. **Double-Entry Ledger Accounting**: Balanced, immutable audit records (`AUTH_HOLD`, `CAPTURE`, `REFUND`, `REVERSAL`).

