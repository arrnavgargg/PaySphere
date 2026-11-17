import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomTabBar from './BottomTabBar';

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <div className="bottom-spacer" />
      <BottomTabBar />
    </div>
  );
}
