// app/dashboard/page.tsx
"use client";

import DashboardView from '@/app/dashboard/DashboardView';
import Header from '@/components/layout/Header';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { isDarkMode } = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        background: isDarkMode ? '#1a202c' : '#f0f4f8',
        color: isDarkMode ? '#f7fafc' : '#2d3748'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: isDarkMode
        ? "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
        : "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
      color: isDarkMode ? "#f1f5f9" : "#1e293b",
      minHeight: "100vh",
      paddingTop: "80px",
    }}>
      <Header/>

      <div style={{ maxWidth: "1400px", margin: "3rem auto", padding: "0 2rem" }}>
        <DashboardView />
      </div>
    </div>
  );
}