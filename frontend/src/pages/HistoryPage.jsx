import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { getAllPayments } from '../services/api';
import { getDateGroup, formatDateTime } from '../utils/formatDate';
import { friendlyError } from '../utils/errorMessages';
import Avatar from '../components/shared/Avatar';
import StatusChip from '../components/shared/StatusChip';
import AmountDisplay from '../components/shared/AmountDisplay';
import EmptyState from '../components/shared/EmptyState';
import ErrorState from '../components/shared/ErrorState';
import { SkeletonRow } from '../components/shared/SkeletonLoader';

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'SENT', label: 'Sent' },
  { id: 'RECEIVED', label: 'Received' },
  { id: 'FAILED', label: 'Failed' },
];

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPayments();
      const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransactions(sorted);
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = transactions.filter((tx) => {
    if (filter === 'FAILED' && !['FAILED', 'REJECTED'].includes(tx.status)) return false;
    if (filter === 'SENT' && ['FAILED', 'REJECTED', 'REFUNDED'].includes(tx.status)) return false;
    if (filter === 'RECEIVED' && tx.status !== 'REFUNDED') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        tx.transactionReference?.toLowerCase().includes(q) ||
        tx.paymentMode?.toLowerCase().includes(q) ||
        String(tx.amount).includes(q)
      );
    }
    return true;
  });

  // Group by date
  const groups = {};
  filtered.forEach((tx) => {
    const key = getDateGroup(tx.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });

  const getPayeeName = (tx) => {
    if (tx.paymentMode === 'UPI') return 'UPI Payment';
    if (tx.paymentMode === 'CREDIT_CARD') return 'Card Payment';
    return 'Payment';
  };

  return (
    <div className="page fade-in">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>
        Transaction History
      </h1>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
        <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: 40 }}
          placeholder="Search transactions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search transactions"
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`btn ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '6px 16px',
              fontSize: '0.8125rem',
              borderRadius: 'var(--radius-full)',
              flexShrink: 0,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ padding: 'var(--space-md)' }}>
          {[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No transactions found" message={search ? 'Try a different search term.' : 'Make your first payment to see it here.'} />
      ) : (
        Object.entries(groups).map(([date, txns]) => (
          <div key={date} style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)', paddingLeft: 4 }}>
              {date}
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              {txns.map((tx, i) => (
                <div
                  key={tx.transactionReference || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: '14px var(--space-md)',
                    borderBottom: i < txns.length - 1 ? '1px solid var(--color-border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}
                  onClick={() => setSelectedTx(tx)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Avatar name={getPayeeName(tx)} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{getPayeeName(tx)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {formatDateTime(tx.createdAt)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <AmountDisplay
                      amount={tx.amount}
                      type={tx.status === 'REFUNDED' ? 'received' : 'sent'}
                      size="sm"
                    />
                    <StatusChip status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Transaction Detail Sheet */}
      {selectedTx && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="card slide-up"
            style={{
              width: '100%',
              maxWidth: 480,
              padding: 'var(--space-lg)',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--color-border)', margin: '0 auto var(--space-lg)' }} />

            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Transaction Details</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ textAlign: 'center', paddingBottom: 'var(--space-lg)', borderBottom: '1px solid var(--color-border)' }}>
                <AmountDisplay amount={selectedTx.amount} size="lg" type={selectedTx.status === 'REFUNDED' ? 'received' : 'sent'} />
                <div style={{ marginTop: 8 }}><StatusChip status={selectedTx.status} /></div>
              </div>

              {[
                ['Type', getPayeeName(selectedTx)],
                ['Method', selectedTx.paymentMode || 'Standard'],
                ['Date', formatDateTime(selectedTx.createdAt)],
                ['Transaction ID', selectedTx.transactionReference || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              <button className="btn btn-secondary btn-full" onClick={() => setSelectedTx(null)}>
                Close
              </button>
              <button className="btn btn-ghost btn-full" style={{ color: 'var(--color-danger)', fontSize: '0.8125rem' }}>
                Report a Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
