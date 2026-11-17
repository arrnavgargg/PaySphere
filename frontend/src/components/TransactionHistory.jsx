import React, { useEffect, useState } from 'react';
import { 
  RefreshCw, 
  Search, 
  Check, 
  RotateCcw, 
  BookOpen, 
  Copy, 
  Filter,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { getAllPayments, capturePayment, refundPayment } from '../api';
import LedgerModal from './LedgerModal';

export default function TransactionHistory({ refreshTrigger }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedLedgerRef, setSelectedLedgerRef] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getAllPayments();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger]);

  const handleCapture = async (refId) => {
    setActionLoading((prev) => ({ ...prev, [refId]: true }));
    try {
      await capturePayment(refId);
      await fetchTransactions();
    } catch (err) {
      alert(`Capture failed: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [refId]: false }));
    }
  };

  const handleRefund = async (refId) => {
    const reason = prompt('Enter refund reason:', 'Customer requested refund');
    if (reason === null) return;
    setActionLoading((prev) => ({ ...prev, [refId]: true }));
    try {
      await refundPayment(refId, null, reason);
      await fetchTransactions();
    } catch (err) {
      alert(`Refund failed: ${err.message}`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [refId]: false }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filtered = transactions.filter((tx) => {
    const matchesFilter = filterStatus === 'ALL' || tx.status === filterStatus;
    const matchesSearch =
      (tx.transactionReference && tx.transactionReference.toLowerCase().includes(search.toLowerCase())) ||
      (tx.idempotencyKey && tx.idempotencyKey.toLowerCase().includes(search.toLowerCase())) ||
      (tx.paymentMode && tx.paymentMode.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AUTHORIZED':
        return <span className="badge badge-authorized">AUTHORIZED</span>;
      case 'CAPTURED':
        return <span className="badge badge-captured">CAPTURED</span>;
      case 'REFUNDED':
        return <span className="badge badge-refunded">REFUNDED</span>;
      default:
        return <span className="badge badge-failed">{status || 'FAILED'}</span>;
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '30px auto' }}>
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Transaction Ledger & History</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Live record of authorizations, captures, reversals, and audit trail
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by Reference ID, Idempotency Key, or Channel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 38 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', 'AUTHORIZED', 'CAPTURED', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                borderRadius: 8,
                background: filterStatus === st ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: filterStatus === st ? '#fff' : 'var(--text-secondary)',
                border: filterStatus === st ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading && transactions.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p>Loading transactions from backend...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--danger)' }}>
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No transactions found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Reference / Token</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Amount</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Channel</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Timestamp</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => {
                  const isActing = actionLoading[tx.transactionReference];
                  return (
                    <tr
                      key={tx.transactionReference}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Reference & Key */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {tx.transactionReference?.substring(0, 14)}...
                          </span>
                          <button
                            onClick={() => copyToClipboard(tx.transactionReference)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            title="Copy full reference ID"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                        <div className="font-mono" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          Key: {tx.idempotencyKey}
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '14px 18px', fontWeight: 700, fontSize: '0.95rem' }}>
                        ₹{parseFloat(tx.amount || 0).toFixed(2)}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                          {tx.currency}
                        </span>
                      </td>

                      {/* Channel */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                        }}>
                          {tx.paymentMode || 'Standard'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        {getStatusBadge(tx.status)}
                      </td>

                      {/* Timestamp */}
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          {/* Capture button */}
                          {tx.status === 'AUTHORIZED' && (
                            <button
                              onClick={() => handleCapture(tx.transactionReference)}
                              disabled={isActing}
                              className="btn btn-secondary"
                              style={{
                                fontSize: '0.725rem',
                                padding: '5px 10px',
                                background: 'rgba(14, 165, 233, 0.12)',
                                color: 'var(--info)',
                                border: '1px solid rgba(14, 165, 233, 0.3)',
                              }}
                              title="Capture authorized funds into settlement"
                            >
                              <Check size={12} />
                              <span>Capture</span>
                            </button>
                          )}

                          {/* Refund button */}
                          {tx.status === 'CAPTURED' && (
                            <button
                              onClick={() => handleRefund(tx.transactionReference)}
                              disabled={isActing}
                              className="btn btn-secondary"
                              style={{
                                fontSize: '0.725rem',
                                padding: '5px 10px',
                                background: 'rgba(245, 158, 11, 0.12)',
                                color: 'var(--warning)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                              }}
                              title="Issue refund and reverse balance"
                            >
                              <RotateCcw size={12} />
                              <span>Refund</span>
                            </button>
                          )}

                          {/* Inspect Ledger */}
                          <button
                            onClick={() => setSelectedLedgerRef(tx.transactionReference)}
                            className="btn btn-outline"
                            style={{ fontSize: '0.725rem', padding: '5px 10px' }}
                            title="Inspect double-entry debit/credit ledger records"
                          >
                            <BookOpen size={12} />
                            <span>Ledger</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ledger Modal */}
      {selectedLedgerRef && (
        <LedgerModal
          referenceId={selectedLedgerRef}
          onClose={() => setSelectedLedgerRef(null)}
        />
      )}
    </div>
  );
}

