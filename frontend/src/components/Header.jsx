import React from 'react';
import { 
  CreditCard, 
  History, 
  ShieldAlert, 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, serverOnline }) {
  const tabs = [
    { id: 'terminal', label: 'Payment Terminal', icon: CreditCard },
    { id: 'transactions', label: 'Transactions & Ledger', icon: History },
    { id: 'sandbox', label: 'Fraud & Idempotency Lab', icon: ShieldAlert },
    { id: 'customers', label: 'Customers & Cards', icon: Users },
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(10, 13, 20, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 70,
      }}>
        {/* Logo and Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          }}>
            <CreditCard size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Pay<span className="gradient-text">Sphere</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 6,
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}>
                v1.0
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Universal Payment Orchestrator & Ledger
            </p>
          </div>
        </div>

        {/* Tab navigation */}
        <nav style={{ display: 'flex', gap: 8 }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn"
                style={{
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  padding: '8px 14px',
                  borderRadius: 10,
                }}
              >
                <Icon size={16} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Server status & Swagger link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: serverOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderRadius: 9999,
            border: `1px solid ${serverOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
          }}>
            <span className={serverOnline ? 'pulse-dot' : ''} style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: serverOnline ? 'var(--success)' : 'var(--danger)',
              display: 'inline-block'
            }} />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: serverOnline ? 'var(--success)' : 'var(--danger)'
            }}>
              {serverOnline ? 'Backend Online (Port 8080)' : 'Backend Offline'}
            </span>
          </div>

          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            <span>Swagger API</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </header>
  );
}

