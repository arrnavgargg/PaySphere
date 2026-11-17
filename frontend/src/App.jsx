import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PaymentTerminal from './components/PaymentTerminal';
import TransactionHistory from './components/TransactionHistory';
import FraudIdempotencyLab from './components/FraudIdempotencyLab';
import CustomerHub from './components/CustomerHub';
import { checkServerHealth } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('terminal');
  const [serverOnline, setServerOnline] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const ping = async () => {
      const isUp = await checkServerHealth();
      setServerOnline(isUp);
    };
    ping();
    const interval = setInterval(ping, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePaymentSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverOnline={serverOnline}
      />

      <main style={{ flex: 1, padding: '0 24px 60px' }}>
        {activeTab === 'terminal' && (
          <PaymentTerminal onPaymentSuccess={handlePaymentSuccess} />
        )}
        {activeTab === 'transactions' && (
          <TransactionHistory refreshTrigger={refreshTrigger} />
        )}
        {activeTab === 'sandbox' && (
          <FraudIdempotencyLab />
        )}
        {activeTab === 'customers' && (
          <CustomerHub />
        )}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        background: 'rgba(10, 13, 20, 0.9)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>PaySphere Universal Payment System &copy; 2026. Designed for team collaboration.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>Spring Boot 3.5.x + Java 25 Backend</span>
            <span>React 19 + Vite Frontend</span>
            <span>H2 Double-Entry Ledger Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

