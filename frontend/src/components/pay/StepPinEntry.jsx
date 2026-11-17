import React, { useState } from 'react';
import { Delete } from 'lucide-react';

export default function StepPinEntry({ onSubmit, mode }) {
  const [pin, setPin] = useState('');
  const maxLen = mode === 'UPI' ? 6 : 4;
  const label = mode === 'UPI' ? 'Enter UPI PIN' : 'Enter OTP';

  const handleKey = (key) => {
    if (key === 'del') {
      setPin((p) => p.slice(0, -1));
    } else if (pin.length < maxLen) {
      const next = pin + key;
      setPin(next);
      if (next.length === maxLen) {
        setTimeout(() => onSubmit(next), 300);
      }
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'del'],
  ];

  return (
    <div className="fade-in" style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>{label}</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>
        {mode === 'UPI' ? 'Enter your 6-digit UPI PIN to authorize' : 'Enter the OTP sent to your phone'}
      </p>

      {/* PIN dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 'var(--space-xl)' }}>
        {Array.from({ length: maxLen }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: i < pin.length ? 'none' : '2px solid var(--color-border)',
              background: i < pin.length ? 'var(--color-accent)' : 'transparent',
              transition: 'all var(--transition-fast)',
              transform: i < pin.length ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Numeric keypad */}
      <div style={{ maxWidth: 280, margin: '0 auto' }}>
        {keys.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            {row.map((key) => (
              <button
                key={key || 'empty'}
                onClick={() => key && handleKey(key)}
                disabled={!key}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  background: key ? 'var(--color-surface-secondary)' : 'transparent',
                  color: 'var(--color-text)',
                  fontSize: key === 'del' ? '0' : '1.25rem',
                  fontWeight: 600,
                  cursor: key ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--transition-fast)',
                  fontFamily: 'var(--font-main)',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseDown={(e) => { if (key) e.currentTarget.style.transform = 'scale(0.95)'; }}
                onMouseUp={(e) => { if (key) e.currentTarget.style.transform = 'scale(1)'; }}
                onTouchStart={(e) => { if (key) e.currentTarget.style.transform = 'scale(0.95)'; }}
                onTouchEnd={(e) => { if (key) e.currentTarget.style.transform = 'scale(1)'; }}
                aria-label={key === 'del' ? 'Delete' : key || undefined}
              >
                {key === 'del' ? <Delete size={22} color="var(--color-text-secondary)" /> : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
