import React, { useEffect, useState } from 'react';
import { X, BookOpen, ArrowDownLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { getLedgerEntries } from '../api';

export default function LedgerModal({ referenceId, onClose }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!referenceId) return;
    setLoading(true);
    getLedgerEntries(referenceId)
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [referenceId]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20,
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 720,
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: 28,
        position: 'relative',
        background: '#0d131f',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Double-Entry Ledger Audit Trail</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Immutable financial debit and credit records for reference: <span className="font-mono" style={{ color: 'var(--primary)' }}>{referenceId}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '6px 10px', borderRadius: 8 }}>
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading ledger entries...
          </div>
        ) : error ? (
          <div style={{ padding: 20, background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 10 }}>
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No ledger entries found for this transaction.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.map((entry, idx) => {
              const isDebit = entry.direction === 'DEBIT';
              return (
                <div
                  key={entry.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: isDebit ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: isDebit ? 'var(--danger)' : 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {isDebit ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{entry.type}</span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: isDebit ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: isDebit ? 'var(--danger)' : 'var(--success)',
                        }}>
                          {entry.direction}
                        </span>
                      </div>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'Just now'}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: isDebit ? 'var(--danger)' : 'var(--success)'
                    }}>
                      {isDebit ? '-' : '+'} ₹{parseFloat(entry.amount).toFixed(2)}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Balanced entry #{entry.id}</span>
                  </div>
                </div>
              );
            })}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              fontSize: '0.775rem',
              color: 'var(--success)',
            }}>
              <ShieldCheck size={16} />
              <span>Ledger entries are tamper-evident and balanced by the PaySphere double-entry subsystem.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

