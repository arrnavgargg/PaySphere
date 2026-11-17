import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
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
        background: 'var(--color-danger-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-md)',
      }}>
        <AlertTriangle size={28} color="var(--color-danger)" />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Something went wrong</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: 300, marginBottom: 'var(--space-md)' }}>
        {message || 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
