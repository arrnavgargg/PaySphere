import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Tv,
  Zap,
  Wifi,
  Car,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authorizePayment } from '../services/api';

const CATEGORIES = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'dth', label: 'DTH', icon: Tv },
  { id: 'electricity', label: 'Electricity', icon: Zap },
  { id: 'broadband', label: 'Broadband', icon: Wifi },
  { id: 'fastag', label: 'FASTag', icon: Car },
];

const OPERATORS = [
  { id: 'JIO', name: 'Reliance Jio', color: '#005CB9' },
  { id: 'AIRTEL', name: 'Bharti Airtel', color: '#ED1B24' },
  { id: 'VI', name: 'Vodafone Idea (Vi)', color: '#FF0000' },
  { id: 'BSNL', name: 'BSNL Mobile', color: '#00833F' },
];

const POPULAR_PLANS = [
  {
    amount: '299',
    validity: '28 Days',
    data: '1.5 GB / Day',
    calls: 'Truly Unlimited',
    perk: 'Free 5G Data & JioTV',
  },
  {
    amount: '666',
    validity: '84 Days',
    data: '1.5 GB / Day',
    calls: 'Truly Unlimited',
    perk: 'Bestseller • Free 5G',
  },
  {
    amount: '399',
    validity: '28 Days',
    data: '3 GB / Day',
    calls: 'Unlimited',
    perk: 'Includes Disney+ Hotstar',
  },
  {
    amount: '999',
    validity: '84 Days',
    data: '2 GB / Day',
    calls: 'Unlimited',
    perk: 'Includes Amazon Prime Video',
  },
];

export default function RechargePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('mobile');
  const [mobileNumber, setMobileNumber] = useState('9811234567');
  const [selectedOperator, setSelectedOperator] = useState('JIO');
  const [circle, setCircle] = useState('Delhi NCR');
  const [selectedPlan, setSelectedPlan] = useState(POPULAR_PLANS[0]);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const amountToCharge = customAmount || selectedPlan?.amount || '299';

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = `RECHARGE-${mobileNumber}-${Date.now()}`;
      const payload = {
        customerId: user?.id || 1,
        amount: parseFloat(amountToCharge).toFixed(2),
        currency: 'INR',
        idempotencyKey,
        paymentMode: 'UPI',
      };

      const res = await authorizePayment(payload);
      addToast(`Recharge of ₹${amountToCharge} for ${mobileNumber} successful!`, 'success');
      navigate('/history');
    } catch (err) {
      addToast(err.message || 'Recharge failed', 'error');
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
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Recharge & Bill Pay</h2>
        <div style={{ width: 38 }} />
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 'var(--space-xs)', overflowX: 'auto', marginBottom: 'var(--space-lg)', paddingBottom: 4 }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                color: isActive ? '#fff' : 'var(--color-text)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={16} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Recharge Form */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <form onSubmit={handleRecharge} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label className="input-label">
              {activeCategory === 'mobile' ? 'Mobile Number' : 'Consumer / Account Number'}
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              className="input-field font-mono"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9811234567"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            <div>
              <label className="input-label">Operator / Biller</label>
              <select
                className="input-field"
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
              >
                {OPERATORS.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Telecom Circle</label>
              <select className="input-field" value={circle} onChange={(e) => setCircle(e.target.value)}>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra & Goa">Maharashtra & Goa</option>
                <option value="Punjab">Punjab</option>
              </select>
            </div>
          </div>

          {/* Plan Selector */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="input-label" style={{ margin: 0 }}>Select Plan</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                {selectedOperator} Best Offers
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              {POPULAR_PLANS.map((plan) => {
                const isSelected = selectedPlan?.amount === plan.amount && !customAmount;
                return (
                  <button
                    key={plan.amount}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setCustomAmount('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px var(--space-md)',
                      borderRadius: 'var(--radius-lg)',
                      border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                      background: isSelected ? 'var(--color-accent-light)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--color-text)' }}>
                          ₹{plan.amount}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          • {plan.validity}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {plan.data} • {plan.calls}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-accent)', fontWeight: 600, marginTop: 2 }}>
                        ★ {plan.perk}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={18} color="var(--color-accent)" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 'var(--space-xs)' }}
          >
            {loading ? 'Processing Recharge…' : `Recharge ₹${amountToCharge} Now`}
          </button>
        </form>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          color: 'var(--color-text-muted)',
          fontSize: '0.75rem',
        }}
      >
        <ShieldCheck size={16} color="var(--color-success)" />
        <span>Instant Operator Confirmation & BBPS Reversal Guarantee</span>
      </div>
    </div>
  );
}
