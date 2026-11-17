import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Share2, FileText, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { formatINR } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

export default function StepResult({ success, result, errorMessage, onDone, onRetry }) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyRef = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success && result) {
    return (
      <div className="scale-in" style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
        {/* Animated green success circle & tick */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <svg width="96" height="96" viewBox="0 0 96 96" style={{ display: 'block', margin: '0 auto' }}>
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="4"
              strokeDasharray="276.5"
              strokeDashoffset="0"
              style={{ animation: 'successCircle 0.6s ease-out' }}
            />
            <path
              d="M28 50 L42 64 L68 36"
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="60"
              strokeDashoffset="0"
              style={{ animation: 'successTick 0.4s ease-out 0.4s both' }}
            />
          </svg>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)', marginBottom: 4 }}>
          Payment Successful!
        </h2>
        <div style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>
          {formatINR(result.amount)}
        </div>

        {/* Receipt card */}
        <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Paid To</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {result.paymentMode === 'UPI' ? 'UPI Recipient' : result.paymentMode === 'CREDIT_CARD' ? 'Card Merchant' : 'Payment'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Payment Method</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {result.paymentMode === 'UPI' ? 'UPI' : result.paymentMode === 'CREDIT_CARD' ? 'Card' : 'Net Banking'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Date & Time</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                {formatDateTime(result.createdAt || new Date().toISOString())}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Transaction ID</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontWeight: 600 }}>
                  {result.transactionReference?.slice(0, 16)}…
                </span>
                <button
                  type="button"
                  onClick={() => copyRef(result.transactionReference)}
                  className="btn btn-ghost"
                  style={{ padding: 4 }}
                  title="Copy Reference"
                >
                  {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Expandable Details */}
            {showDetails && (
              <div className="fade-in" style={{
                marginTop: 8,
                paddingTop: 12,
                borderTop: '1px dashed var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: '0.8125rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Full Reference</span>
                  <span className="font-mono" style={{ fontSize: '0.75rem' }}>{result.transactionReference}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Payment Status</span>
                  <span className="chip chip-success">Completed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Debited Account</span>
                  <span>HDFC Bank •••• 4521</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons: Done, Share receipt, View details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setShowDetails(!showDetails)}
            >
              <FileText size={16} />
              <span>{showDetails ? 'Hide details' : 'View details'}</span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => {
                const text = `PaySphere Payment Receipt: Paid ${formatINR(result.amount)} successfully. Transaction Ref: ${result.transactionReference}`;
                if (navigator.share) {
                  navigator.share({ title: 'Payment Receipt', text }).catch(() => {});
                } else {
                  copyRef(text);
                }
              }}
            >
              <Share2 size={16} />
              <span>Share receipt</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-large btn-full"
            onClick={onDone}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Failure screen
  return (
    <div className="scale-in" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
      <div style={{
        width: 88,
        height: 88,
        borderRadius: '50%',
        background: 'var(--color-danger-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto var(--space-lg)',
      }}>
        <XCircle size={48} color="var(--color-danger)" />
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-danger)', marginBottom: 8 }}>
        Payment Failed
      </h2>
      <p style={{
        fontSize: '0.9375rem',
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--space-xl)',
        maxWidth: 320,
        margin: '0 auto var(--space-xl)',
        lineHeight: 1.5,
      }}>
        {errorMessage || 'Payment failed, please try again.'}
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onDone}>
          Done
        </button>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={onRetry}>
          Retry
        </button>
      </div>
    </div>
  );
}
