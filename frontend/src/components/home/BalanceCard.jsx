import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';

export default function BalanceCard({ balance = 24500.75 }) {
  const [visible, setVisible] = React.useState(true);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1B2A80 0%, #4F46E5 100%)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--space-lg)',
      color: '#FFFFFF',
      marginBottom: 'var(--space-lg)',
      boxShadow: '0 8px 24px rgba(27,42,128,0.3)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
      }} />
      <div style={{
        position: 'absolute', bottom: -20, left: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
          <span style={{ fontSize: '0.8125rem', opacity: 0.85, fontWeight: 500 }}>Available Balance</span>
          <button
            onClick={() => setVisible(!visible)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 'var(--radius-full)', padding: 6, cursor: 'pointer', display: 'flex' }}
            aria-label={visible ? 'Hide balance' : 'Show balance'}
          >
            {visible ? <Eye size={16} color="#fff" /> : <EyeOff size={16} color="#fff" />}
          </button>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {visible ? formatINR(balance) : '₹ ••••••'}
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: 'var(--space-xs)' }}>
          HDFC Bank •••• 4521
        </div>
      </div>
    </div>
  );
}
