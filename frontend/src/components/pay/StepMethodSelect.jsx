import React from 'react';
import { QrCode, CreditCard, Building2 } from 'lucide-react';

const methods = [
  { id: 'UPI', label: 'UPI / VPA', desc: 'Pay using UPI ID', icon: QrCode, color: '#4F46E5' },
  { id: 'CREDIT_CARD', label: 'Card', desc: 'Credit or Debit card', icon: CreditCard, color: '#059669' },
  { id: 'NET_BANKING', label: 'Net Banking', desc: 'Bank login', icon: Building2, color: '#D97706' },
];

export default function StepMethodSelect({ selected, onSelect }) {
  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>How would you like to pay?</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
        Choose a payment method
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {methods.map((m) => {
          const Icon = m.icon;
          const isActive = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-md) var(--space-lg)',
                cursor: 'pointer',
                border: isActive ? `2px solid var(--color-accent)` : '1.5px solid var(--color-border)',
                background: isActive ? 'var(--color-accent-light)' : 'var(--color-surface)',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{
                width: 48, height: 48,
                borderRadius: 'var(--radius-md)',
                background: `${m.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={24} color={m.color} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{m.label}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
