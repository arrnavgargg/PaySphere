import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function StepPayeeInput({ mode, value, onChange, onVerified }) {
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const placeholder = mode === 'UPI'
    ? 'Enter UPI ID (e.g. name@okaxis)'
    : mode === 'CREDIT_CARD'
    ? 'Enter card number'
    : 'Enter account number';

  const label = mode === 'UPI' ? 'UPI ID' : mode === 'CREDIT_CARD' ? 'Card Number' : 'Account Number';

  useEffect(() => {
    setVerified(false);
    setError('');
  }, [value]);

  const validate = () => {
    if (!value.trim()) {
      setError('This field is required');
      return false;
    }
    if (mode === 'UPI' && !value.includes('@')) {
      setError('Enter a valid UPI ID (e.g. name@bank)');
      return false;
    }
    if (mode === 'CREDIT_CARD' && value.replace(/\s/g, '').length < 13) {
      setError('Enter a valid card number');
      return false;
    }
    setError('');
    return true;
  };

  const handleVerify = () => {
    if (validate()) {
      setVerified(true);
      onVerified?.(value);
    }
  };

  const formatCardInput = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleChange = (e) => {
    let v = e.target.value;
    if (mode === 'CREDIT_CARD') v = formatCardInput(v);
    onChange(v);
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>Who are you paying?</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
        Enter the recipient's details
      </p>

      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label className="input-label" htmlFor="payee-input">{label}</label>
        <input
          id="payee-input"
          type="text"
          className="input-field"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={validate}
          autoFocus
          style={{
            fontSize: mode === 'CREDIT_CARD' ? '1.125rem' : '0.9375rem',
            letterSpacing: mode === 'CREDIT_CARD' ? '0.05em' : 'normal',
            fontFamily: mode === 'CREDIT_CARD' ? 'var(--font-mono)' : 'var(--font-main)',
          }}
        />
        {error && <p className="input-error">{error}</p>}
      </div>

      {verified && (
        <div className="scale-in" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: 'var(--space-md)',
          background: 'var(--color-success-bg)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-md)',
        }}>
          <CheckCircle size={18} color="var(--color-success)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 500 }}>
            Verified — {mode === 'UPI' ? value : `•••• ${value.replace(/\s/g, '').slice(-4)}`}
          </span>
        </div>
      )}

      <button
        className="btn btn-primary btn-full btn-large"
        onClick={handleVerify}
        disabled={!value.trim()}
      >
        {verified ? 'Continue' : 'Verify & Continue'}
      </button>
    </div>
  );
}
