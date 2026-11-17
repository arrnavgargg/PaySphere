import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAllCustomers, createCustomer, addCustomerInstrument } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('paysphere_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Sync user with backend customers
  useEffect(() => {
    getAllCustomers()
      .then((customers) => {
        if (!customers || customers.length === 0) return;

        if (user) {
          // If a user is already saved, find their latest database record
          const matched = customers.find(
            (c) =>
              c.id === user.id ||
              c.email?.toLowerCase() === user.email?.toLowerCase() ||
              c.fullName?.toLowerCase() === user.fullName?.toLowerCase()
          );

          if (matched) {
            const userHandle = matched.email?.split('@')[0] || matched.fullName?.toLowerCase().replace(/\s+/g, '') || 'user';
            const autoUpi = `${userHandle}@okpaysphere`;
            const upiInstrument = matched.instruments?.find((i) => i.type === 'UPI')?.detail;

            const updatedUser = {
              ...user,
              id: matched.id,
              fullName: matched.fullName,
              email: matched.email,
              upiId: upiInstrument || autoUpi,
              instruments: matched.instruments || [],
            };
            setUser(updatedUser);
            localStorage.setItem('paysphere_user', JSON.stringify(updatedUser));
          }
        } else {
          // No user saved yet — default to first customer
          const first = customers[0];
          const userHandle = first.email?.split('@')[0] || 'user';
          const autoUpi = `${userHandle}@okpaysphere`;
          const upiInstrument = first.instruments?.find((i) => i.type === 'UPI')?.detail;

          const defaultUser = {
            id: first.id,
            fullName: first.fullName,
            email: first.email,
            phone: '9876543210',
            upiId: upiInstrument || autoUpi,
            instruments: first.instruments || [],
          };
          setUser(defaultUser);
          localStorage.setItem('paysphere_user', JSON.stringify(defaultUser));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (emailOrPhone, password) => {
    try {
      const customers = await getAllCustomers();
      const matched = customers.find(
        (c) =>
          c.email?.toLowerCase() === emailOrPhone.trim().toLowerCase() ||
          c.fullName?.toLowerCase() === emailOrPhone.trim().toLowerCase()
      );

      const userHandle = matched?.email?.split('@')[0] || emailOrPhone.split('@')[0] || 'user';
      const autoUpi = `${userHandle}@okpaysphere`;
      const upiInstrument = matched?.instruments?.find((i) => i.type === 'UPI')?.detail;

      const loggedUser = matched
        ? {
            id: matched.id,
            fullName: matched.fullName,
            email: matched.email,
            phone: '9876543210',
            upiId: upiInstrument || autoUpi,
            instruments: matched.instruments || [],
          }
        : {
            id: Date.now(),
            fullName: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : emailOrPhone,
            email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@paysphere.app`,
            phone: !emailOrPhone.includes('@') ? emailOrPhone : '9876543210',
            upiId: autoUpi,
            instruments: [],
          };

      setUser(loggedUser);
      localStorage.setItem('paysphere_user', JSON.stringify(loggedUser));
      return loggedUser;
    } catch (err) {
      const userHandle = emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : emailOrPhone;
      const autoUpi = `${userHandle}@okpaysphere`;
      const fallbackUser = {
        id: 1,
        fullName: userHandle,
        email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@paysphere.app`,
        phone: '9876543210',
        upiId: autoUpi,
        instruments: [],
      };
      setUser(fallbackUser);
      localStorage.setItem('paysphere_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const register = async ({ fullName, email, phone, pin }) => {
    const userHandle = email.split('@')[0] || fullName.toLowerCase().replace(/\s+/g, '') || 'user';
    const autoUpi = `${userHandle}@okpaysphere`;

    let savedCustomer = null;
    try {
      savedCustomer = await createCustomer({ fullName, email });
      if (savedCustomer?.id) {
        // Automatically link their personalized UPI ID in PostgreSQL!
        try {
          await addCustomerInstrument(savedCustomer.id, {
            type: 'UPI',
            instrumentLabel: `Primary UPI (${userHandle})`,
            detail: autoUpi,
            providerOrNetwork: 'PaySphere UPI',
          });
        } catch (e) {
          console.warn('Auto instrument link warning:', e.message);
        }
      }
    } catch (err) {
      console.warn('Backend customer creation note:', err.message);
    }

    const newUser = {
      id: savedCustomer?.id || Date.now(),
      fullName,
      email,
      phone: phone || '9876543210',
      pin: pin || '1234',
      upiId: autoUpi,
      instruments: [
        {
          id: Date.now(),
          type: 'UPI',
          label: `Primary UPI (${userHandle})`,
          detail: autoUpi,
          providerOrNetwork: 'PaySphere UPI',
        },
      ],
    };

    setUser(newUser);
    localStorage.setItem('paysphere_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('paysphere_user');
  };

  const switchUser = (newUser) => {
    const userHandle = newUser.email?.split('@')[0] || newUser.fullName?.toLowerCase().replace(/\s+/g, '') || 'user';
    const autoUpi = newUser.upiId || `${userHandle}@okpaysphere`;
    const userObj = {
      ...newUser,
      upiId: autoUpi,
    };
    setUser(userObj);
    localStorage.setItem('paysphere_user', JSON.stringify(userObj));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
