import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PayFlow from './pages/PayFlow';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import DevToolsPage from './pages/DevToolsPage';

export default function App() {
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/pay" element={<PayFlow />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* Dev tools hidden route - active only when VITE_DEV_MODE=true */}
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
    </ThemeProvider>
  );
}
