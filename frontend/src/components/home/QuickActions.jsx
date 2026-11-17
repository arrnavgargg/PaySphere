import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Users,
  Building2,
  CreditCard,
  Landmark,
  Smartphone,
  Receipt,
  ScanLine,
} from 'lucide-react';

const actions = [
  { label: 'Pay via UPI', icon: QrCode, path: '/pay-qr', color: '#4F46E5' },
  { label: 'Send to Contact', icon: Users, path: '/send-contact', color: '#7C3AED' },
  { label: 'Pay to Bank', icon: Building2, path: '/pay-bank', color: '#0891B2' },
  { label: 'Card Payment', icon: CreditCard, path: '/card-payment', color: '#059669' },
  { label: 'Net Banking', icon: Landmark, path: '/net-banking', color: '#D97706' },
  { label: 'Recharge', icon: Smartphone, path: '/recharge', color: '#EC4899' },
  { label: 'Bills', icon: Receipt, path: '/recharge', color: '#DC2626' },
  { label: 'Scan Any QR', icon: ScanLine, path: '/pay-qr', color: '#2563EB' },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
        Quick Actions & Payments
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-md) var(--space-sm)',
      }}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-sm) 4px',
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--transition-fast)',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              aria-label={action.label}
            >
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 'var(--radius-lg)',
                background: `${action.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-xs)',
              }}>
                <Icon size={24} color={action.color} />
              </div>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                textAlign: 'center',
                lineHeight: 1.25,
                maxWidth: 72,
              }}>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
