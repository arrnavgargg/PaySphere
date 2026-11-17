import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  CreditCard, 
  QrCode, 
  Plus, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { getAllCustomers, createCustomer, addCustomerInstrument } from '../api';

export default function CustomerHub() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New customer form
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [creatingCust, setCreatingCust] = useState(false);

  // New instrument form
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [instType, setInstType] = useState('UPI');
  const [instIdentifier, setInstIdentifier] = useState('');
  const [instLabel, setInstLabel] = useState('');
  const [instProvider, setInstProvider] = useState('');
  const [addingInst, setAddingInst] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getAllCustomers();
      setCustomers(data);
      if (data.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(data[0].id);
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCreatingCust(true);
    try {
      await createCustomer({ fullName: newFullName, email: newEmail });
      setNewFullName('');
      setNewEmail('');
      await fetchCustomers();
    } catch (err) {
      alert(`Error creating customer: ${err.message}`);
    } finally {
      setCreatingCust(false);
    }
  };

  const handleAddInstrument = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer first');
      return;
    }
    setAddingInst(true);
    try {
      await addCustomerInstrument(selectedCustomerId, {
        type: instType,
        identifier: instIdentifier,
        label: instLabel || undefined,
        providerOrNetwork: instProvider || undefined,
      });
      setInstIdentifier('');
      setInstLabel('');
      setInstProvider('');
      await fetchCustomers();
    } catch (err) {
      alert(`Error adding instrument: ${err.message}`);
    } finally {
      setAddingInst(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '30px auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30 }}>
      {/* Customer Directory */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Customer Profiles & Instruments</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Registered payers, merchants, and tokenized payment instruments
              </p>
            </div>
            <button
              onClick={fetchCustomers}
              disabled={loading}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading && customers.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading customers...
            </div>
          ) : customers.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No customers found. Create one on the right.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {customers.map((cust) => (
                <div
                  key={cust.id}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{cust.fullName}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cust.email}</p>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-secondary)',
                    }}>
                      ID: #{cust.id}
                    </span>
                  </div>

                  {/* Linked Instruments */}
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Linked Instruments ({cust.instruments?.length || 0})
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      {cust.instruments && cust.instruments.length > 0 ? (
                        cust.instruments.map((inst) => (
                          <div
                            key={inst.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '5px 10px',
                              borderRadius: 8,
                              background: 'rgba(99, 102, 241, 0.1)',
                              border: '1px solid rgba(99, 102, 241, 0.25)',
                              fontSize: '0.75rem',
                            }}
                          >
                            {inst.type === 'UPI' ? <QrCode size={12} color="var(--primary)" /> : <CreditCard size={12} color="var(--primary)" />}
                            <span style={{ fontWeight: 600 }}>{inst.label || inst.detail}</span>
                            <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                              ({inst.detail})
                            </span>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No instruments linked yet.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Creation Forms */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Create Customer Card */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <UserPlus size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Add New Customer</h3>
          </div>
          <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. rahul.verma@example.com"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={creatingCust}
              className="btn btn-primary"
              style={{ marginTop: 4, padding: '10px' }}
            >
              <Plus size={14} />
              <span>{creatingCust ? 'Creating...' : 'Create Customer'}</span>
            </button>
          </form>
        </div>

        {/* Link Instrument Card */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CreditCard size={18} color="var(--info)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Link Payment Instrument</h3>
          </div>
          <form onSubmit={handleAddInstrument} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">Target Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="input-field"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="label">Instrument Type</label>
                <select
                  value={instType}
                  onChange={(e) => setInstType(e.target.value)}
                  className="input-field"
                >
                  <option value="UPI">UPI VPA</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                </select>
              </div>
              <div>
                <label className="label">Provider / Network</label>
                <input
                  type="text"
                  value={instProvider}
                  onChange={(e) => setInstProvider(e.target.value)}
                  placeholder={instType === 'UPI' ? 'GooglePay' : 'VISA'}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label">{instType === 'UPI' ? 'UPI Address (VPA)' : 'Card Number'}</label>
              <input
                type="text"
                required
                value={instIdentifier}
                onChange={(e) => setInstIdentifier(e.target.value)}
                placeholder={instType === 'UPI' ? 'user@okicici' : '4111222233334444'}
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="label">Friendly Label</label>
              <input
                type="text"
                value={instLabel}
                onChange={(e) => setInstLabel(e.target.value)}
                placeholder="e.g. My HDFC Card or Personal UPI"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={addingInst}
              className="btn btn-secondary"
              style={{ marginTop: 4, padding: '10px' }}
            >
              <Plus size={14} />
              <span>{addingInst ? 'Linking...' : 'Link Instrument'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

