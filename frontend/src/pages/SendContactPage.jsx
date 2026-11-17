import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, UserPlus, Phone, CheckCircle2, ChevronRight } from 'lucide-react';
import Avatar from '../components/shared/Avatar';
import { useToast } from '../context/ToastContext';

const DEFAULT_CONTACTS = [
  { id: 'c1', name: 'Abhishek Sharma', phone: '+91 98112 34567', upi: 'abhi@okhdfcbank', avatarColor: '#4F46E5' },
  { id: 'c2', name: 'Pooja Verma', phone: '+91 99223 88765', upi: 'pooja.verma@okaxis', avatarColor: '#EC4899' },
  { id: 'c3', name: 'Rohan Mehra', phone: '+91 97123 44556', upi: 'rohan.m@icici', avatarColor: '#059669' },
  { id: 'c4', name: 'Neha Gupta', phone: '+91 98990 11223', upi: 'neha@paytm', avatarColor: '#D97706' },
  { id: 'c5', name: 'Siddharth Rao', phone: '+91 96554 99887', upi: 'sid.rao@sbi', avatarColor: '#2563EB' },
  { id: 'c6', name: 'Ananya Deshmukh', phone: '+91 98450 67890', upi: 'ananya@kotak', avatarColor: '#7C3AED' },
  { id: 'c7', name: 'PaySphere Merchant', phone: '+91 99000 11111', upi: 'merchant@paysphere', avatarColor: '#0891B2' },
];

export default function SendContactPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newUpi, setNewUpi] = useState('');

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query) ||
      c.upi.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectContact = (contact) => {
    navigate('/pay', {
      state: {
        mode: 'UPI',
        payeeId: contact.upi,
        payeeName: contact.name,
      },
    });
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      addToast('Please enter both name and mobile number', 'error');
      return;
    }
    const upi = newUpi.trim() || `${newPhone.trim().replace(/\D/g, '')}@okpaysphere`;
    const newEntry = {
      id: `c_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      upi,
      avatarColor: '#4F46E5',
    };
    setContacts([newEntry, ...contacts]);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewUpi('');
    addToast(`Contact added! Proceeding to payment...`, 'success');
    handleSelectContact(newEntry);
  };

  return (
    <div className="page fade-in" style={{ maxWidth: 520, margin: '0 auto', padding: 'var(--space-md)' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn btn-ghost"
          style={{ padding: '8px', borderRadius: 'var(--radius-full)' }}
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Send to Contact</h2>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn btn-ghost"
          style={{ padding: '8px', color: 'var(--color-accent)' }}
          title="Add Contact"
        >
          <UserPlus size={20} />
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: 'var(--space-lg)' }}>
        <input
          type="text"
          className="input-field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, phone number, or UPI ID..."
          style={{ paddingLeft: 42 }}
        />
        <Search
          size={18}
          color="var(--color-text-muted)"
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>

      {/* Contacts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
            No contacts found matching "{query}".
            <div style={{ marginTop: 'var(--space-md)' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setNewPhone(query);
                  setShowAddModal(true);
                }}
              >
                + Add "{query}" as New Contact
              </button>
            </div>
          </div>
        ) : (
          filtered.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => handleSelectContact(contact)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
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
              <Avatar name={contact.name} color={contact.avatarColor} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                    {contact.name}
                  </span>
                  <CheckCircle2 size={14} color="var(--color-success)" />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {contact.phone} • {contact.upi}
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </button>
          ))
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '0 0 var(--space-md)' }}>
              Add New Contact
            </h3>
            <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Priyanshu Mehta"
                />
              </div>

              <div>
                <label className="input-label">Mobile Number</label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="input-label">UPI ID (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  value={newUpi}
                  onChange={(e) => setNewUpi(e.target.value)}
                  placeholder="name@okaxis"
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-full">
                  Save & Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

