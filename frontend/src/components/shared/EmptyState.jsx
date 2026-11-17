import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-2xl) var(--space-md)',
      textAlign: 'center',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-md)',
      }}>
        <Icon size={28} color="var(--color-text-muted)" />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{title || 'Nothing here yet'}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: 280 }}>
        {message || 'Start by making your first transaction.'}
      </p>
      {action && <div style={{ marginTop: 'var(--space-md)' }}>{action}</div>}
    </div>
  );
}
