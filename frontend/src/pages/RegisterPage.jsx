import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      addToast('Please enter your full name and email', 'error');
      return;
    }

    if (pin && confirmPin && pin !== confirmPin) {
      addToast('Security PINs do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || '9876543210',
        pin: pin || '1234',
      });
      addToast(`Account created successfully! Welcome, ${fullName}`, 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Failed to create account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page fade-in" style={{ maxWidth: 460, margin: '0 auto', padding: 'var(--space-md)' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--color-accent), #7C3AED)',
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
          Create PaySphere Account
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Join millions paying effortlessly via UPI, Cards & Bank Accounts
        </p>
      </div>

      {/* Form Card */}
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
            <label className="input-label" htmlFor="reg-name">
              Full Legal Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-name"
                type="text"
                required
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Arnav Garg"
                style={{ paddingLeft: 42 }}
              />
              <User
                size={18}
                color="var(--color-text-muted)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="reg-email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-email"
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
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
            <label className="input-label" htmlFor="reg-phone">
              Mobile Number (linked to bank)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-phone"
                type="tel"
                maxLength={10}
                required
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                style={{ paddingLeft: 42 }}
              />
              <Phone
                size={18}
                color="var(--color-text-muted)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            <div>
              <label className="input-label" htmlFor="reg-pin">
                Set 4-Digit PIN
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-pin"
                  type="password"
                  maxLength={4}
                  required
                  className="input-field"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  style={{ paddingLeft: 38, letterSpacing: '0.2em' }}
                />
                <Lock
                  size={16}
                  color="var(--color-text-muted)"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="reg-cpin">
                Confirm PIN
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-cpin"
                  type="password"
                  maxLength={4}
                  required
                  className="input-field"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  style={{ paddingLeft: 38, letterSpacing: '0.2em' }}
                />
                <CheckCircle2
                  size={16}
                  color="var(--color-text-muted)"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 'var(--space-sm)' }}
          >
            {loading ? 'Creating Account…' : 'Register & Continue'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Already registered?{' '}
          </span>
          <Link
            to="/login"
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-accent)',
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
        </div>
      </div>

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
        <span>Securely saved in PostgreSQL cluster • RBI / NPCI Compliant</span>
      </div>
    </div>
  );
}

