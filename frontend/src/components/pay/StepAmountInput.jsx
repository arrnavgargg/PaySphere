import React, { useState } from 'react';
import { formatINR } from '../../utils/formatCurrency';

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function StepAmountInput({ amount, onAmountChange, note, onNoteChange, onContinue }) {
  const [error, setError] = useState('');

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    onAmountChange(val);
    setError('');
  };

  const handleChip = (chip) => {
    const current = parseFloat(amount) || 0;
    onAmountChange(String(current + chip));
    setError('');
  };

  const handleContinue = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (num > 100000) {
      setError('Maximum amount per transaction is ₹1,00,000');
      return;
    }
    onContinue();
  };

  const numAmount = parseFloat(amount) || 0;

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>Enter amount</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>
        How much would you like to pay?
      </p>

      {/* Big centered amount */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>₹</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            autoFocus
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '3rem',
              fontWeight: 800,
              color: 'var(--color-text)',
              width: `${Math.max(2, (amount || '0').length)}ch`,
              textAlign: 'center',
              fontFamily: 'var(--font-main)',
              caretColor: 'var(--color-accent)',
            }}
            aria-label="Amount in rupees"
          />
        </div>
        {numAmount > 0 && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            {formatINR(numAmount)}
          </div>
        )}
        {error && <p className="input-error" style={{ marginTop: 8, textAlign: 'center' }}>{error}</p>}
      </div>

      {/* Quick amount chips */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-sm)',
        justifyContent: 'center',
        marginBottom: 'var(--space-lg)',
      }}>
        {QUICK_AMOUNTS.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChip(chip)}
            className="btn btn-secondary"
            style={{
              fontSize: '0.8125rem',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            + ₹{chip.toLocaleString('en-IN')}
          </button>
        ))}
      </div>

      {/* Note */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Add a note (optional)"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          maxLength={100}
        />
      </div>

      <button
        className="btn btn-primary btn-full btn-large"
        onClick={handleContinue}
        disabled={!amount || parseFloat(amount) <= 0}
      >
        Continue
      </button>
    </div>
  );
}
