import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Play,
  CheckCircle2,
  XCircle,
  Database,
  BookOpen,
  ExternalLink,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Check,
  RotateCcw,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import {
  authorizePayment,
  getTransactionByIdempotency,
  getLedgerEntries,
  getAllPayments,
  capturePayment,
  refundPayment,
  checkServerHealth,
} from '../services/api';

/**
 * DevTools page — only accessible when VITE_DEV_MODE=true.
 * Contains the original Fraud & Idempotency Lab, Ledger Inspector,
 * raw transactions with manual Capture/Refund triggers, backend status, and Swagger link.
 */
export default function DevToolsPage() {
  const [serverOnline, setServerOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('lab'); // 'lab' | 'ledger' | 'transactions'
  const [activeTest, setActiveTest] = useState(null);
  const [logs, setLogs] = useState([]);

  // Raw transactions
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Ledger modal
  const [ledgerRef, setLedgerRef] = useState('');
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [showLedger, setShowLedger] = useState(false);

  // Idempotency lookup
  const [lookupKey, setLookupKey] = useState('');
  const [lookupResult, setLookupResult] = useState(null);

  useEffect(() => {
    const ping = async () => setServerOnline(await checkServerHealth());
    ping();
    const interval = setInterval(ping, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const data = await getAllPayments();
      setTransactions(data);
    } catch (err) {
      addLog('Fetch Error', 'error', err.message);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab]);

  const addLog = (title, status, detail) => {
    setLogs((prev) => [
      { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), title, status, detail },
      ...prev,
    ]);
  };

  const runIdempotencyTest = async () => {
    const key = `KEY-IDEM-${Date.now()}`;
    setActiveTest('idempotency');
    try {
      addLog('Step 1: Initial Payment', 'info', `Sending payment with unique key: ${key}`);
      const res1 = await authorizePayment({
        idempotencyKey: key,
        amount: 1500.0,
        currency: 'INR',
        paymentMode: 'UPI',
        identifier: 'test@okaxis',
      });
      addLog('Step 1 Authorized', 'success', `Got Ref: ${res1.transactionReference}`);

      addLog('Step 2: Resending Duplicate Key', 'info', `Sending same key: ${key}`);
      const res2 = await authorizePayment({
        idempotencyKey: key,
        amount: 1500.0,
        currency: 'INR',
        paymentMode: 'UPI',
        identifier: 'test@okaxis',
      });

      if (res1.transactionReference === res2.transactionReference) {
        addLog(
          'Idempotency Verified ✓',
          'success',
          `Same reference returned (${res2.transactionReference}) without duplicate charge.`
        );
      } else {
        addLog('Warning: Refs differ!', 'error', `Refs: ${res1.transactionReference} vs ${res2.transactionReference}`);
      }
    } catch (err) {
      addLog('Idempotency Error', 'error', err.message);
    } finally {
      setActiveTest(null);
    }
  };

  const runZeroAmountTest = async () => {
    setActiveTest('zero');
    addLog('Zero Amount Test', 'info', 'Sending ₹0.00 payment to test AmountAnomalyFraudHandler…');
    try {
      await authorizePayment({
        idempotencyKey: `KEY-ZERO-${Date.now()}`,
        amount: 0.0,
        currency: 'INR',
        paymentMode: 'UPI',
        identifier: 'test@okaxis',
      });
      addLog('Unexpected: passed', 'error', 'Payment went through!');
    } catch (err) {
      addLog('Fraud Intercepted ✓', 'success', `Blocked: ${err.message}`);
    } finally {
      setActiveTest(null);
    }
  };

  const runBlacklistTest = async () => {
    setActiveTest('blacklist');
    addLog('Blacklist Test', 'info', 'Sending payment to blacklisted VPA: hacker123@okaxis…');
    try {
      await authorizePayment({
        idempotencyKey: `KEY-BL-${Date.now()}`,
        amount: 250.0,
        currency: 'INR',
        paymentMode: 'UPI',
        identifier: 'hacker123@okaxis',
      });
      addLog('Unexpected: passed', 'error', 'Payment was not blocked!');
    } catch (err) {
      addLog('Blacklist Intercepted ✓', 'success', `Blocked: ${err.message}`);
    } finally {
      setActiveTest(null);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    try {
      const data = await getTransactionByIdempotency(lookupKey);
      setLookupResult(data);
      addLog('Lookup Found', 'success', `Ref: ${data.transactionReference}, Amount: ₹${data.amount}`);
    } catch (err) {
      addLog('Lookup Failed', 'error', err.message);
    }
  };

  const inspectLedger = async (ref) => {
    setLedgerRef(ref);
    setLedgerLoading(true);
    try {
      const entries = await getLedgerEntries(ref);
      setLedgerEntries(entries);
      setShowLedger(true);
    } catch (err) {
      addLog('Ledger Error', 'error', err.message);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleCapture = async (refId) => {
    setActionLoading((prev) => ({ ...prev, [refId]: true }));
    try {
      await capturePayment(refId);
      addLog('Capture Success', 'success', `Captured funds for ${refId}`);
      await fetchTransactions();
    } catch (err) {
      addLog('Capture Error', 'error', err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [refId]: false }));
    }
  };

  const handleRefund = async (refId) => {
    const reason = prompt('Enter refund reason:', 'Customer refund request');
    if (!reason) return;
    setActionLoading((prev) => ({ ...prev, [refId]: true }));
    try {
      await refundPayment(refId, null, reason);
      addLog('Refund Success', 'success', `Refunded ${refId}`);
      await fetchTransactions();
    } catch (err) {
      addLog('Refund Error', 'error', err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [refId]: false }));
    }
  };

  return (
    <div className="page fade-in" style={{ maxWidth: 1100 }}>
      {/* Header with status pill and swagger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={22} color="var(--color-accent)" />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Developer & Admin Console</h1>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Isolated technical environment: Fraud Lab, Idempotency Simulator, and Double-Entry Ledger
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: serverOnline ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            color: serverOnline ? 'var(--color-success)' : 'var(--color-danger)',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: serverOnline ? 'var(--color-success)' : 'var(--color-danger)',
            }} />
            <span>{serverOnline ? 'Backend Online (Port 8080)' : 'Backend Offline'}</span>
          </div>

          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            <span>Swagger API</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-lg)' }}>
        {[
          { id: 'lab', label: 'Fraud & Idempotency Lab' },
          { id: 'transactions', label: 'Raw Transactions & Capture/Refund' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '8px 16px' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'lab' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-lg)' }}>
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* Scenarios */}
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
                <ShieldAlert size={18} color="var(--color-accent)" />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Chain of Responsibility Fraud Scenarios</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={runIdempotencyTest}
                  disabled={!!activeTest}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Play size={14} color="var(--color-accent)" />
                  <span>Scenario 1: Idempotency Duplicate Key</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={runZeroAmountTest}
                  disabled={!!activeTest}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Play size={14} color="var(--color-warning)" />
                  <span>Scenario 2: Zero Amount Anomaly Check</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={runBlacklistTest}
                  disabled={!!activeTest}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Play size={14} color="var(--color-danger)" />
                  <span>Scenario 3: Blacklist VPA Screening</span>
                </button>
              </div>
            </div>

            {/* Idempotency Lookup */}
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                Direct Idempotency Registry Query
              </h3>
              <form onSubmit={handleLookup} style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <input
                  type="text"
                  className="input-field font-mono"
                  value={lookupKey}
                  onChange={(e) => setLookupKey(e.target.value)}
                  placeholder="e.g. KEY-IDEM-…"
                  style={{ flex: 1, fontSize: '0.8125rem' }}
                />
                <button type="submit" className="btn btn-secondary">
                  <Search size={14} />
                  <span>Lookup</span>
                </button>
              </form>

              {lookupResult && (
                <div style={{
                  marginTop: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  background: 'var(--color-surface-secondary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
                    <span className="chip chip-success">{lookupResult.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Ref ID:</span>
                    <span className="font-mono">{lookupResult.transactionReference}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Amount:</span>
                    <span style={{ fontWeight: 700 }}>₹{lookupResult.amount} {lookupResult.currency}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ledger Direct Lookup */}
            <div className="card" style={{ padding: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                Double-Entry Ledger Audit Lookup
              </h3>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <input
                  type="text"
                  className="input-field font-mono"
                  value={ledgerRef}
                  onChange={(e) => setLedgerRef(e.target.value)}
                  placeholder="Transaction Reference ID"
                  style={{ flex: 1, fontSize: '0.8125rem' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={ledgerLoading || !ledgerRef}
                  onClick={() => inspectLedger(ledgerRef)}
                >
                  <BookOpen size={14} />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          </div>

          {/* Console Log */}
          <div className="card" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Live Execution Traces</h3>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                onClick={() => setLogs([])}
              >
                Clear
              </button>
            </div>

            <div style={{
              flex: 1,
              minHeight: 380,
              maxHeight: 500,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              {logs.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                  Execute a scenario to view pipeline & handler traces.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm)',
                      background: log.status === 'success'
                        ? 'var(--color-success-bg)'
                        : log.status === 'error'
                        ? 'var(--color-danger-bg)'
                        : 'var(--color-surface-secondary)',
                      fontSize: '0.775rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700 }}>{log.title}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{log.time}</span>
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{log.detail}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Raw Transaction Records & Settlement Ops</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Execute state transitions (Capture / Refund) and inspect immutable double-entry ledger entries.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={fetchTransactions}
              disabled={txLoading}
            >
              <RefreshCw size={12} className={txLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 8px' }}>Ref / Key</th>
                  <th style={{ padding: '10px 8px' }}>Amount</th>
                  <th style={{ padding: '10px 8px' }}>Mode</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No transactions recorded.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.transactionReference} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '10px 8px' }}>
                        <div className="font-mono" style={{ fontWeight: 600 }}>{tx.transactionReference}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{tx.idempotencyKey}</div>
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 700 }}>
                        ₹{parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 8px' }}>{tx.paymentMode || 'Standard'}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span className={`chip ${tx.status === 'AUTHORIZED' ? 'chip-info' : tx.status === 'CAPTURED' ? 'chip-success' : 'chip-warning'}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {tx.status === 'AUTHORIZED' && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                              disabled={actionLoading[tx.transactionReference]}
                              onClick={() => handleCapture(tx.transactionReference)}
                              title="Capture Hold"
                            >
                              <Check size={12} />
                              <span>Capture</span>
                            </button>
                          )}
                          {tx.status === 'CAPTURED' && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                              disabled={actionLoading[tx.transactionReference]}
                              onClick={() => handleRefund(tx.transactionReference)}
                              title="Issue Refund"
                            >
                              <RotateCcw size={12} />
                              <span>Refund</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                            onClick={() => inspectLedger(tx.transactionReference)}
                          >
                            <BookOpen size={12} />
                            <span>Ledger</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {showLedger && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-md)',
          }}
          onClick={() => setShowLedger(false)}
        >
          <div
            className="card scale-in"
            style={{ width: '100%', maxWidth: 640, maxHeight: '80vh', overflowY: 'auto', padding: 'var(--space-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Double-Entry Ledger Audit Trail</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  Ref: {ledgerRef}
                </p>
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowLedger(false)} style={{ padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {ledgerEntries.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>
                No balanced ledger entries for this reference.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ledgerEntries.map((entry, idx) => {
                  const isDebit = entry.direction === 'DEBIT';
                  return (
                    <div
                      key={entry.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface-secondary)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {isDebit ? (
                          <ArrowUpRight size={18} color="var(--color-danger)" />
                        ) : (
                          <ArrowDownLeft size={18} color="var(--color-success)" />
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{entry.type}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            Entry #{entry.id} • {entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString() : 'Recent'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: isDebit ? 'var(--color-danger)' : 'var(--color-success)' }}>
                          {isDebit ? '-' : '+'} ₹{parseFloat(entry.amount).toFixed(2)}
                        </span>
                        <div>
                          <span className={`chip ${isDebit ? 'chip-danger' : 'chip-success'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            {entry.direction}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
