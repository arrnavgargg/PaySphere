import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authorizePayment, addCustomerInstrument } from '../services/api';

export default function CardPaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState(user?.fullName || 'Arnav Garg');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');
  const [amount, setAmount] = useState('750.00');
  const [saveCard, setSaveCard] = useState(true);

  // OTP modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);

  // Card brand detector
  const getCardBrand = (num) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return { name: 'VISA', color: '#1A1F71' };
    if (/^5[1-5]/.test(clean)) return { name: 'MASTERCARD', color: '#EB001B' };
    if (/^6(0|5)/.test(clean)) return { name: 'RUPAY', color: '#00833F' };
    if (/^3[47]/.test(clean)) return { name: 'AMEX', color: '#007BC1' };
    return { name: 'CARD', color: '#4F46E5' };
  };

  const brand = getCardBrand(cardNumber);

  const formatCardNumber = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length > 2) {
      return `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    return clean;
  };

  const handlePayClick = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    setShowOtpModal(true);
  };

  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authorize payment on backend
      const idempotencyKey = `CARD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const payload = {
        customerId: user?.id || 1,
        amount: parseFloat(amount).toFixed(2),
        currency: 'INR',
        idempotencyKey,
        paymentMode: 'CREDIT_CARD',
      };

      const res = await authorizePayment(payload);

      // 2. Save card instrument if requested
      if (saveCard && user?.id) {
        try {
          await addCustomerInstrument(user.id, {
            type: 'CREDIT_CARD',
            instrumentLabel: `${brand.name} •••• ${cardNumber.replace(/\s/g, '').slice(-4)}`,
            detail: `****-****-****-${cardNumber.replace(/\s/g, '').slice(-4)}`,
            providerOrNetwork: brand.name,
          });
        } catch {
          // If already saved or offline, ignore
        }
      }

      setShowOtpModal(false);
      addToast(`Card payment of ₹${amount} authorized successfully!`, 'success');
      navigate('/history');
    } catch (err) {
      addToast(err.message || 'Card authorization failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page fade-in" style={{ maxWidth: 500, margin: '0 auto', padding: 'var(--space-md)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn btn-ghost"
          style={{ padding: '8px', borderRadius: 'var(--radius-full)' }}
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Card Payment</h2>
        <div style={{ width: 38 }} />
      </div>

      {/* Interactive 3D Card Preview */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
          borderRadius: 18,
          padding: 24,
          color: '#fff',
          boxShadow: '0 16px 32px rgba(49, 46, 129, 0.35)',
          marginBottom: 'var(--space-xl)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 32, height: 24, background: '#D97706', borderRadius: 4, opacity: 0.8 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>CHIP</span>
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em' }}>
            {brand.name}
          </span>
        </div>

        <div style={{ fontSize: '1.375rem', fontFamily: 'monospace', letterSpacing: '0.18em', marginBottom: 20 }}>
          {cardNumber || '•••• •••• •••• ••••'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '0.625rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cardholder
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, textTransform: 'uppercase' }}>
              {cardHolder || 'CARD HOLDER'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.625rem', opacity: 0.7, textTransform: 'uppercase' }}>Expires</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'monospace' }}>
              {expiry || 'MM/YY'}
            </div>
          </div>
        </div>
      </div>

      {/* Card Details Form */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <form onSubmit={handlePayClick} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label className="input-label">Card Number</label>
            <input
              type="text"
              required
              maxLength={19}
              className="input-field font-mono"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="4242 4242 4242 4242"
            />
          </div>

          <div>
            <label className="input-label">Cardholder Name</label>
            <input
              type="text"
              required
              className="input-field"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="Name on card"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div>
              <label className="input-label">Expiry (MM/YY)</label>
              <input
                type="text"
                required
                maxLength={5}
                className="input-field font-mono"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="12/28"
              />
            </div>
            <div>
              <label className="input-label">CVV / CVC</label>
              <input
                type="password"
                required
                maxLength={4}
                className="input-field font-mono"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="•••"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              className="input-field font-mono"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="750.00"
              style={{ fontSize: '1.25rem', fontWeight: 800 }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8125rem' }}>
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              style={{ accentColor: 'var(--color-accent)' }}
            />
            <span>Securely save this card for fast 1-click checkout</span>
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 'var(--space-xs)' }}
          >
            Pay ₹{amount || '0'} Securely
          </button>
        </form>
      </div>

      {/* 3D Secure / OTP Modal */}
      {showOtpModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
              <Lock size={20} color="var(--color-accent)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>
                Bank 3D-Secure Authentication
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
              A one-time password (OTP) has been sent to your registered mobile number for ₹{amount}.
            </p>
            <form onSubmit={handleConfirmOtp} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <label className="input-label">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  className="input-field font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.25rem', fontWeight: 800 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xs)' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Authorizing…' : 'Submit OTP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

