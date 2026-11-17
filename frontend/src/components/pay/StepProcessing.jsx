import React from 'react';
import { Loader2 } from 'lucide-react';

export default function StepProcessing() {
  return (
    <div className="fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-2xl)',
      textAlign: 'center',
      minHeight: 300,
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'var(--color-accent-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-lg)',
      }}>
        <Loader2
          size={36}
          color="var(--color-accent)"
          className="animate-spin"
        />
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Processing Payment</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Please wait while we process your payment…
      </p>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-lg)' }}>
        Do not press back or close this screen
      </p>
    </div>
  );
}
