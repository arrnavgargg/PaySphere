import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAllPayments } from '../../services/api';
import Avatar from '../shared/Avatar';
import StatusChip from '../shared/StatusChip';
import AmountDisplay from '../shared/AmountDisplay';
import { SkeletonRow } from '../shared/SkeletonLoader';
import { formatDateTime } from '../../utils/formatDate';

export default function RecentTransactions() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllPayments()
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTxns(sorted.slice(0, 5));
      })
      .catch(() => setTxns([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Recent Transactions</h3>
        <button
          className="btn btn-ghost"
          style={{ fontSize: '0.8125rem', padding: '4px 8px', gap: 4 }}
          onClick={() => navigate('/history')}
        >
          View All <ArrowRight size={14} />
        </button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-md)' }}>
            {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </div>
        ) : txns.length === 0 ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            No transactions yet. Make your first payment!
          </div>
        ) : (
          txns.map((tx, i) => (
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
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              onClick={() => navigate('/history')}
            >
              <Avatar name={tx.paymentMode || 'Payment'} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {tx.paymentMode === 'UPI' ? 'UPI Payment' : tx.paymentMode === 'CREDIT_CARD' ? 'Card Payment' : 'Payment'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {formatDateTime(tx.createdAt)}
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <AmountDisplay amount={tx.amount} type="sent" size="sm" />
                <StatusChip status={tx.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
