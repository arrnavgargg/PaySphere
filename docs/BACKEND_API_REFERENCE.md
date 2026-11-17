# PaySphere Backend Architecture & API Reference

PaySphere is an enterprise-grade universal payment orchestration engine. This document provides reference material for frontend and full-stack team members integrating against the backend.

---

## 1. Architecture & Design Patterns

| Pattern | Component | Purpose |
| :--- | :--- | :--- |
| **Chain of Responsibility** | `FraudCheckHandler`, `AmountAnomalyFraudHandler`, `BlacklistFraudCheckHandler` | Sequentially validates transaction parameters (strictly positive amounts, limits, blacklisted VPAs/emails) before payment execution. |
| **Strategy Pattern** | `PaymentGateway`, `UpiPaymentGateway`, `CreditCardPaymentGateway`, `DefaultPaymentGateway` | Decouples specific payment processing algorithms for various payment channels (UPI, Cards). |
| **Factory Pattern** | `PaymentGatewayFactory`, `DefaultPaymentGatewayFactory` | Selects and instantiates the appropriate gateway strategy dynamically based on the payment mode and identifiers. |
| **Singleton Pattern** | `IdempotencyRegistry` | In-memory atomic registry preventing duplicate transaction processing for the same idempotency key. |
| **Double-Entry Ledger** | `LedgerEntry`, `LedgerEntryType`, `LedgerDirection` | Records immutable debit and credit entries (`AUTH_HOLD`, `CAPTURE`, `REFUND`, `REVERSAL`) ensuring financial auditability. |

---

## 2. Server Configuration

- **Default Port**: `8080`
- **Base Context Path**: `/`
- **Swagger / OpenAPI Documentation**: `http://localhost:8080/swagger-ui.html`
- **Raw OpenAPI Spec**: `http://localhost:8080/v3/api-docs`
- **H2 In-Memory Database Console**: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:payspheredb`
  - User: `sa`
  - Password: *(empty)*
- **CORS Support**: Enabled for all origins (`*`) with standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`).

---

## 3. Pre-Seeded Demo Data

When the application boots, the following records are automatically seeded:

- **Customer 1**:
  - Full Name: `Arnav Garg`
  - Email: `arnav@paysphere.com`
  - Payment Instruments:
    - UPI: `arnav@okaxis` (Provider: Axis Bank)
    - Card: `****-****-****-4242` (Network: VISA)
- **Customer 2**:
  - Full Name: `PaySphere Merchant Operations`
  - Email: `merchant@paysphere.com`
  - Payment Instruments:
    - UPI: `merchant@paysphere`

---

## 4. REST API Endpoints

### 4.1 Payment Orchestration (`/api/v1/payments`)

#### 1. Authorize Payment
- **Method & Path**: `POST /api/v1/payments/authorize`
- **Description**: Evaluates fraud rules, initializes double-entry auth hold, and invokes payment gateway strategy.
- **Request Body**:
```json
{
  "idempotencyKey": "KEY-DEMO-001",
  "amount": 2500.00,
  "currency": "INR",
  "paymentMode": "UPI",
  "identifier": "arnav@okaxis"
}
```
*(Note: If `customerId` is omitted, the customer and instrument are automatically resolved from `identifier`)*

- **Response (200 OK)**:
```json
{
  "transactionReference": "f02e0b5b-ac5b-492f-b6e1-61e3ddfcc5aa",
  "idempotencyKey": "KEY-DEMO-001",
  "amount": 2500.0,
  "currency": "INR",
  "status": "AUTHORIZED",
  "paymentMode": "UPI - arnav@okaxis",
  "message": "Payment authorized",
  "createdAt": "2026-11-12T17:07:21.042906206+05:30"
}
```

- **Fraud Check Error (400 Bad Request)**:
```json
{
  "status": "FAILED",
  "error": "Transaction amount must be strictly positive.",
  "code": "FRAUD_DETECTED"
}
```

#### 2. Lookup Idempotent Transaction
- **Method & Path**: `GET /api/v1/payments/idempotency/{key}`
- **Description**: Retrieves a previously authorized transaction by its unique idempotency key.

#### 3. Capture Payment
- **Method & Path**: `POST /api/v1/payments/{referenceId}/capture`
- **Description**: Captures an authorized hold and records credit ledger entry.
- **Request Body** *(Optional)*:
```json
{
  "amount": 2500.00
}
```

#### 4. Refund Payment
- **Method & Path**: `POST /api/v1/payments/{referenceId}/refund`
- **Description**: Issues a refund on a captured transaction, generating balanced credit and debit ledger entries.
- **Request Body** *(Optional)*:
```json
{
  "amount": 2500.00,
  "reason": "Customer cancellation"
}
```

#### 5. Get Transaction by Reference
- **Method & Path**: `GET /api/v1/payments/{referenceId}`

#### 6. List All Payments
- **Method & Path**: `GET /api/v1/payments`

#### 7. View Transaction Ledger Entries
- **Method & Path**: `GET /api/v1/payments/{referenceId}/ledger`
- **Response**: Array of double-entry ledger records (`AUTH_HOLD`, `CAPTURE`, `REFUND`).

---

### 4.2 Customer & Instrument Management (`/api/v1/customers`)

#### 1. Create Customer
- **Method & Path**: `POST /api/v1/customers`
- **Request Body**:
```json
{
  "fullName": "Priya Sharma",
  "email": "priya.sharma@example.com"
}
```

#### 2. List Customers
- **Method & Path**: `GET /api/v1/customers`

#### 3. Get Customer by ID
- **Method & Path**: `GET /api/v1/customers/{id}`

#### 4. Add Payment Instrument
- **Method & Path**: `POST /api/v1/customers/{id}/instruments`
- **Request Body (UPI)**:
```json
{
  "type": "UPI",
  "identifier": "priya@hdfcbank",
  "label": "Priya HDFC UPI",
  "providerOrNetwork": "HDFC Bank"
}
```
- **Request Body (Credit Card)**:
```json
{
  "type": "CREDIT_CARD",
  "identifier": "4111222233334444",
  "label": "Priya Visa Card",
  "providerOrNetwork": "VISA"
}
```

#### 5. List Customer Instruments
- **Method & Path**: `GET /api/v1/customers/{id}/instruments`

