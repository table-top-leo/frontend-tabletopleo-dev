"use client";

import { useState, useEffect } from 'react';
import TableTopLeoLoginPage from './logintabletopleo/loginpage'
import MainAdminDashboard from './tabletopleodashboard/tabletopleodashboardpage'

function Home() {

  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('ttl_token');
      const user = localStorage.getItem('ttl_user');
      setHasSession(Boolean(token && user));
    } catch {
      setHasSession(false);
    }
  }, []);

  if (hasSession === null) {

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f5f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '3px solid #e5e7eb', borderTopColor: '#6366f1',
          animation: 'ttlSpin 0.7s linear infinite',
        }} />
        <style>{`@keyframes ttlSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return hasSession ? <MainAdminDashboard /> : <TableTopLeoLoginPage />;
}

export default Home;