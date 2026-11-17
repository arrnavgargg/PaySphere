import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowLeft, ShieldCheck, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authorizePayment } from '../services/api';

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC', color: '#004B87' },
  { id: 'SBIN', name: 'State Bank of India', code: 'SBI', color: '#280071' },
  { id: 'ICIC', name: 'ICICI Bank', code: 'ICICI', color: '#F37021' },
  { id: 'UTIB', name: 'Axis Bank', code: 'AXIS', color: '#97144D' },
  { id: 'KKBK', name: 'Kotak Bank', code: 'KOTAK', color: '#ED1C24' },
  { id: 'PUNB', name: 'Punjab National Bank', code: 'PNB', color: '#A20A3C' },
];

const ALL_BANKS = [
  ...POPULAR_BANKS,
  { id: 'BARB', name: 'Bank of Baroda', code: 'BOB' },
  { id: 'CNRB', name: 'Canara Bank', code: 'CANARA' },
  { id: 'UBIN', name: 'Union Bank of India', code: 'UNION' },
  { id: 'IDFB', name: 'IDFC First Bank', code: 'IDFC' },
  { id: 'YESB', name: 'Yes Bank', code: 'YES' },
  { id: 'INDB', name: 'IndusInd Bank', code: 'INDUSIND' },
  { id: 'FDRL', name: 'Federal Bank', code: 'FEDERAL' },
  { id: 'RBLN', name: 'RBL Bank', code: 'RBL' },
];

export default function NetBankingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [bankingType, setBankingType] = useState('RETAIL'); // 'RETAIL' | 'CORPORATE'
  const [amount, setAmount] = useState('500.00');
  const [remarks, setRemarks] = useState('Service Payment');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredBanks = ALL_BANKS.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  const handlePay = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = `NB-${selectedBank}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const payload = {
        customerId: user?.id || 1,
        amount: parseFloat(amount).toFixed(2),
        currency: 'INR',
        idempotencyKey,
        paymentMode: 'NET_BANKING',
      };

      const res = await authorizePayment(payload);
      addToast(`Net banking transfer of ₹${amount} via ${selectedBank} completed!`, 'success');
      navigate('/history');
    } catch (err) {
      addToast(err.message || 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page fade-in" style={{ maxWidth: 520, margin: '0 auto', padding: 'var(--space-md)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn btn-ghost"
          style={{ padding: '8px', borderRadius: 'var(--radius-full)' }}
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Net Banking</h2>
        <div style={{ width: 38 }} />
      </div>

      {/* Popular Banks */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
          Popular Banks
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
          {POPULAR_BANKS.map((b) => {
            const isSelected = selectedBank === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBank(b.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 8px',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-accent-light)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-md)',
                    background: `${b.color || '#4F46E5'}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    color: b.color || 'var(--color-accent)',
                  }}
                >
                  {b.code}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)', textAlign: 'center' }}>
                  {b.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Payment Form */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {/* Banking Type Toggle */}
          <div>
            <label className="input-label">Account Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xs)' }}>
              {['RETAIL', 'CORPORATE'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBankingType(type)}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: bankingType === type ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                    background: bankingType === type ? 'var(--color-accent-light)' : 'transparent',
                    color: bankingType === type ? 'var(--color-accent)' : 'var(--color-text)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  {type === 'RETAIL' ? 'Retail / Individual' : 'Corporate / Business'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Select Other Banks</label>
            <select
              className="input-field"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
            >
              {ALL_BANKS.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              className="input-field font-mono"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500.00"
              style={{ fontSize: '1.25rem', fontWeight: 800 }}
            />
          </div>

          <div>
            <label className="input-label">Remarks / Description</label>
            <input
              type="text"
              className="input-field"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Utility bill, rent, or tuition"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 'var(--space-xs)' }}
          >
            {loading ? 'Connecting to Bank…' : `Proceed with ${selectedBank} Net Banking`}
          </button>
        </form>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 'var(--space-lg)',
          color: 'var(--color-text-muted)',
          fontSize: '0.75rem',
        }}
      >
        <ShieldCheck size={16} color="var(--color-success)" />
        <span>Redirects via NPCI Bharat BillPay & Bank NetBanking Gateway</span>
      </div>
    </div>
  );
}
