import React from 'react';
import Avatar from '../shared/Avatar';

const PAYEES = [
  { name: 'Rahul V', upi: 'rahul@okaxis' },
  { name: 'Priya S', upi: 'priya@ybl' },
  { name: 'Amit K', upi: 'amit@okicici' },
  { name: 'Sneha R', upi: 'sneha@paytm' },
  { name: 'Vikram M', upi: 'vikram@okaxis' },
];

export default function RecentPayees({ onSelect }) {
  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
        Recent Payees
      </h3>
      <div style={{
        display: 'flex',
        gap: 'var(--space-md)',
        overflowX: 'auto',
        paddingBottom: 4,
        scrollbarWidth: 'none',
      }}>
        {PAYEES.map((payee) => (
          <button
            key={payee.upi}
            onClick={() => onSelect?.(payee)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              minWidth: 64,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Avatar name={payee.name} size={48} />
            <span style={{
              fontSize: '0.6875rem',
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              {payee.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
