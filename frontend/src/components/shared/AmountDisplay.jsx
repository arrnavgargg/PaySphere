import React from 'react';
import { formatINR } from '../../utils/formatCurrency';

export default function AmountDisplay({ amount, type, size = 'md', style }) {
  const isSent = type === 'sent';
  const sizes = {
    sm: { fontSize: '0.875rem', fontWeight: 600 },
    md: { fontSize: '1.125rem', fontWeight: 700 },
    lg: { fontSize: '1.75rem', fontWeight: 800 },
    xl: { fontSize: '2.5rem', fontWeight: 800 },
  };

  return (
    <span style={{
      ...sizes[size],
      color: isSent ? 'var(--color-text)' : 'var(--color-success)',
      ...style,
    }}>
      {isSent ? '- ' : type === 'received' ? '+ ' : ''}{formatINR(amount)}
    </span>
  );
}
