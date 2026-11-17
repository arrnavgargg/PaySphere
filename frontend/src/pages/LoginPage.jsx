import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Phone, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login, switchUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('arnav@paysphere.com');
  const [pin, setPin] = useState('1234');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      addToast('Please enter your email or mobile number', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(identifier, pin);
      addToast('Welcome back to PaySphere!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, name, id) => {
    switchUser({
      id,
      fullName: name,
      email,
      phone: '9876543210',
    });
    addToast(`Signed in as ${name}`, 'success');
    navigate('/');
  };

  return (
    <div className="page fade-in" style={{ maxWidth: 440, margin: '0 auto', padding: 'var(--space-md)' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-xl)',
            background: 'var(--color-accent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem' }}>P</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0', letterSpacing: '-0.02em' }}>
          Sign In to PaySphere
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Secure UPI, Cards, Bank Transfers & Recharges
        </p>
      </div>

      {/* Main Login Card */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label className="input-label" htmlFor="login-id">
              Email or Mobile Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-id"
                type="text"
                required
                className="input-field"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="arnav@paysphere.com or 9876543210"
                style={{ paddingLeft: 42 }}
              />
              <Mail
                size={18}
                color="var(--color-text-muted)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="login-pin">
              4-Digit Security PIN or Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-pin"
                type="password"
                maxLength={8}
                required
                className="input-field"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                style={{ paddingLeft: 42, letterSpacing: '0.2em' }}
              />
              <Lock
                size={18}
                color="var(--color-text-muted)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 'var(--space-sm)' }}
          >
            {loading ? 'Verifying...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
          </span>
          <Link
            to="/register"
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-accent)',
              textDecoration: 'none',
            }}
          >
            Register Now
          </Link>
        </div>
      </div>

      {/* Demo Quick Logins */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-sm)' }}>
          <Sparkles size={16} color="var(--color-accent)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Logins
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
          <button
            type="button"
            onClick={() => handleQuickLogin('arnav@paysphere.com', 'Arnav Garg', 1)}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text)' }}>Arnav Garg</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Consumer (UPI+Card)</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('merchant@paysphere.com', 'Merchant Operations', 2)}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-text)' }}>Merchant Ops</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Business Account</div>
          </button>
        </div>
      </div>

      {/* Security badge */}
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
        <span>256-Bit Bank Grade Encryption & NPCI Compliant</span>
      </div>
    </div>
  );
}
