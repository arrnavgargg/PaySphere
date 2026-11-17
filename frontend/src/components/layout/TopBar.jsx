import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, QrCode, Clock, User, Sun, Moon, LogIn, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../shared/Avatar';

export default function TopBar() {
  const { dark, toggle } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/pay-qr', label: 'Scan & Pay', icon: QrCode },
    { to: '/history', label: 'History', icon: Clock },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const linkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
    background: isActive ? 'var(--color-accent-light)' : 'transparent',
    textDecoration: 'none',
    transition: 'all var(--transition-fast)',
  });

  return (
    <header
      style={{
        display: 'none',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0 var(--space-lg)',
      }}
      className="topbar-desktop"
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}
      >
        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>P</span>
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text)' }}>
            Pay<span style={{ color: 'var(--color-accent)' }}>Sphere</span>
          </span>
        </NavLink>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to} end={link.to === '/'}>
                {({ isActive }) => (
                  <div style={linkStyle(isActive)}>
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Actions: Auth + Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <NavLink
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  color: 'var(--color-text)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-surface-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Avatar name={user.fullName || 'User'} size={24} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                  {user.fullName?.split(' ')[0] || 'User'}
                </span>
              </NavLink>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn btn-ghost"
                style={{ padding: '6px 10px', fontSize: '0.75rem', gap: 4, display: 'flex', alignItems: 'center' }}
                title="Sign Out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <NavLink to="/login" className="btn btn-ghost btn-sm">
                <LogIn size={15} />
                Sign In
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Register
              </NavLink>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="btn btn-ghost"
            style={{ padding: 8, borderRadius: 'var(--radius-full)' }}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .topbar-desktop { display: block !important; }
        }
      `}</style>
    </header>
  );
}
