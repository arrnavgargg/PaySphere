import React from 'react';
import { QrCode, CreditCard, Building2, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

const METHOD_INFO = {
  UPI: { label: 'UPI / VPA', icon: QrCode, color: '#4F46E5' },
  CREDIT_CARD: { label: 'Card Payment', icon: CreditCard, color: '#059669' },
  NET_BANKING: { label: 'Net Banking', icon: Building2, color: '#D97706' },
};

export default function StepReview({ mode, payee, amount, note, onConfirm, loading }) {
  const method = METHOD_INFO[mode] || METHOD_INFO.UPI;
  const Icon = method.icon;
  const displayPayee = mode === 'CREDIT_CARD'
    ? `•••• •••• •••• ${payee.replace(/\s/g, '').slice(-4)}`
    : payee;

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>Review Payment</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
        Confirm the payment details before proceeding
      </p>

      <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        {/* Amount */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-lg)',
          paddingBottom: 'var(--space-lg)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
            Total Amount
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            {formatINR(parseFloat(amount) || 0)}
          </div>
        </div>

        {/* Details list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Paying To</span>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: mode === 'CREDIT_CARD' ? 'var(--font-mono)' : 'inherit',
            }}>
              {displayPayee}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Payment Mode</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon size={16} color={method.color} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{method.label}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>From Account</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>HDFC Bank (•••• 4521)</span>
          </div>

          {note && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Note</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontStyle: 'italic' }}>{note}</span>
            </div>
          )}
        </div>
      </div>

      {/* Security badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-md)',
        background: 'var(--color-success-bg)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-lg)',
        fontSize: '0.8125rem',
        color: 'var(--color-success)',
      }}>
        <ShieldCheck size={18} />
        <span>100% secure payment with Bank-grade encryption</span>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-full btn-large"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? 'Processing…' : `Pay Now • ${formatINR(parseFloat(amount) || 0)}`}
      </button>
    </div>
  );
}
