import React, { useState } from 'react';
import { 
  QrCode, 
  CreditCard, 
  Building2, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Copy,
  Receipt
} from 'lucide-react';
import { authorizePayment } from '../api';

export default function PaymentTerminal({ onPaymentSuccess }) {
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [amount, setAmount] = useState('2500.00');
  const [currency, setCurrency] = useState('INR');
  const [identifier, setIdentifier] = useState('arnav@okaxis');
  const [idempotencyKey, setIdempotencyKey] = useState(`KEY-UI-${Date.now()}`);

  // Card specific fields
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4242');
  const [cardHolder, setCardHolder] = useState('Arnav Garg');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');

  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const generateNewKey = () => {
    setIdempotencyKey(`KEY-DEMO-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setLastResult(null);

    const payload = {
      idempotencyKey,
      amount: parseFloat(amount),
      currency,
      paymentMode,
      identifier: paymentMode === 'UPI' ? identifier : cardNumber.replace(/\s+/g, ''),
    };

    try {
      const response = await authorizePayment(payload);
      setLastResult(response);
      if (onPaymentSuccess) {
        onPaymentSuccess(response);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Payment authorization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '30px auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30 }}>
      {/* Payment Configuration Form */}
      <div className="glass-panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Authorize Payment</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Orchestrate gateway hold & double-entry ledger debit
            </p>
          </div>
          <button onClick={generateNewKey} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '6px 10px' }} title="Generate new idempotency key">
            <RefreshCw size={12} />
            <span>New Key</span>
          </button>
        </div>

        {/* Payment Channel Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { id: 'UPI', label: 'UPI / VPA', icon: QrCode },
            { id: 'CREDIT_CARD', label: 'Card Payment', icon: CreditCard },
            { id: 'NET_BANKING', label: 'Net Banking', icon: Building2 },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = paymentMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setPaymentMode(mode.id);
                  if (mode.id === 'UPI' && !identifier.includes('@')) {
                    setIdentifier('arnav@okaxis');
                  }
                }}
                className="btn"
                style={{
                  flexDirection: 'column',
                  padding: '14px 10px',
                  borderRadius: 12,
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  gap: 6,
                }}
              >
                <Icon size={20} color={isSelected ? 'var(--primary)' : 'currentColor'} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{mode.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Amount and Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <div>
              <label className="label">Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: 32, fontSize: '1.1rem', fontWeight: 700 }}
                  placeholder="2500.00"
                />
              </div>
            </div>
            <div>
              <label className="label">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-field"
                style={{ height: 46 }}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[500, 1250, 2500, 5000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toFixed(2))}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 8 }}
              >
                + ₹{val}
              </button>
            ))}
          </div>

          {/* Dynamic mode inputs */}
          {paymentMode === 'UPI' && (
            <div>
              <label className="label">UPI Virtual Payment Address (VPA)</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-field font-mono"
                placeholder="name@bank (e.g. arnav@okaxis)"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                Simulates real-time UPI switch routing and NPCI 2.0 authorization.
              </span>
            </div>
          )}

          {paymentMode === 'CREDIT_CARD' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="input-field font-mono"
                  placeholder="4111 2222 3333 4242"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Cardholder</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="input-field"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="label">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="input-field font-mono"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="label">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="input-field font-mono"
                    placeholder="•••"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMode === 'NET_BANKING' && (
            <div>
              <label className="label">Select Banking Partner</label>
              <select
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-field"
              >
                <option value="HDFC Bank">HDFC Bank NetBanking</option>
                <option value="ICICI Bank">ICICI Bank Corporate & Retail</option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="Axis Bank">Axis Bank NetBanking</option>
              </select>
            </div>
          )}

          {/* Idempotency Key */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="label">Idempotency Key (Unique Transaction Token)</label>
            </div>
            <input
              type="text"
              required
              value={idempotencyKey}
              onChange={(e) => setIdempotencyKey(e.target.value)}
              className="input-field font-mono"
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: 10, fontSize: '0.95rem' }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Processing Authorization...</span>
              </>
            ) : (
              <>
                <span>Authorize ₹{amount || '0'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Visual Terminal Right Side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Interactive Virtual Card Mockup */}
        <div className="payment-card-visual">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em' }}>PAYSPHERE PLATINUM</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.2)' }}>
              {paymentMode}
            </span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block', marginBottom: 2 }}>IDENTIFIER / CARD</span>
            <div className="font-mono" style={{ fontSize: '1.15rem', letterSpacing: '0.08em', fontWeight: 600 }}>
              {paymentMode === 'UPI' ? identifier : cardNumber}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span style={{ fontSize: '0.65rem', opacity: 0.7, display: 'block' }}>ACCOUNT HOLDER</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cardHolder}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', opacity: 0.7, display: 'block' }}>EXPIRY</span>
              <span className="font-mono" style={{ fontSize: '0.85rem' }}>{cardExpiry}</span>
            </div>
          </div>
        </div>

        {/* Live Transaction Status / Receipt */}
        {lastResult && (
          <div className="glass-panel" style={{ padding: 22, borderLeft: '4px solid var(--success)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <CheckCircle size={20} color="var(--success)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Payment Authorized Successfully</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span className="badge badge-authorized">{lastResult.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount:</span>
                <span style={{ fontWeight: 700 }}>₹{lastResult.amount} {lastResult.currency}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Reference ID:</span>
                <span className="font-mono" style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>
                  {lastResult.transactionReference}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Idempotency Key:</span>
                <span className="font-mono" style={{ fontSize: '0.75rem' }}>{lastResult.idempotencyKey}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ledger Entry:</span>
                <span style={{ color: 'var(--info)', fontWeight: 600 }}>AUTH_HOLD (DEBIT)</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {errorMsg && (
          <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <AlertTriangle size={20} color="var(--danger)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger)' }}>Authorization Rejected</h3>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{errorMsg}</p>
          </div>
        )}

        {/* Informative Architecture Note */}
        <div className="glass-panel" style={{ padding: 18, background: 'rgba(255,255,255,0.02)' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6 }}>
            Engine Lifecycle
          </h4>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Authorizing initiates a Chain of Responsibility fraud check, executes the factory-selected gateway strategy, registers the idempotent key, and creates an immutable <strong style={{ color: 'var(--text-secondary)' }}>AUTH_HOLD</strong> in the double-entry ledger.
          </p>
        </div>
      </div>
    </div>
  );
}

