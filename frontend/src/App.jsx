import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PayFlow from './pages/PayFlow';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import DevToolsPage from './pages/DevToolsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PayQrPage from './pages/PayQrPage';
import SendContactPage from './pages/SendContactPage';
import PayBankPage from './pages/PayBankPage';
import CardPaymentPage from './pages/CardPaymentPage';
import NetBankingPage from './pages/NetBankingPage';
import RechargePage from './pages/RechargePage';

export default function App() {
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Standalone Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Main Shell Layout Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/pay" element={<PayFlow />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Dedicated Payment & Banking Pages */}
                <Route path="/pay-qr" element={<PayQrPage />} />
                <Route path="/send-contact" element={<SendContactPage />} />
                <Route path="/pay-bank" element={<PayBankPage />} />
                <Route path="/card-payment" element={<CardPaymentPage />} />
                <Route path="/net-banking" element={<NetBankingPage />} />
                <Route path="/recharge" element={<RechargePage />} />
                <Route path="/dth" element={<RechargePage initialTab="dth" />} />
                <Route path="/electricity" element={<RechargePage initialTab="electricity" />} />
                <Route path="/broadband" element={<RechargePage initialTab="broadband" />} />
                <Route path="/fastag" element={<RechargePage initialTab="fastag" />} />

                {/* Dev tools route */}
                {isDevMode ? (
                  <>
                    <Route path="/dev-tools" element={<DevToolsPage />} />
                    <Route path="/admin" element={<DevToolsPage />} />
                  </>
                ) : (
                  <>
                    <Route path="/dev-tools" element={<Navigate to="/" replace />} />
                    <Route path="/admin" element={<Navigate to="/" replace />} />
                  </>
                )}

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
