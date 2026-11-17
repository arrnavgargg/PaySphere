import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Copy, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Database,
  Flame,
  Search
} from 'lucide-react';
import { authorizePayment, getTransactionByIdempotency } from '../api';

export default function FraudIdempotencyLab() {
  const [activeTest, setActiveTest] = useState(null);
  const [logs, setLogs] = useState([]);
  const [lookupKey, setLookupKey] = useState('KEY-DEMO-001');
  const [lookupResult, setLookupResult] = useState(null);

  const addLog = (title, status, detail, data) => {
    setLogs((prev) => [
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        title,
        status,
        detail,
        data,
      },
      ...prev,
    ]);
  };

  // Scenario 1: Idempotency Duplicate Key
  const runIdempotencyTest = async () => {
    const key = `KEY-IDEM-${Date.now()}`;
    setActiveTest('idempotency');

    try {
      addLog('Step 1: Sending Initial Payment', 'info', `Sending payment with unique key: ${key}`);
      const res1 = await authorizePayment({
        idempotencyKey: key,
        amount: 1500.00,
        currency: 'INR',
        paymentMode: 'UPI',
        identifier: 'arnav@okaxis',
      });
      addLog('Step 1 Success: Authorized', 'success', `Got Transaction Ref: ${res1.transactionReference}`, res1);

      // Step 2: Resend identical key
      addLog('Step 2: Resending Duplicate Key', 'info', `Resending identical key: ${key}`);
      const res2 = await authorizePayment({
        idempotencyKey: key,
        amount: 1500.00,
        currency: 'INR',
        paymentMode: 'UPI',
        identifier: 'arnav@okaxis',
      });

      if (res1.transactionReference === res2.transactionReference) {
        addLog(
          'Step 2 Success: Idempotency Verified!',
          'success',
          `Same Reference returned (${res2.transactionReference}) without duplicate charge or extra ledger hold.`,
          res2
        );
      } else {
        addLog('Step 2 Warning', 'error', 'References differed!');
      }
    } catch (err) {
      addLog('Idempotency Test Error', 'error', err.message);
    } finally {
      setActiveTest(null);
    }
  };

  // Scenario 2: Zero Amount Anomaly
  const runZeroAmountFraudTest = async () => {
    setActiveTest('zero-amount');
    const key = `KEY-ZERO-${Date.now()}`;

    addLog('Testing Fraud Engine: Zero Amount Anomaly', 'info', 'Sending ₹0.00 payment to trigger AmountAnomalyFraudHandler...');
    try {
      await authorizePayment({
        idempotencyKey: key,
        amount: 0.00,
        currency: 'INR',
        paymentMode: 'UPI',
        identifier: 'arnav@okaxis',
      });
      addLog('Failed Fraud Block', 'error', 'Payment surprisingly went through!');
    } catch (err) {
      addLog(
        'Fraud Engine Intercepted Anomaly (Expected)',
        'fraud-caught',
        `Chain of Responsibility blocked transaction: "${err.message}"`,
        { error: err.message, status: 'FAILED', code: 'FRAUD_DETECTED' }
      );
    } finally {
      setActiveTest(null);
    }
  };

  // Scenario 3: Blacklist Screening
  const runBlacklistTest = async () => {
    setActiveTest('blacklist');
    const key = `KEY-BLACK-${Date.now()}`;

    addLog('Testing Fraud Engine: Blacklisted VPA Screening', 'info', 'Sending payment with flagged identifier "hacker123@okaxis"...');
    try {
      await authorizePayment({
        idempotencyKey: key,
        amount: 250.00,
        currency: 'INR',
        paymentMode: 'UPI',
        identifier: 'hacker123@okaxis',
      });
      addLog('Failed Blacklist Block', 'error', 'Payment was not blocked!');
    } catch (err) {
      addLog(
        'Blacklist Handler Intercepted (Expected)',
        'fraud-caught',
        `BlacklistFraudCheckHandler blocked flagged account: "${err.message}"`,
        { error: err.message, status: 'FAILED', code: 'FRAUD_DETECTED' }
      );
    } finally {
      setActiveTest(null);
    }
  };

  // Direct Key Lookup
  const handleLookup = async (e) => {
    e.preventDefault();
    setLookupResult(null);
    try {
      const data = await getTransactionByIdempotency(lookupKey);
      setLookupResult(data);
      addLog('Idempotency Lookup', 'success', `Found transaction for key ${lookupKey}`, data);
    } catch (err) {
      addLog('Lookup Failed', 'error', err.message);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '30px auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30 }}>
      {/* Test Scenarios Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="glass-panel" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>Fraud & Idempotency Sandbox</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Simulate and verify the Chain of Responsibility fraud detection and atomic idempotency controls.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Test Card 1 */}
            <div style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>1. Idempotency Duplicate Test</h4>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Sends duplicate request with same key; confirms no double debit occurs.
                  </p>
                </div>
                <button
                  onClick={runIdempotencyTest}
                  disabled={activeTest !== null}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', padding: '8px 14px' }}
                >
                  <Play size={12} />
                  <span>Run Test</span>
                </button>
              </div>
            </div>

            {/* Test Card 2 */}
            <div style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--warning)' }}>2. Zero Amount Anomaly</h4>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Sends ₹0.00 payload; verifies AmountAnomalyFraudHandler rejection.
                  </p>
                </div>
                <button
                  onClick={runZeroAmountFraudTest}
                  disabled={activeTest !== null}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.75rem',
                    padding: '8px 14px',
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                    color: 'var(--warning)',
                  }}
                >
                  <Flame size={12} />
                  <span>Test Anomaly</span>
                </button>
              </div>
            </div>

            {/* Test Card 3 */}
            <div style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--danger)' }}>3. Blacklist Fraud Check</h4>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Tests VPA screening for blacklisted or flagged malicious accounts.
                  </p>
                </div>
                <button
                  onClick={runBlacklistTest}
                  disabled={activeTest !== null}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.75rem',
                    padding: '8px 14px',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: 'var(--danger)',
                  }}
                >
                  <ShieldAlert size={12} />
                  <span>Test Blacklist</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Idempotency Key Lookup Tool */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Direct Idempotency Registry Query</h3>
          <form onSubmit={handleLookup} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={lookupKey}
              onChange={(e) => setLookupKey(e.target.value)}
              placeholder="e.g. KEY-DEMO-001"
              className="input-field font-mono"
              style={{ fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
              <Search size={14} />
              <span>Lookup</span>
            </button>
          </form>

          {lookupResult && (
            <div style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.8rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span className="badge badge-authorized">{lookupResult.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Reference ID:</span>
                <span className="font-mono">{lookupResult.transactionReference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount:</span>
                <span style={{ fontWeight: 700 }}>₹{lookupResult.amount} {lookupResult.currency}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Test Console Log */}
      <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Execution Console</h3>
          <button
            onClick={() => setLogs([])}
            className="btn btn-outline"
            style={{ fontSize: '0.7rem', padding: '4px 8px' }}
          >
            Clear
          </button>
        </div>

        <div style={{
          flex: 1,
          minHeight: 400,
          maxHeight: 520,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {logs.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              Run a scenario on the left to see live orchestrator, fraud handler, and idempotency traces.
            </div>
          ) : (
            logs.map((log) => {
              const isSuccess = log.status === 'success';
              const isFraudCaught = log.status === 'fraud-caught';
              const isError = log.status === 'error';

              let borderColor = 'var(--border-color)';
              let bg = 'rgba(255, 255, 255, 0.02)';
              if (isSuccess) {
                borderColor = 'rgba(16, 185, 129, 0.3)';
                bg = 'rgba(16, 185, 129, 0.05)';
              } else if (isFraudCaught) {
                borderColor = 'rgba(245, 158, 11, 0.3)';
                bg = 'rgba(245, 158, 11, 0.05)';
              } else if (isError) {
                borderColor = 'rgba(239, 68, 68, 0.3)';
                bg = 'rgba(239, 68, 68, 0.05)';
              }

              return (
                <div
                  key={log.id}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: bg,
                    border: `1px solid ${borderColor}`,
                    fontSize: '0.775rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isSuccess && <CheckCircle2 size={14} color="var(--success)" />}
                      {isFraudCaught && <ShieldAlert size={14} color="var(--warning)" />}
                      {isError && <XCircle size={14} color="var(--danger)" />}
                      <span style={{ fontWeight: 700, color: '#fff' }}>{log.title}</span>
                    </div>
                    <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{log.time}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{log.detail}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

