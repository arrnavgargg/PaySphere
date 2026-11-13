#!/bin/bash

echo "=============================================="
echo "      RUNNING PAYSFERE API TEST SUITE         "
echo "=============================================="

echo "1. Testing Successful UPI Payment Authorization..."
curl -s -X POST http://localhost:8080/api/v1/payments/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "KEY-DEMO-001",
    "amount": 2500.00,
    "paymentMode": "UPI",
    "identifier": "arnav@okaxis"
  }' | python -m json.tool
echo -e "\n----------------------------------------------\n"

echo "2. Testing Idempotency (Sending Duplicate Key)..."
curl -s -X POST http://localhost:8080/api/v1/payments/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "KEY-DEMO-001",
    "amount": 2500.00,
    "paymentMode": "UPI",
    "identifier": "arnav@okaxis"
  }' | python -m json.tool
echo -e "\n----------------------------------------------\n"

echo "3. Testing Fraud Check (Zero Amount Anomaly)..."
curl -s -X POST http://localhost:8080/api/v1/payments/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "KEY-DEMO-002",
    "amount": 0.00,
    "paymentMode": "UPI",
    "identifier": "arnav@okaxis"
  }' | python -m json.tool
echo -e "\n----------------------------------------------\n"

echo "4. Testing GET Idempotency Lookup Endpoint..."
curl -s -X GET http://localhost:8080/api/v1/payments/idempotency/KEY-DEMO-001 \
  | python -m json.tool
echo -e "\n=============================================="
echo "          TEST SUITE COMPLETED                "
echo "=============================================="
