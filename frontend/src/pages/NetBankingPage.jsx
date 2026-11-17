import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Search,
  Lock,
  Building,
  UserCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authorizePayment } from '../services/api';

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC', color: '#004B87', lightColor: '#EEF4FA' },
  { id: 'SBIN', name: 'State Bank of India', code: 'SBI', color: '#1B365D', lightColor: '#EEF2F7' },
  { id: 'ICIC', name: 'ICICI Bank', code: 'ICICI', color: '#B02A30', lightColor: '#FDF0F0' },
  { id: 'UTIB', name: 'Axis Bank', code: 'AXIS', color: '#861F41', lightColor: '#FAF0F3' },
  { id: 'KKBK', name: 'Kotak Mahindra Bank', code: 'KOTAK', color: '#ED1C24', lightColor: '#FDF0F0' },
  { id: 'PUNB', name: 'Punjab National Bank', code: 'PNB', color: '#A20A3C', lightColor: '#FAF0F3' },
];

const ALL_BANKS = [
  ...POPULAR_BANKS,
  { id: 'BARB', name: 'Bank of Baroda', code: 'BOB', color: '#F26522' },
  { id: 'CNRB', name: 'Canara Bank', code: 'CANARA', color: '#0084CA' },
  { id: 'UBIN', name: 'Union Bank of India', code: 'UNION', color: '#004B87' },
  { id: 'IDFB', name: 'IDFC First Bank', code: 'IDFC', color: '#991B1E' },
  { id: 'YESB', name: 'Yes Bank', code: 'YES', color: '#00529B' },
  { id: 'INDB', name: 'IndusInd Bank', code: 'INDUSIND', color: '#851C1D' },
  { id: 'FDRL', name: 'Federal Bank', code: 'FEDERAL', color: '#004C8F' },
  { id: 'RBLN', name: 'RBL Bank', code: 'RBL', color: '#004A97' },
  { id: 'IOBA', name: 'Indian Overseas Bank', code: 'IOB', color: '#134074' },
];

const SAVED_BENEFICIARIES = [
  {
    name: 'Arnav Garg',
    accountNumber: '501004829104',
    ifsc: 'HDFC0000240',
    bank: 'HDFC Bank, Connaught Place Branch, New Delhi',
    category: 'Personal Account',
  },
  {
    name: 'PaySphere Merchant Escrow',
    accountNumber: '001105029381',
    ifsc: 'ICIC0001045',
    bank: 'ICICI Bank, Bandra Kurla Complex, Mumbai',
    category: 'Business Escrow',
  },
  {
    name: 'Delhi Power Distribution Ltd',
    accountNumber: '381920491823',
    ifsc: 'SBIN0001234',
    bank: 'State Bank of India, Parliament Street Branch',
    category: 'Utility Vendor',
  },
];

export default function NetBankingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Payer Bank Details
  const [selectedBankId, setSelectedBankId] = useState('HDFC');
  const [bankingType, setBankingType] = useState('RETAIL'); // 'RETAIL' | 'CORPORATE'
  const [query, setQuery] = useState('');

  // Beneficiary (Payee) Details
  const [beneficiaryName, setBeneficiaryName] = useState('Arnav Garg');
  const [accountNumber, setAccountNumber] = useState('501004829104');
  const [confirmAccount, setConfirmAccount] = useState('501004829104');
  const [ifsc, setIfsc] = useState('HDFC0000240');
  const [showAccount, setShowAccount] = useState(false);

  // Transfer & Amount Details
  const [amount, setAmount] = useState('1500.00');
  const [remarks, setRemarks] = useState('Consulting & Development Services');
  const [transferMode, setTransferMode] = useState('IMPS'); // 'IMPS' | 'NEFT' | 'RTGS'

  // Gateway Simulation Modal States
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [gatewayStep, setGatewayStep] = useState(1); // 1: Login, 2: OTP, 3: Processing
  const [bankUserId, setBankUserId] = useState('ARN_GARG_9811');
  const [bankPassword, setBankPassword] = useState('••••••••••');
  const [bankOtp, setBankOtp] = useState('849102');
  const [loading, setLoading] = useState(false);

  const selectedBank = ALL_BANKS.find((b) => b.id === selectedBankId) || POPULAR_BANKS[0];

  // Resolve IFSC Branch Info
  const resolveIfscBranch = (code) => {
    const clean = code.toUpperCase().trim();
    if (clean.startsWith('HDFC')) return 'HDFC Bank • Connaught Place, New Delhi';
    if (clean.startsWith('SBIN')) return 'State Bank of India • Corporate Accounts Branch';
    if (clean.startsWith('ICIC')) return 'ICICI Bank • Bandra Kurla Complex, Mumbai';
    if (clean.startsWith('UTIB')) return 'Axis Bank • Fort Financial Centre, Mumbai';
    if (clean.startsWith('KKBK')) return 'Kotak Mahindra Bank • MG Road, Bengaluru';
    if (clean.startsWith('PUNB')) return 'Punjab National Bank • Barakhamba Branch';
    if (clean.length >= 4) return `${clean.slice(0, 4)} Bank • Verified via RBI RTGS Directory`;
    return '';
  };

  const handleSelectBeneficiary = (b) => {
    setBeneficiaryName(b.name);
    setAccountNumber(b.accountNumber);
    setConfirmAccount(b.accountNumber);
    setIfsc(b.ifsc);
    addToast(`Selected payee: ${b.name}`, 'info');
  };

  const handleInitiatePayment = (e) => {
    e.preventDefault();

    if (!accountNumber || accountNumber.length < 8) {
      addToast('Please enter a valid Account Number (min 8 digits)', 'error');
      return;
    }

    if (accountNumber !== confirmAccount) {
      addToast('Beneficiary Account Numbers do not match!', 'error');
      return;
    }

    if (!ifsc || ifsc.length < 8) {
      addToast('Please enter a valid 11-digit IFSC code', 'error');
      return;
    }

    if (!beneficiaryName.trim()) {
      addToast('Please enter Beneficiary Account Holder Name', 'error');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      addToast('Please enter a valid transfer amount', 'error');
      return;
    }

    // Launch realistic Bank Portal modal
    setGatewayStep(1);
    setShowGatewayModal(true);
  };

  const handleBankLoginSubmit = (e) => {
    e.preventDefault();
    if (!bankUserId.trim() || !bankPassword.trim()) {
      addToast('Please enter NetBanking credentials', 'error');
      return;
    }
    setGatewayStep(2); // Proceed to 2FA OTP
  };

  const handleFinalizeTransfer = async (e) => {
    e.preventDefault();
    setGatewayStep(3); // Loading state
    setLoading(true);

    try {
      const idempotencyKey = `NB-${selectedBank.code}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const payload = {
        customerId: user?.id || 1,
        amount: parseFloat(amount).toFixed(2),
        currency: 'INR',
        idempotencyKey,
        paymentMode: 'NET_BANKING',
      };

      const res = await authorizePayment(payload);

      // Brief delay to showcase realistic bank processing
      setTimeout(() => {
        setLoading(false);
        setShowGatewayModal(false);
        addToast(
          `Transfer of ₹${amount} to ${beneficiaryName} successfully debited via ${selectedBank.name}!`,
          'success'
        );
        navigate('/history');
      }, 1200);
    } catch (err) {
      setLoading(false);
      setGatewayStep(2);
      addToast(err.message || 'NetBanking authorization failed', 'error');
    }
  };

  return (
    <div className="page fade-in" style={{ maxWidth: 560, margin: '0 auto', padding: 'var(--space-md)' }}>
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
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Internet Banking Gateway</h2>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <ShieldCheck size={12} color="var(--color-success)" />
            <span>256-Bit Bank Grade SSL Encrypted</span>
          </div>
        </div>
        <div style={{ width: 38 }} />
      </div>

      {/* 1. Saved Beneficiaries Quick Select */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Beneficiaries
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-accent)', fontWeight: 600 }}>
            ★ Verified IFSC
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', overflowX: 'auto', paddingBottom: 4 }}>
          {SAVED_BENEFICIARIES.map((b) => {
            const isSelected = accountNumber === b.accountNumber;
            return (
              <button
                key={b.name}
                type="button"
                onClick={() => handleSelectBeneficiary(b)}
                style={{
                  flex: '0 0 auto',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  background: isSelected ? 'var(--color-accent-light)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: isSelected ? 'var(--color-accent)' : 'var(--color-text)' }}>
                  {b.name}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  A/C •••• {b.accountNumber.slice(-4)} • {b.ifsc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main NetBanking Form */}
      <form onSubmit={handleInitiatePayment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Section A: Paying To (Beneficiary Details) */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(8, 145, 178, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0891B2',
              }}
            >
              <Building size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0 }}>
                Beneficiary (Payee) Account Details
              </h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Enter the destination bank account and IFSC code to receive funds
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* Account Holder Name */}
            <div>
              <label className="input-label">Beneficiary Legal Name</label>
              <input
                type="text"
                required
                className="input-field"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="e.g. Arnav Garg or PaySphere Merchant"
              />
            </div>

            {/* Account Number */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">Beneficiary Account Number</label>
                <button
                  type="button"
                  onClick={() => setShowAccount(!showAccount)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                >
                  {showAccount ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showAccount ? 'Mask' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showAccount ? 'text' : 'password'}
                required
                className="input-field font-mono"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 501004829104"
              />
            </div>

            {/* Confirm Account Number */}
            <div>
              <label className="input-label">Re-enter Account Number</label>
              <input
                type="text"
                required
                className="input-field font-mono"
                value={confirmAccount}
                onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 501004829104"
              />
              {confirmAccount && (
                <div style={{ fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {accountNumber === confirmAccount ? (
                    <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> Account numbers match
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertCircle size={13} /> Numbers do not match yet
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* IFSC Code with live resolver */}
            <div>
              <label className="input-label">Bank IFSC Code</label>
              <input
                type="text"
                required
                maxLength={11}
                className="input-field font-mono"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0000240"
              />
              {ifsc.length >= 4 && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-accent)',
                    marginTop: 6,
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-accent-light)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={14} color="var(--color-accent)" />
                  <span style={{ fontWeight: 600 }}>{resolveIfscBranch(ifsc)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section B: Payer Bank Selection */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0 }}>
                Select Your Bank (Payer)
              </h3>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Choose the bank account you will log in and pay from
              </p>
            </div>

            {/* Retail vs Corporate Switch */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--color-surface-secondary)',
                borderRadius: 'var(--radius-full)',
                padding: 3,
                border: '1px solid var(--color-border)',
              }}
            >
              {['RETAIL', 'CORPORATE'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBankingType(type)}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: bankingType === type ? 'var(--color-surface)' : 'transparent',
                    color: bankingType === type ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    cursor: 'pointer',
                    boxShadow: bankingType === type ? 'var(--shadow-xs)' : 'none',
                  }}
                >
                  {type === 'RETAIL' ? 'Retail' : 'Corporate'}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Bank Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            {POPULAR_BANKS.map((b) => {
              const isSelected = selectedBankId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBankId(b.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '12px 6px',
                    borderRadius: 'var(--radius-lg)',
                    border: isSelected ? `2px solid ${b.color}` : '1px solid var(--color-border)',
                    background: isSelected ? (b.lightColor || 'var(--color-accent-light)') : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: `${b.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.8125rem',
                      color: b.color,
                      border: `1px solid ${b.color}30`,
                    }}
                  >
                    {b.code}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text)', textAlign: 'center', lineHeight: 1.2 }}>
                    {b.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* All other banks dropdown */}
          <div>
            <label className="input-label">All Other Indian Banks (40+ Banks)</label>
            <select
              className="input-field"
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
            >
              {ALL_BANKS.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name} ({bank.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section C: Transfer Amount, Speed & Payment Remarks */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label className="input-label">Transfer Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              className="input-field font-mono"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1500.00"
              style={{ fontSize: '1.5rem', fontWeight: 900 }}
            />

            {/* Quick amount chips */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {['500', '1000', '2500', '5000', '10000'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  +₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Speed Selector */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label className="input-label">Settlement Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-xs)' }}>
              {[
                { id: 'IMPS', label: 'IMPS (Instant)', desc: '24x7 Instant • Up to ₹5 Lakh' },
                { id: 'NEFT', label: 'NEFT', desc: 'RBI Batches • No Limit' },
                { id: 'RTGS', label: 'RTGS', desc: 'Realtime • Min ₹2 Lakh' },
              ].map((m) => {
                const isSelected = transferMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTransferMode(m.id)}
                    style={{
                      padding: '8px 6px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                      background: isSelected ? 'var(--color-accent-light)' : 'transparent',
                      color: isSelected ? 'var(--color-accent)' : 'var(--color-text)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.8125rem' }}>{m.label}</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="input-label">Payment Remarks / Purpose</label>
            <input
              type="text"
              className="input-field"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Vendor Invoice, Rent, Professional Services"
            />
          </div>

          {/* Fee & Total Summary */}
          <div
            style={{
              marginTop: 'var(--space-md)',
              padding: '12px var(--space-md)',
              background: 'var(--color-surface-secondary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span>Transfer Amount</span>
              <span className="font-mono">₹{parseFloat(amount || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
              <span>PaySphere NetBanking Fee</span>
              <span style={{ fontWeight: 700 }}>FREE (₹0.00)</span>
            </div>
            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: 6,
                marginTop: 2,
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '0.9375rem',
                color: 'var(--color-text)',
              }}
            >
              <span>Total Payable</span>
              <span className="font-mono" style={{ color: 'var(--color-accent)' }}>
                ₹{parseFloat(amount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: 'var(--space-md)' }}
          >
            <span>Proceed to {selectedBank.name} Gateway</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>

      {/* Realistic Bank Gateway Modal Simulator */}
      {showGatewayModal && (
        <div className="modal-backdrop">
          <div
            className="modal-content"
            style={{
              maxWidth: 460,
              padding: 0,
              overflow: 'hidden',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            {/* Bank Branded Top Banner */}
            <div
              style={{
                background: selectedBank.color || '#004B87',
                color: '#fff',
                padding: '20px var(--space-xl)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.6875rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Secure NetBanking Gateway
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                  {selectedBank.name}
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {bankingType === 'RETAIL' ? 'Retail' : 'Corporate'}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 'var(--space-xl)' }}>
              {/* Payment Summary Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-secondary)',
                  marginBottom: 'var(--space-lg)',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.6875rem' }}>Beneficiary</div>
                  <div style={{ fontWeight: 700 }}>{beneficiaryName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.6875rem' }}>Amount</div>
                  <div style={{ fontWeight: 900, color: 'var(--color-accent)', fontSize: '1.125rem' }}>
                    ₹{amount}
                  </div>
                </div>
              </div>

              {gatewayStep === 1 ? (
                /* Step 1: Bank NetBanking Credentials */
                <form onSubmit={handleBankLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div>
                    <label className="input-label">Customer ID / NetBanking User ID</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={bankUserId}
                      onChange={(e) => setBankUserId(e.target.value)}
                      placeholder="e.g. 50921820"
                    />
                  </div>

                  <div>
                    <label className="input-label">NetBanking IPIN / Password</label>
                    <input
                      type="password"
                      required
                      className="input-field"
                      value={bankPassword}
                      onChange={(e) => setBankPassword(e.target.value)}
                      placeholder="••••••••••"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-full"
                      onClick={() => setShowGatewayModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-full">
                      Authenticate
                    </button>
                  </div>
                </form>
              ) : gatewayStep === 2 ? (
                /* Step 2: 2FA High-Security OTP */
                <form onSubmit={handleFinalizeTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div style={{ textAlign: 'center', marginBottom: 4 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', background: 'var(--color-accent-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                      <Lock size={22} color="var(--color-accent)" />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                      High-Security Transaction OTP
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Enter the 6-digit OTP sent by {selectedBank.code} to your registered mobile number ending in **4521
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      className="input-field font-mono"
                      value={bankOtp}
                      onChange={(e) => setBankOtp(e.target.value)}
                      placeholder="849102"
                      style={{
                        textAlign: 'center',
                        fontSize: '1.375rem',
                        fontWeight: 900,
                        letterSpacing: '0.3em',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-full"
                      onClick={() => setGatewayStep(1)}
                    >
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                      Confirm Payment
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 3: Processing & Double-Entry Ledger Hold */
                <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-full)',
                      border: '4px solid var(--color-accent-light)',
                      borderTopColor: 'var(--color-accent)',
                      animation: 'spin 0.8s linear infinite',
                      margin: '0 auto var(--space-md)',
                    }}
                  />
                  <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                  `}</style>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.0625rem', fontWeight: 800 }}>
                    Authorizing NetBanking Debit...
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Recording double-entry audit ledger with {selectedBank.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security footer info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 'var(--space-xl)',
          color: 'var(--color-text-muted)',
          fontSize: '0.75rem',
        }}
      >
        <ShieldCheck size={16} color="var(--color-success)" />
        <span>RBI RTGS/NEFT/IMPS Compliant • Double-Entry Financial Ledger Hold</span>
      </div>
    </div>
  );
}
