import { friendlyError } from '../utils/errorMessages';

const API_BASE = '/api/v1';

async function request(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect. Please check your internet connection.');
    }
    throw err;
  }
}

// --- Payments ---

export async function authorizePayment(payload) {
  return request(`${API_BASE}/payments/authorize`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function capturePayment(referenceId, amount) {
  return request(`${API_BASE}/payments/${encodeURIComponent(referenceId)}/capture`, {
    method: 'POST',
    body: JSON.stringify(amount ? { amount } : {}),
  });
}

export async function refundPayment(referenceId, amount, reason) {
  return request(`${API_BASE}/payments/${encodeURIComponent(referenceId)}/refund`, {
    method: 'POST',
    body: JSON.stringify({
      amount: amount || undefined,
      reason: reason || 'Customer refund request',
    }),
  });
}

export async function getAllPayments() {
  return request(`${API_BASE}/payments`);
}

export async function getPaymentByReference(referenceId) {
  return request(`${API_BASE}/payments/${encodeURIComponent(referenceId)}`);
}

export async function getTransactionByIdempotency(key) {
  return request(`${API_BASE}/payments/idempotency/${encodeURIComponent(key)}`);
}

export async function getLedgerEntries(referenceId) {
  return request(`${API_BASE}/payments/${encodeURIComponent(referenceId)}/ledger`);
}

// --- Customers ---

export async function getAllCustomers() {
  return request(`${API_BASE}/customers`);
}

export async function getCustomerById(id) {
  return request(`${API_BASE}/customers/${id}`);
}

export async function createCustomer(payload) {
  return request(`${API_BASE}/customers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function addCustomerInstrument(customerId, payload) {
  return request(`${API_BASE}/customers/${customerId}/instruments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// --- Health ---

export async function checkServerHealth() {
  try {
    const res = await fetch('/v3/api-docs', { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
