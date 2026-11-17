const API_BASE = '/api/v1';

async function handleResponse(res, defaultErrorMsg) {
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || text || `Server responded with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export async function authorizePayment(payload) {
  const res = await fetch(`${API_BASE}/payments/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, 'Payment authorization failed');
}

export async function getTransactionByIdempotency(key) {
  const res = await fetch(`${API_BASE}/payments/idempotency/${encodeURIComponent(key)}`);
  return handleResponse(res, 'Transaction not found');
}

export async function capturePayment(referenceId, amount) {
  const res = await fetch(`${API_BASE}/payments/${encodeURIComponent(referenceId)}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(amount ? { amount } : {}),
  });
  return handleResponse(res, 'Capture failed');
}

export async function refundPayment(referenceId, amount, reason) {
  const res = await fetch(`${API_BASE}/payments/${encodeURIComponent(referenceId)}/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amount || undefined,
      reason: reason || 'Customer refund request',
    }),
  });
  return handleResponse(res, 'Refund failed');
}

export async function getAllPayments() {
  const res = await fetch(`${API_BASE}/payments`);
  return handleResponse(res, 'Failed to fetch transactions');
}

export async function getLedgerEntries(referenceId) {
  const res = await fetch(`${API_BASE}/payments/${encodeURIComponent(referenceId)}/ledger`);
  return handleResponse(res, 'Failed to fetch ledger entries');
}

export async function getAllCustomers() {
  const res = await fetch(`${API_BASE}/customers`);
  return handleResponse(res, 'Failed to fetch customers');
}

export async function createCustomer(payload) {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, 'Failed to create customer');
}

export async function addCustomerInstrument(customerId, payload) {
  const res = await fetch(`${API_BASE}/customers/${customerId}/instruments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res, 'Failed to add instrument');
}

export async function checkServerHealth() {
  try {
    const res = await fetch('/v3/api-docs', { method: 'GET' });
    return res.ok;
  } catch (err) {
    return false;
  }
}
