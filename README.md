# PaySphere: Universal Payment System

PaySphere is an enterprise-grade payment processing platform featuring multi-instrument support (UPI, Credit/Debit cards), real-time fraud mitigation, idempotency enforcement, double-entry financial ledger accounting, and an interactive React frontend dashboard.

---

## 🚀 Quick Start

### 1. Run the Backend (Spring Boot 3.5.x & Java 25)
```bash
cd backend
mvn spring-boot:run
```
The server will initialize on `http://localhost:8080`.

### 2. Run the Frontend (React 19 & Vite)
```bash
cd frontend
npm install
npm run dev
```
The frontend UI will be live at `http://localhost:5173` with automatic API proxying to port 8080.

### 3. Run Test Suite
Run the shell verification test suite:
```bash
chmod +x test_paysphere.sh
./test_paysphere.sh
```

Or execute all 20 backend unit and integration tests via Maven:
```bash
cd backend
mvn test
```

---

## 💻 Frontend Dashboard Features

The React frontend includes:
1. **Interactive Payment Terminal**:
   - UPI authorization with real-time VPA resolution and simulated NPCI routing.
   - Credit / Debit Card terminal with live interactive card preview and formatting.
   - Preset quick amounts and auto-generated idempotency keys.
2. **Transaction Ledger & History**:
   - Real-time transaction feed with status filters (`AUTHORIZED`, `CAPTURED`, `REFUNDED`).
   - One-click **Capture** and **Refund** actions.
3. **Double-Entry Ledger Modal**:
   - Inspect balanced `DEBIT` / `CREDIT` entries (`AUTH_HOLD`, `CAPTURE`, `REFUND`) for any payment.
4. **Fraud & Idempotency Lab**:
   - Interactive testing sandbox to test duplicate idempotency keys, zero-amount anomalies, and blacklist screening directly from the UI.
5. **Customer & Instruments Hub**:
   - Manage customer accounts and link UPI VPAs or payment cards.

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
