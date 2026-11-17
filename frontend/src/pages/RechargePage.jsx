import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Smartphone,
  Tv,
  Zap,
  Wifi,
  Car,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Search,
  Receipt,
  AlertCircle,
  Clock,
  Sparkles,
  CreditCard,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authorizePayment } from '../services/api';

const CATEGORIES = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone, color: '#4F46E5' },
  { id: 'dth', label: 'DTH', icon: Tv, color: '#7C3AED' },
  { id: 'electricity', label: 'Electricity', icon: Zap, color: '#D97706' },
  { id: 'broadband', label: 'Broadband', icon: Wifi, color: '#0891B2' },
  { id: 'fastag', label: 'FASTag', icon: Car, color: '#059669' },
];

// --- 1. Mobile Config ---
const MOBILE_OPERATORS = [
  { id: 'JIO', name: 'Reliance Jio', color: '#005CB9' },
  { id: 'AIRTEL', name: 'Bharti Airtel', color: '#ED1B24' },
  { id: 'VI', name: 'Vodafone Idea (Vi)', color: '#FF0000' },
  { id: 'BSNL', name: 'BSNL Mobile', color: '#00833F' },
];

const MOBILE_PLANS = [
  { amount: '299', validity: '28 Days', data: '1.5 GB/Day', calls: 'Truly Unlimited', perk: 'Free 5G Data & JioTV' },
  { amount: '666', validity: '84 Days', data: '1.5 GB/Day', calls: 'Truly Unlimited', perk: 'Bestseller • Free 5G' },
  { amount: '399', validity: '28 Days', data: '3 GB/Day', calls: 'Unlimited', perk: 'Disney+ Hotstar Included' },
  { amount: '999', validity: '84 Days', data: '2 GB/Day', calls: 'Unlimited', perk: 'Amazon Prime Video Included' },
];

// --- 2. DTH Config ---
const DTH_OPERATORS = [
  { id: 'TATAPLAY', name: 'Tata Play (Tata Sky)', code: 'TATA', color: '#B02A30' },
  { id: 'AIRTELDTH', name: 'Airtel Digital TV', code: 'AIRTEL', color: '#ED1B24' },
  { id: 'DISHTV', name: 'Dish TV', code: 'DISH', color: '#FF6600' },
  { id: 'SUNDIRECT', name: 'Sun Direct', code: 'SUN', color: '#D8232A' },
  { id: 'D2H', name: 'd2h (Videocon)', code: 'D2H', color: '#0099FF' },
];

const DTH_PLANS = [
  { amount: '250', validity: '1 Month', channels: '180 Channels', perk: 'Super Saver Hindi / Regional' },
  { amount: '450', validity: '1 Month', channels: '240 Channels', perk: 'Sports HD Pack • Star & Sony' },
  { amount: '1200', validity: '6 Months', channels: '210 Channels', perk: '6 Months Value Pack (Save 15%)' },
  { amount: '2400', validity: '12 Months', channels: '280 Channels HD', perk: 'Annual Bestseller • All HD Channels' },
];

// --- 3. Electricity Config ---
const ELECTRICITY_BOARDS = [
  { id: 'BSES_R', name: 'BSES Rajdhani Power Ltd (Delhi)', state: 'Delhi' },
  { id: 'BSES_Y', name: 'BSES Yamuna Power Ltd (Delhi)', state: 'Delhi' },
  { id: 'TPDDL', name: 'Tata Power DDL (North Delhi)', state: 'Delhi' },
  { id: 'ADANI_MUM', name: 'Adani Electricity (Mumbai)', state: 'Maharashtra' },
  { id: 'MSEDCL', name: 'Mahavitaran (MSEDCL)', state: 'Maharashtra' },
  { id: 'BESCOM', name: 'BESCOM (Bengaluru)', state: 'Karnataka' },
  { id: 'UPPCL', name: 'UP Power Corp (UPPCL Urban)', state: 'Uttar Pradesh' },
  { id: 'TANGEDCO', name: 'TANGEDCO (Tamil Nadu)', state: 'Tamil Nadu' },
];

// --- 4. Broadband Config ---
const BROADBAND_PROVIDERS = [
  { id: 'JIOFIBER', name: 'JioFiber / AirFiber', color: '#005CB9' },
  { id: 'AIRTEL_FIBER', name: 'Airtel Xstream Fiber', color: '#ED1B24' },
  { id: 'ACT', name: 'ACT Fibernet', color: '#E31B23' },
  { id: 'TATAPLAY_FIBER', name: 'Tata Play Fiber', color: '#B02A30' },
  { id: 'BSNL_FIBER', name: 'BSNL Bharat Fiber', color: '#00833F' },
  { id: 'EXCITEL', name: 'Excitel Broadband', color: '#F7931E' },
];

const BROADBAND_PLANS = [
  { amount: '499', speed: '40 Mbps', data: 'Unlimited Data', perk: 'Free Voice Calling' },
  { amount: '799', speed: '100 Mbps', data: 'Unlimited Data', perk: 'Includes 12 OTT Apps (Hotstar, Zee5)' },
  { amount: '999', speed: '200 Mbps', data: 'Unlimited Data', perk: 'Includes Netflix Basic + Hotstar' },
  { amount: '1499', speed: '300 Mbps', data: 'Unlimited Data', perk: 'Gigafiber • All 16 OTT Apps Included' },
];

// --- 5. FASTag Config ---
const FASTAG_BANKS = [
  { id: 'HDFC_FT', name: 'HDFC Bank FASTag', code: 'HDFC', color: '#004B87' },
  { id: 'ICICI_FT', name: 'ICICI Bank FASTag', code: 'ICICI', color: '#B02A30' },
  { id: 'SBI_FT', name: 'State Bank of India FASTag', code: 'SBI', color: '#1B365D' },
  { id: 'AXIS_FT', name: 'Axis Bank FASTag', code: 'AXIS', color: '#861F41' },
  { id: 'KOTAK_FT', name: 'Kotak Mahindra FASTag', code: 'KOTAK', color: '#ED1C24' },
  { id: 'IDFC_FT', name: 'IDFC First Bank FASTag', code: 'IDFC', color: '#991B1E' },
];

export default function RechargePage({ initialTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Read active category from prop, query params (e.g. /recharge?tab=fastag) or default to 'mobile'
  const queryParams = new URLSearchParams(location.search);
  const routeTab = initialTab || queryParams.get('tab') || 'mobile';
  const [activeCategory, setActiveCategory] = useState(routeTab);

  useEffect(() => {
    if (initialTab) {
      setActiveCategory(initialTab);
    } else {
      const qTab = queryParams.get('tab');
      if (qTab) setActiveCategory(qTab);
    }
  }, [initialTab, location.search]);

  // Form States per category
  // 1. Mobile
  const [mobileNumber, setMobileNumber] = useState('9811234567');
  const [mobileOperator, setMobileOperator] = useState('JIO');
  const [mobileCircle, setMobileCircle] = useState('Delhi NCR');
  const [selectedMobilePlan, setSelectedMobilePlan] = useState(MOBILE_PLANS[0]);

  // 2. DTH
  const [dthOperator, setDthOperator] = useState('TATAPLAY');
  const [dthSubscriberId, setDthSubscriberId] = useState('1029384756');
  const [selectedDthPlan, setSelectedDthPlan] = useState(DTH_PLANS[0]);

  // 3. Electricity
  const [electricityBoard, setElectricityBoard] = useState('BSES_R');
  const [caNumber, setCaNumber] = useState('10029384751');
  const [fetchedBill, setFetchedBill] = useState({
    consumerName: user?.fullName || 'Arnav Garg',
    billNumber: 'DEL-2026-884192',
    dueDate: '28 Nov 2026',
    units: '342 kWh',
    amount: '1840.00',
  });

  // 4. Broadband
  const [broadbandProvider, setBroadbandProvider] = useState('JIOFIBER');
  const [broadbandAccountId, setBroadbandAccountId] = useState('0114829104');
  const [selectedBroadbandPlan, setSelectedBroadbandPlan] = useState(BROADBAND_PLANS[1]);

  // 5. FASTag
  const [fastagBank, setFastagBank] = useState('HDFC_FT');
  const [vehicleNumber, setVehicleNumber] = useState('DL 01 AB 1234');
  const [fastagAmount, setFastagAmount] = useState('500');

  // Common Custom Amount & Loading
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute final payable amount for active tab
  let finalAmount = '0.00';
  if (activeCategory === 'mobile') {
    finalAmount = customAmount || selectedMobilePlan?.amount || '299';
  } else if (activeCategory === 'dth') {
    finalAmount = customAmount || selectedDthPlan?.amount || '250';
  } else if (activeCategory === 'electricity') {
    finalAmount = fetchedBill?.amount || '1840.00';
  } else if (activeCategory === 'broadband') {
    finalAmount = customAmount || selectedBroadbandPlan?.amount || '799';
  } else if (activeCategory === 'fastag') {
    finalAmount = customAmount || fastagAmount || '500';
  }

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const idempotencyKey = `BILL-${activeCategory.toUpperCase()}-${Date.now()}`;
      const payload = {
        customerId: user?.id || 1,
        amount: parseFloat(finalAmount).toFixed(2),
        currency: 'INR',
        idempotencyKey,
        paymentMode: 'UPI',
      };

      const res = await authorizePayment(payload);

      let successLabel = 'Payment';
      if (activeCategory === 'mobile') successLabel = `Mobile Recharge of ₹${finalAmount} for ${mobileNumber}`;
      else if (activeCategory === 'dth') successLabel = `DTH Recharge of ₹${finalAmount} for Sub ID ${dthSubscriberId}`;
      else if (activeCategory === 'electricity') successLabel = `Electricity bill payment of ₹${finalAmount} for CA ${caNumber}`;
      else if (activeCategory === 'broadband') successLabel = `Broadband payment of ₹${finalAmount} for ${broadbandAccountId}`;
      else if (activeCategory === 'fastag') successLabel = `FASTag recharge of ₹${finalAmount} for ${vehicleNumber}`;

      addToast(`${successLabel} successful!`, 'success');
      navigate('/history');
    } catch (err) {
      addToast(err.message || 'Payment failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page fade-in" style={{ maxWidth: 540, margin: '0 auto', padding: 'var(--space-md)' }}>
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
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Recharge & Bill Payments</h2>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <ShieldCheck size={12} color="var(--color-success)" />
            <span>Bharat BillPay (BBPS) & NPCI Enabled</span>
          </div>
        </div>
        <div style={{ width: 38 }} />
      </div>

      {/* 5-Category Horizontal Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          marginBottom: 'var(--space-lg)',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setCustomAmount('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: isActive ? `2px solid ${cat.color}` : '1px solid var(--color-border)',
                background: isActive ? cat.color : 'var(--color-surface)',
                color: isActive ? '#fff' : 'var(--color-text)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? `0 4px 12px ${cat.color}35` : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={16} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container Card */}
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
          {/* ======================= TAB 1: MOBILE ======================= */}
          {activeCategory === 'mobile' && (
            <>
              <div>
                <label className="input-label">Mobile Number</label>
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
                  <label className="input-label">Operator</label>
                  <select
                    className="input-field"
                    value={mobileOperator}
                    onChange={(e) => setMobileOperator(e.target.value)}
                  >
                    {MOBILE_OPERATORS.map((op) => (
                      <option key={op.id} value={op.id}>{op.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Circle</label>
                  <select className="input-field" value={mobileCircle} onChange={(e) => setMobileCircle(e.target.value)}>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra & Goa">Maharashtra & Goa</option>
                    <option value="Punjab">Punjab</option>
                  </select>
                </div>
              </div>

              {/* Mobile Plans */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="input-label" style={{ margin: 0 }}>Select Recharge Plan</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                    ★ Best Offers
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  {MOBILE_PLANS.map((plan) => {
                    const isSelected = selectedMobilePlan?.amount === plan.amount && !customAmount;
                    return (
                      <button
                        key={plan.amount}
                        type="button"
                        onClick={() => {
                          setSelectedMobilePlan(plan);
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
            </>
          )}

          {/* ======================= TAB 2: DTH ======================= */}
          {activeCategory === 'dth' && (
            <>
              <div>
                <label className="input-label">Select DTH Provider</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
                  {DTH_OPERATORS.map((op) => {
                    const isSelected = dthOperator === op.id;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => setDthOperator(op.id)}
                        style={{
                          padding: '10px 4px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? `2px solid ${op.color}` : '1px solid var(--color-border)',
                          background: isSelected ? `${op.color}15` : 'transparent',
                          color: isSelected ? op.color : 'var(--color-text)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {op.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="input-label">Subscriber ID / Smart Card Number</label>
                <input
                  type="text"
                  required
                  className="input-field font-mono"
                  value={dthSubscriberId}
                  onChange={(e) => setDthSubscriberId(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1029384756 (10 or 11 digits)"
                />
              </div>

              {/* DTH Packs */}
              <div>
                <span className="input-label">Popular DTH Packs</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  {DTH_PLANS.map((plan) => {
                    const isSelected = selectedDthPlan?.amount === plan.amount && !customAmount;
                    return (
                      <button
                        key={plan.amount}
                        type="button"
                        onClick={() => {
                          setSelectedDthPlan(plan);
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
                            {plan.channels} • {plan.perk}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={18} color="var(--color-accent)" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ======================= TAB 3: ELECTRICITY ======================= */}
          {activeCategory === 'electricity' && (
            <>
              <div>
                <label className="input-label">State / Electricity Distribution Board</label>
                <select
                  className="input-field"
                  value={electricityBoard}
                  onChange={(e) => setElectricityBoard(e.target.value)}
                >
                  {ELECTRICITY_BOARDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Consumer Account Number (CA Number)</label>
                <input
                  type="text"
                  required
                  className="input-field font-mono"
                  value={caNumber}
                  onChange={(e) => setCaNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 10029384751"
                />
              </div>

              {/* Live Fetched Bill Details via BBPS */}
              <div
                style={{
                  background: 'var(--color-surface-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Receipt size={16} color="var(--color-accent)" />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>BBPS Bill Summary</span>
                  </div>
                  <span className="chip chip-success" style={{ fontSize: '0.65rem' }}>Verified Due Bill</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Consumer Name:</span>
                  <span style={{ fontWeight: 700 }}>{fetchedBill.consumerName}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Bill Number / Period:</span>
                  <span className="font-mono">{fetchedBill.billNumber}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Consumption / Due Date:</span>
                  <span>{fetchedBill.units} • Due: {fetchedBill.dueDate}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
                  <span>Net Bill Amount Payable:</span>
                  <span className="font-mono" style={{ color: 'var(--color-accent)' }}>
                    ₹{fetchedBill.amount}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ======================= TAB 4: BROADBAND ======================= */}
          {activeCategory === 'broadband' && (
            <>
              <div>
                <label className="input-label">Select Broadband Provider</label>
                <select
                  className="input-field"
                  value={broadbandProvider}
                  onChange={(e) => setBroadbandProvider(e.target.value)}
                >
                  {BROADBAND_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Broadband Account / Landline Number (with STD code)</label>
                <input
                  type="text"
                  required
                  className="input-field font-mono"
                  value={broadbandAccountId}
                  onChange={(e) => setBroadbandAccountId(e.target.value)}
                  placeholder="e.g. 0114829104 or FTTH-9841"
                />
              </div>

              {/* Broadband Fiber Plans */}
              <div>
                <span className="input-label">Broadband Fiber Monthly Plans</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                  {BROADBAND_PLANS.map((plan) => {
                    const isSelected = selectedBroadbandPlan?.amount === plan.amount && !customAmount;
                    return (
                      <button
                        key={plan.amount}
                        type="button"
                        onClick={() => {
                          setSelectedBroadbandPlan(plan);
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
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--color-text)' }}>
                              ₹{plan.amount}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0891B2' }}>
                              • {plan.speed}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {plan.data} • {plan.perk}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={18} color="var(--color-accent)" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ======================= TAB 5: FASTAG ======================= */}
          {activeCategory === 'fastag' && (
            <>
              <div>
                <label className="input-label">Select FASTag Issuing Bank</label>
                <select
                  className="input-field"
                  value={fastagBank}
                  onChange={(e) => setFastagBank(e.target.value)}
                >
                  {FASTAG_BANKS.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Vehicle Registration Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    className="input-field font-mono"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. DL 01 AB 1234 or MH 02 CZ 9999"
                    style={{
                      letterSpacing: '0.12em',
                      fontWeight: 800,
                      fontSize: '1rem',
                      paddingLeft: 42,
                    }}
                  />
                  <Car
                    size={18}
                    color="var(--color-text-muted)"
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} />
                  <span>National Electronic Toll Collection (NETC) Registered</span>
                </div>
              </div>

              {/* FASTag Top-up Amount */}
              <div>
                <label className="input-label">Recharge Amount (₹)</label>
                <input
                  type="number"
                  step="50"
                  required
                  className="input-field font-mono"
                  value={customAmount || fastagAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setFastagAmount(e.target.value);
                  }}
                  placeholder="500"
                  style={{ fontSize: '1.25rem', fontWeight: 800 }}
                />

                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {['200', '500', '1000', '2000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setFastagAmount(amt);
                        setCustomAmount('');
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        border: fastagAmount === amt && !customAmount ? '2px solid #059669' : '1px solid var(--color-border)',
                        background: fastagAmount === amt && !customAmount ? '#ECFDF5' : 'var(--color-surface-secondary)',
                        color: fastagAmount === amt && !customAmount ? '#059669' : 'var(--color-text)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Total & Submit Button */}
          <div
            style={{
              marginTop: 'var(--space-sm)',
              padding: '12px var(--space-md)',
              background: 'var(--color-surface-secondary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Total Payable Amount
              </div>
              <div style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--color-accent)' }} className="font-mono">
                ₹{parseFloat(finalAmount || 0).toFixed(2)}
              </div>
            </div>

            <div style={{ fontSize: '0.6875rem', color: 'var(--color-success)', fontWeight: 700, textAlign: 'right' }}>
              ✓ BBPS Instant Receipt<br />
              ✓ Zero Convenience Fee
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 'var(--space-xs)' }}
          >
            {loading ? 'Authorizing Payment…' : `Pay ₹${parseFloat(finalAmount || 0).toFixed(2)} Now`}
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
        <span>Bharat BillPay (BBPS) Certified & NPCI NETC Toll Gateway</span>
      </div>
    </div>
  );
}
