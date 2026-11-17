import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Camera,
  Upload,
  Flashlight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Copy,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PRESET_QRS = [
  { name: 'Blue Tokai Coffee', upi: 'bluetokai@icici', amount: '280.00', note: 'Cappuccino & Croissant' },
  { name: 'Nature Basket Grocery', upi: 'naturebasket@hdfc', amount: '1450.00', note: 'Weekly Groceries' },
  { name: 'Metro Transport Pass', upi: 'delhimetro@sbi', amount: '100.00', note: 'Smart Card Recharge' },
  { name: 'PaySphere Merchant Ops', upi: 'merchant@paysphere', amount: '500.00', note: 'Order #PS-8841' },
];

export default function PayQrPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'my-qr'
  const [torchOn, setTorchOn] = useState(false);

  const myUpiId = user ? `${user.email?.split('@')[0] || 'user'}@okpaysphere` : 'arnav@okpaysphere';

  const handleSelectPreset = (preset) => {
    navigate('/pay', {
      state: {
        mode: 'UPI',
        payeeId: preset.upi,
        payeeName: preset.name,
        amount: preset.amount,
        note: preset.note,
      },
    });
  };

  const copyUpi = () => {
    navigator.clipboard?.writeText(myUpiId);
    addToast('UPI ID copied to clipboard!', 'success');
  };

  return (
    <div className="page fade-in" style={{ maxWidth: 480, margin: '0 auto', padding: 'var(--space-md)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn btn-ghost"
          style={{ padding: '8px', borderRadius: 'var(--radius-full)' }}
          aria-label="Go Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Scan & Pay / QR</h2>
        <div style={{ width: 38 }} />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--color-surface-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: 4,
          marginBottom: 'var(--space-lg)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('scan')}
          style={{
            padding: '10px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'scan' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'scan' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'scan' ? 'var(--shadow-xs)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          Scan Any QR
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my-qr')}
          style={{
            padding: '10px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'my-qr' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'my-qr' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'my-qr' ? 'var(--shadow-xs)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          My Receive QR
        </button>
      </div>

      {activeTab === 'scan' ? (
        <div>
          {/* Scanner Viewport */}
          <div
            style={{
              height: 320,
              background: '#0a0d14',
              borderRadius: 'var(--radius-xl)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.1)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Camera Viewport overlay */}
            <div
              style={{
                width: 220,
                height: 220,
                border: '2px dashed var(--color-accent)',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Animated laser line */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: 3,
                  background: 'linear-gradient(90deg, transparent, #4F46E5, #818CF8, transparent)',
                  boxShadow: '0 0 12px #818CF8',
                  animation: 'scanLaser 2.2s ease-in-out infinite alternate',
                }}
              />
              <QrCode size={90} color="rgba(255,255,255,0.25)" />
            </div>

            {/* Torch toggle */}
            <button
              type="button"
              onClick={() => {
                setTorchOn(!torchOn);
                addToast(torchOn ? 'Flashlight turned off' : 'Flashlight turned on', 'info');
              }}
              style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                background: torchOn ? '#fff' : 'rgba(255,255,255,0.2)',
                color: torchOn ? '#000' : '#fff',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '8px 18px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Flashlight size={14} />
              {torchOn ? 'Flash ON' : 'Flash OFF'}
            </button>
          </div>

          <style>{`
            @keyframes scanLaser {
              0% { top: 0%; opacity: 0.3; }
              50% { opacity: 1; }
              100% { top: 100%; opacity: 0.3; }
            }
          `}</style>

          {/* Quick preset QR scans */}
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-sm)' }}>
              <Sparkles size={16} color="var(--color-accent)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Simulate QR Code Scan
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              {PRESET_QRS.map((preset) => (
                <button
                  key={preset.upi}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px var(--space-md)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                      {preset.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {preset.upi} • {preset.note}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-accent)' }}>
                    ₹{preset.amount}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* My QR Code Card */
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '0 0 4px' }}>
            {user?.fullName || 'Arnav Garg'}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-lg)' }}>
            Scan to pay with any UPI App (GPay, PhonePe, Paytm)
          </p>

          <div
            style={{
              width: 220,
              height: 220,
              margin: '0 auto var(--space-lg)',
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              border: '2px solid var(--color-border)',
            }}
          >
            <QrCode size={170} color="#1E1B4B" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border)',
              marginBottom: 'var(--space-lg)',
            }}
          >
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
              {myUpiId}
            </span>
            <button
              type="button"
              onClick={copyUpi}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
              title="Copy UPI ID"
            >
              <Copy size={16} color="var(--color-accent)" />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            <button type="button" className="btn btn-secondary btn-full" onClick={copyUpi}>
              <Copy size={16} />
              Copy UPI ID
            </button>
            <button
              type="button"
              className="btn btn-primary btn-full"
              onClick={() => addToast('QR code link ready to share!', 'success')}
            >
              <Share2 size={16} />
              Share QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

