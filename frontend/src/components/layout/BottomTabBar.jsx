import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, QrCode, Clock, User } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/pay', label: 'Pay', icon: QrCode },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomTabBar() {
  return (
    <>
      <nav className="bottom-tab-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 64,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all var(--transition-fast)',
                }}>
                  <div style={{
                    padding: '4px 16px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--color-accent-light)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                  }}>
                    <Icon
                      size={22}
                      color={isActive ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  }}>
                    {tab.label}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .bottom-tab-bar { display: none !important; }
        }
      `}</style>
    </>
  );
}
