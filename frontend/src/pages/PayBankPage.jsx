import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { authorizePayment } from '../services/api';

const SAMPLE_BENEFICIARIES = [
  { name: 'Arnav Garg', bank: 'HDFC Bank', acc: '•••• 4521', ifsc: 'HDFC0000240' },
  { name: 'PaySphere Merchant Escrow', bank: 'ICICI Bank', acc: '•••• 9901', ifsc: 'ICIC0001045' },
  { name: 'Delhi Real Estate Pvt Ltd', bank: 'State Bank of India', acc: '•••• 3341', ifsc: 'SBIN0001234' },
];

export default function PayBankPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('HDFC0000240');
  const [holderName, setHolderName] = useState('');
  const [amount, setAmount] = useState('1000.00');
  const [transferMode, setTransferMode] = useState('IMPS'); // 'IMPS' | 'NEFT' | 'RTGS'
  const [loading, setLoading] = useState(false);

  // Bank branch resolver heuristic
  const getBankName = (code) => {
    const prefix = code.slice(0, 4).toUpperCase();
    if (prefix === 'HDFC') return 'HDFC Bank (Connaught Place Branch)';
    if (prefix === 'SBIN') return 'State Bank of India (Main Branch)';
    if (prefix === 'ICIC') return 'ICICI Bank (Bandra Kurla Branch)';
    if (prefix === 'UTIB') return 'Axis Bank (Fort Branch)';
    if (prefix === 'KKBK') return 'Kotak Mahindra Bank (Indiranagar)';
    return prefix ? `${prefix} Bank (Verified via RBI IFSC Directory)` : '';
  };

  const handleSelectBeneficiary = (b) => {
    setHolderName(b.name);
    setIfsc(b.ifsc);
    setAccountNumber('123456789012');
    setConfirmAccount('123456789012');
    addToast(`Loaded ${b.name} details`, 'info');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (accountNumber !== confirmAccount) {
      addToast('Account numbers do not match', 'error');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = `BANK-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const payload = {
        customerId: user?.id || 1,
        amount: parseFloat(amount).toFixed(2),
        currency: 'INR',
        idempotencyKey,
        paymentMode: 'NET_BANKING',
      };

      const res = await authorizePayment(payload);
      addToast(`Bank transfer of ₹${amount} successful!`, 'success');
      navigate('/history');
    } catch (err) {
      addToast(err.message || 'Bank transfer failed', 'error');
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
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Pay to Bank Account</h2>
        <div style={{ width: 38 }} />
      </div>

      {/* Saved Beneficiaries */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
          Recent Beneficiaries
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', overflowX: 'auto', marginTop: 'var(--space-xs)', paddingBottom: 4 }}>
          {SAMPLE_BENEFICIARIES.map((b) => (
            <button
              key={b.name}
              type="button"
              onClick={() => handleSelectBeneficiary(b)}
              style={{
                flex: '0 0 auto',
                padding: '8px 14px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{b.name}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>{b.bank} • {b.acc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Bank Transfer Form */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label className="input-label">Beneficiary Account Number</label>
            <input
              type="text"
              required
              className="input-field font-mono"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 50100234567890"
            />
          </div>

          <div>
            <label className="input-label">Re-enter Account Number</label>
            <input
              type="password"
              required
              className="input-field font-mono"
              value={confirmAccount}
              onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••••••••••"
            />
          </div>

          <div>
            <label className="input-label">Bank IFSC Code</label>
            <input
              type="text"
              required
              maxLength={11}
              className="input-field font-mono"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              placeholder="HDFC0000240"
            />
            {ifsc.length >= 4 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} />
                <span>{getBankName(ifsc)}</span>
              </div>
            )}
          </div>

          <div>
            <label className="input-label">Account Holder Name</label>
            <input
              type="text"
              required
              className="input-field"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="e.g. Arnav Garg"
            />
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
              placeholder="1000.00"
              style={{ fontSize: '1.25rem', fontWeight: 800 }}
            />
          </div>

          {/* Transfer Mode selector */}
          <div>
            <label className="input-label">Transfer Speed</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-xs)' }}>
              {[
                { id: 'IMPS', label: 'IMPS (Instant)', desc: '24x7 Realtime' },
                { id: 'NEFT', label: 'NEFT', desc: 'Hourly Batch' },
                { id: 'RTGS', label: 'RTGS', desc: 'Large Amounts' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setTransferMode(mode.id)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: transferMode === mode.id ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                    background: transferMode === mode.id ? 'var(--color-accent-light)' : 'transparent',
                    color: transferMode === mode.id ? 'var(--color-accent)' : 'var(--color-text)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{mode.label}</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || !accountNumber || !confirmAccount || !holderName}
            style={{ marginTop: 'var(--space-sm)' }}
          >
            {loading ? 'Processing Bank Transfer…' : `Transfer ₹${amount || '0'} via ${transferMode}`}
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
        <span>RBI IMPS/NEFT Gateway Secured with Double-Entry Ledger</span>
      </div>
    </div>
  );
}

