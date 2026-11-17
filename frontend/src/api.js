const API_BASE = '/api/v1';

export async function authorizePayment(payload) {
  const res = await fetch(`${API_BASE}/payments/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Payment authorization failed');
  }
  return data;
}

export async function getTransactionByIdempotency(key) {
  const res = await fetch(`${API_BASE}/payments/idempotency/${encodeURIComponent(key)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Transaction not found');
  }
  return data;
}

export async function capturePayment(referenceId, amount) {
  const res = await fetch(`${API_BASE}/payments/${encodeURIComponent(referenceId)}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(amount ? { amount } : {}),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Capture failed');
  }
  return data;
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
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Refund failed');
  }
  return data;
}

export async function getAllPayments() {
  const res = await fetch(`${API_BASE}/payments`);
  if (!res.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return res.json();
}

export async function getLedgerEntries(referenceId) {
  const res = await fetch(`${API_BASE}/payments/${encodeURIComponent(referenceId)}/ledger`);
  if (!res.ok) {
    throw new Error('Failed to fetch ledger entries');
  }
  return res.json();
}

export async function getAllCustomers() {
  const res = await fetch(`${API_BASE}/customers`);
  if (!res.ok) {
    throw new Error('Failed to fetch customers');
  }
  return res.json();
}

export async function createCustomer(payload) {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create customer');
  }
  return data;
}

export async function addCustomerInstrument(customerId, payload) {
  const res = await fetch(`${API_BASE}/customers/${customerId}/instruments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to add instrument');
  }
  return data;
}

export async function checkServerHealth() {
  try {
    const res = await fetch('/v3/api-docs', { method: 'GET' });
    return res.ok;
  } catch (err) {
    return false;
  }
}
