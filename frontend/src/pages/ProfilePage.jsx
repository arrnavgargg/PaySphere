import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  QrCode,
  CreditCard,
  Building2,
  Plus,
  Trash2,
  ChevronRight,
  Sun,
  Moon,
  HelpCircle,
  Shield,
  LogOut,
  CheckCircle2,
  Code2,
  ExternalLink,
} from 'lucide-react';
import { getAllCustomers, addCustomerInstrument } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/shared/Avatar';
import { SkeletonRow } from '../components/shared/SkeletonLoader';

const DEFAULT_BANK_ACCOUNTS = [
  { id: 'bank-1', bankName: 'HDFC Bank', accountNumber: '•••• 4521', ifsc: 'HDFC0000240', isPrimary: true },
  { id: 'bank-2', bankName: 'State Bank of India', accountNumber: '•••• 8820', ifsc: 'SBIN0001234', isPrimary: false },
];

export default function ProfilePage() {
  const { dark, toggle } = useTheme();
  const { addToast } = useToast();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removedIds, setRemovedIds] = useState(new Set());
  const [bankAccounts, setBankAccounts] = useState(DEFAULT_BANK_ACCOUNTS);

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'UPI', 'CARD', 'BANK'

  // Match the logged in user with backend customer records
  const activeCustomer = customers.find(
    (c) =>
      c.id === authUser?.id ||
      c.email?.toLowerCase() === authUser?.email?.toLowerCase() ||
      c.fullName?.toLowerCase() === authUser?.fullName?.toLowerCase()
  );

  const user = activeCustomer || authUser || (customers.length > 0 ? customers[0] : null);

  // Automate UPI ID based on the active user's username/email
  const userHandle = user?.email?.split('@')[0] || user?.fullName?.toLowerCase().replace(/\s+/g, '') || 'user';
  const automatedUpi = `${userHandle}@okpaysphere`;
  const userUpi = user?.instruments?.find((i) => i.type === 'UPI')?.detail || user?.upiId || automatedUpi;

  const fetchUserData = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const upiInstruments = (user?.instruments?.filter((i) => i.type === 'UPI') || []).filter((i) => !removedIds.has(i.id));
  const cardInstruments = (user?.instruments?.filter((i) => i.type === 'CREDIT_CARD') || []).filter((i) => !removedIds.has(i.id));

  const handleRemoveInstrument = (id, label) => {
    setRemovedIds((prev) => new Set([...prev, id]));
    addToast(`${label || 'Payment method'} removed`, 'info');
  };

  const handleRemoveBank = (id, name) => {
    setBankAccounts((prev) => prev.filter((b) => b.id !== id));
    addToast(`${name} unlinked`, 'info');
  };

  const handleAddInstrumentSubmit = async (data) => {
    if (!user) return;
    try {
      await addCustomerInstrument(user.id, data);
      await fetchUserData();
      setActiveModal(null);
      addToast(`${data.type === 'UPI' ? 'UPI ID' : 'Card'} linked successfully`, 'success');
    } catch (err) {
      addToast('Failed to add payment method. Please try again.', 'error');
    }
  };

  const handleAddBankSubmit = (bankData) => {
    const newBank = {
      id: `bank-${Date.now()}`,
      bankName: bankData.bankName,
      accountNumber: `•••• ${bankData.accountNumber.slice(-4)}`,
      ifsc: bankData.ifsc,
      isPrimary: bankAccounts.length === 0,
    };
    setBankAccounts((prev) => [...prev, newBank]);
    setActiveModal(null);
    addToast(`${bankData.bankName} account linked successfully`, 'success');
  };

  return (
    <div className="page fade-in">
      {/* Profile Header */}
      <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <Avatar name={user?.fullName || 'User'} size={60} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>
              {user?.fullName || 'User'}
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              {user?.email || `${userHandle}@paysphere.app`}
            </p>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
            }}>
              UPI ID: {userUpi}
            </span>
          </div>
        </div>
      </div>

      {/* Linked Bank Accounts */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Linked Bank Accounts</h3>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '4px 8px', fontSize: '0.8125rem', color: 'var(--color-accent)' }}
            onClick={() => setActiveModal('BANK')}
          >
            <Plus size={16} /> Add Bank
          </button>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {bankAccounts.length === 0 ? (
            <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No bank accounts linked. Link a bank account to transfer funds.
            </div>
          ) : (
            bankAccounts.map((b, i) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: '14px var(--space-md)',
                  borderBottom: i < bankAccounts.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(8, 145, 178, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Building2 size={20} color="#0891B2" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{b.bankName}</span>
                    {b.isPrimary && (
                      <span className="chip chip-success" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        Primary
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    A/C {b.accountNumber} • IFSC {b.ifsc}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: 6, color: 'var(--color-text-muted)' }}
                  onClick={() => handleRemoveBank(b.id, b.bankName)}
                  title="Unlink account"
                  aria-label={`Unlink ${b.bankName}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Saved UPI IDs */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Saved UPI IDs</h3>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '4px 8px', fontSize: '0.8125rem', color: 'var(--color-accent)' }}
            onClick={() => setActiveModal('UPI')}
          >
            <Plus size={16} /> Add UPI ID
          </button>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 'var(--space-md)' }}><SkeletonRow /></div>
          ) : upiInstruments.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: '14px var(--space-md)',
              }}
            >
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <QrCode size={20} color="#4F46E5" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{userUpi}</span>
                  <span className="chip chip-success" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                    Primary • Auto-Linked
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  PaySphere Virtual Payment Address (VPA)
                </div>
              </div>
            </div>
          ) : (
            upiInstruments.map((inst, i) => (
              <div
                key={inst.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: '14px var(--space-md)',
                  borderBottom: i < upiInstruments.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(79, 70, 229, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <QrCode size={20} color="#4F46E5" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {inst.label || inst.providerOrNetwork || 'UPI ID'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {inst.detail}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: 6, color: 'var(--color-text-muted)' }}
                  onClick={() => handleRemoveInstrument(inst.id, inst.label || 'UPI ID')}
                  title="Remove UPI ID"
                  aria-label="Remove UPI ID"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Saved Cards */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Saved Cards</h3>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '4px 8px', fontSize: '0.8125rem', color: 'var(--color-accent)' }}
            onClick={() => setActiveModal('CARD')}
          >
            <Plus size={16} /> Add Card
          </button>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 'var(--space-md)' }}><SkeletonRow /></div>
          ) : cardInstruments.length === 0 ? (
            <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No cards saved. Add a debit or credit card for 1-tap checkout.
            </div>
          ) : (
            cardInstruments.map((inst, i) => (
              <div
                key={inst.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: '14px var(--space-md)',
                  borderBottom: i < cardInstruments.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(5, 150, 105, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CreditCard size={20} color="#059669" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {inst.label || inst.providerOrNetwork || 'Debit Card'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    •••• {inst.detail?.replace(/\s/g, '').slice(-4) || '4242'}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: 6, color: 'var(--color-text-muted)' }}
                  onClick={() => handleRemoveInstrument(inst.id, inst.label || 'Card')}
                  title="Remove card"
                  aria-label="Remove card"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preferences & Settings */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>Settings</h3>
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: '14px var(--space-md)',
              width: '100%',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid var(--color-border)',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-main)',
            }}
          >
            {dark ? <Sun size={20} color="var(--color-warning)" /> : <Moon size={20} color="var(--color-text-secondary)" />}
            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>
              {dark ? 'Light Mode' : 'Dark Mode'}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              {dark ? 'On' : 'Off'}
            </span>
            <ChevronRight size={16} color="var(--color-text-muted)" />
          </button>

          {/* Security & PIN */}
          <button
            type="button"
            onClick={() => addToast('UPI PIN management is active and secured', 'info')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: '14px var(--space-md)',
              width: '100%',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid var(--color-border)',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-main)',
            }}
          >
            <Shield size={20} color="var(--color-text-secondary)" />
            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>Security & UPI PIN</span>
            <ChevronRight size={16} color="var(--color-text-muted)" />
          </button>

          {/* Help & Support */}
          <button
            type="button"
            onClick={() => addToast('Customer support: support@paysphere.app', 'info')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: '14px var(--space-md)',
              width: '100%',
              background: 'none',
              border: 'none',
              borderBottom: isDevMode ? '1px solid var(--color-border)' : '1px solid var(--color-border)',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-main)',
            }}
          >
            <HelpCircle size={20} color="var(--color-text-secondary)" />
            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>Help & Support</span>
            <ChevronRight size={16} color="var(--color-text-muted)" />
          </button>

          {/* Hidden Dev Tools Link (only when VITE_DEV_MODE=true) */}
          {isDevMode && (
            <button
              type="button"
              onClick={() => navigate('/dev-tools')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: '14px var(--space-md)',
                width: '100%',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--color-border)',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-main)',
              }}
            >
              <Code2 size={20} />
              <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600 }}>Developer Tools (/dev-tools)</span>
              <ChevronRight size={16} color="var(--color-text-muted)" />
            </button>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={() => {
              logout();
              addToast('Logged out of session', 'info');
              navigate('/login');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: '14px var(--space-md)',
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--color-danger)',
              fontFamily: 'var(--font-main)',
            }}
          >
            <LogOut size={20} />
            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>Log Out</span>
          </button>
        </div>
      </div>

      {/* Add Instrument Modal */}
      {activeModal && (
        <ModalSheet
          mode={activeModal}
          onClose={() => setActiveModal(null)}
          onSubmitInstrument={handleAddInstrumentSubmit}
          onSubmitBank={handleAddBankSubmit}
        />
      )}
    </div>
  );
}

function ModalSheet({ mode, onClose, onSubmitInstrument, onSubmitBank }) {
  const [identifier, setIdentifier] = useState('');
  const [label, setLabel] = useState('');
  const [provider, setProvider] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [ifsc, setIfsc] = useState('HDFC0001234');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === 'BANK') {
      onSubmitBank({ bankName, accountNumber: identifier, ifsc });
    } else {
      await onSubmitInstrument({
        type: mode === 'CARD' ? 'CREDIT_CARD' : 'UPI',
        identifier: mode === 'CARD' ? identifier.replace(/\s/g, '') : identifier,
        label: label || undefined,
        providerOrNetwork: provider || undefined,
      });
    }
    setSubmitting(false);
  };

  const title = mode === 'BANK' ? 'Link Bank Account' : mode === 'CARD' ? 'Add Debit / Credit Card' : 'Add UPI ID';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-md)',
      }}
      onClick={onClose}
    >
      <div
        className="card scale-in"
        style={{ width: '100%', maxWidth: 420, padding: 'var(--space-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
          {title}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {mode === 'BANK' ? (
            <>
              <div>
                <label className="input-label" htmlFor="bank-select">Bank Name</label>
                <select
                  id="bank-select"
                  className="input-field"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>

              <div>
                <label className="input-label" htmlFor="account-number">Account Number</label>
                <input
                  id="account-number"
                  type="text"
                  required
                  className="input-field font-mono"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 50100234567890"
                />
              </div>

              <div>
                <label className="input-label" htmlFor="ifsc-code">IFSC Code</label>
                <input
                  id="ifsc-code"
                  type="text"
                  required
                  className="input-field font-mono"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="input-label" htmlFor="instrument-input">
                  {mode === 'CARD' ? 'Card Number' : 'UPI ID'}
                </label>
                <input
                  id="instrument-input"
                  type="text"
                  required
                  className={`input-field ${mode === 'CARD' ? 'font-mono' : ''}`}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={mode === 'CARD' ? '4111 2222 3333 4242' : 'name@okaxis'}
                />
              </div>

              <div>
                <label className="input-label" htmlFor="friendly-label">Nick Name / Label (optional)</label>
                <input
                  id="friendly-label"
                  type="text"
                  className="input-field"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={mode === 'CARD' ? 'e.g. Salary Card' : 'e.g. Personal UPI'}
                />
              </div>

              <div>
                <label className="input-label" htmlFor="network-provider">
                  {mode === 'CARD' ? 'Network (VISA, MasterCard, RuPay)' : 'UPI App (GooglePay, PhonePe)'}
                </label>
                <input
                  id="network-provider"
                  type="text"
                  className="input-field"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder={mode === 'CARD' ? 'VISA' : 'GooglePay'}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
            <button type="button" className="btn btn-secondary btn-full" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-full" disabled={submitting || !identifier}>
              {submitting ? 'Linking…' : 'Save & Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
