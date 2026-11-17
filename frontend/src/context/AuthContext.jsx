import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAllCustomers, createCustomer } from '../services/api';

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

  // Initialize with backend customer if none saved
  useEffect(() => {
    if (!user) {
      getAllCustomers()
        .then((customers) => {
          if (customers && customers.length > 0) {
            const initialUser = {
              id: customers[0].id,
              fullName: customers[0].fullName,
              email: customers[0].email,
              phone: '9876543210',
            };
            setUser(initialUser);
            localStorage.setItem('paysphere_user', JSON.stringify(initialUser));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (emailOrPhone, password) => {
    // Look up customer from backend by email if matches
    try {
      const customers = await getAllCustomers();
      const matched = customers.find(
        (c) => c.email?.toLowerCase() === emailOrPhone.trim().toLowerCase()
      );

      const loggedUser = matched
        ? {
            id: matched.id,
            fullName: matched.fullName,
            email: matched.email,
            phone: '9876543210',
          }
        : {
            id: Date.now(),
            fullName: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'User',
            email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@paysphere.app`,
            phone: !emailOrPhone.includes('@') ? emailOrPhone : '9876543210',
          };

      setUser(loggedUser);
      localStorage.setItem('paysphere_user', JSON.stringify(loggedUser));
      return loggedUser;
    } catch (err) {
      // Fallback local session
      const fallbackUser = {
        id: 1,
        fullName: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'User',
        email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@paysphere.app`,
        phone: '9876543210',
      };
      setUser(fallbackUser);
      localStorage.setItem('paysphere_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const register = async ({ fullName, email, phone, pin }) => {
    // Call backend to persist customer
    let savedCustomer;
    try {
      savedCustomer = await createCustomer({ fullName, email });
    } catch (err) {
      // If customer already exists or creation failed, fall back gracefully
      console.warn('Backend customer creation note:', err.message);
    }

    const newUser = {
      id: savedCustomer?.id || Date.now(),
      fullName,
      email,
      phone: phone || '9876543210',
      pin: pin || '1234',
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
    setUser(newUser);
    localStorage.setItem('paysphere_user', JSON.stringify(newUser));
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
