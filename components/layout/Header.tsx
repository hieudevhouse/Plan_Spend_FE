'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  description?: string;
  role: string;
  status: string;
}

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Fetch user profile when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Xác định tab đang active dựa vào URL
  const isDashboard = pathname === '/dashboard';
  const isCalendar = pathname === '/calendar';
  const isSpend = pathname === '/spend';

  // Use profile data if available, otherwise fallback to user data
  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: isDarkMode ? 'rgba(26, 32, 44, 0.95)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.08)',
      padding: '1rem 2rem',
      borderBottom: isDarkMode ? '1px solid #4a5568' : '1px solid #e2e8f0'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/calendar" style={{ textDecoration: 'none' }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: isDarkMode ? '#f7fafc' : '#2D3748'
          }}>
            Peak <span style={{ color: isDarkMode ? '#63b3ed' : '#A7C7E7' }}>Planner</span> 🚀
          </div>
        </Link>

        <nav style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link
            href="/dashboard"
            style={{
              padding: '0.8rem 1.6rem',
              borderRadius: '50px',
              background: isDashboard ? (isDarkMode ? '#4a5568' : '#2D3748') : 'transparent',
              color: isDashboard ? 'white' : (isDarkMode ? '#f7fafc' : '#2D3748'),
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.35s ease'
            }}
          >
            Dashboard
          </Link>

          <Link
            href="/calendar"
            style={{
              padding: '0.8rem 1.6rem',
              borderRadius: '50px',
              background: isCalendar ? (isDarkMode ? '#4a5568' : '#2D3748') : 'transparent',
              color: isCalendar ? 'white' : (isDarkMode ? '#f7fafc' : '#2D3748'),
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.35s ease'
            }}
          >
            Lịch
          </Link>

          <Link
            href="/spend"
            style={{
              padding: '0.8rem 1.6rem',
              borderRadius: '50px',
              background: isSpend ? (isDarkMode ? '#4a5568' : '#2D3748') : 'transparent',
              color: isSpend ? 'white' : (isDarkMode ? '#f7fafc' : '#2D3748'),
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.35s ease'
            }}
          >
            Chi tiêu
          </Link>

          <span style={{
            padding: '0.8rem 1.6rem',
            borderRadius: '50px',
            color: isDarkMode ? '#64748b' : '#94a3b8',
            fontWeight: 500,
            opacity: 0.6
          }}>
            Thống kê (sắp ra mắt)
          </span>
        </nav>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={toggleDarkMode}
            style={{
              padding: '0.8rem',
              border: 'none',
              borderRadius: '50%',
              background: 'transparent',
              color: isDarkMode ? '#f7fafc' : '#2D3748',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.35s ease'
            }}
            title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              {/* Hiển thị "Xin chào + Tên" */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '50px',
                background: isDarkMode ? 'rgba(99, 179, 237, 0.1)' : 'rgba(167, 199, 231, 0.15)',
                border: `2px solid ${isDarkMode ? '#63b3ed' : '#A7C7E7'}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setShowDropdown(!showDropdown)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(99, 179, 237, 0.15)' : 'rgba(167, 199, 231, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(99, 179, 237, 0.1)' : 'rgba(167, 199, 231, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #63b3ed, #A7C7E7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 12px rgba(99, 179, 237, 0.3)'
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    fontWeight: 500
                  }}>
                    Xin chào
                  </span>
                  <span style={{
                    fontSize: '0.95rem',
                    color: isDarkMode ? '#f1f5f9' : '#2D3748',
                    fontWeight: 600,
                    lineHeight: 1
                  }}>
                    {displayName}
                  </span>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  marginLeft: '0.25rem'
                }}>
                  ▼
                </span>
              </div>

              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '65px',
                  right: 0,
                  background: isDarkMode ? '#1e293b' : 'white',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  width: '220px',
                  border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                  overflow: 'hidden'
                }}>
                  {/* User info header */}
                  <div style={{
                    padding: '1rem 1.5rem',
                    background: isDarkMode ? 'rgba(99, 179, 237, 0.1)' : 'rgba(167, 199, 231, 0.1)',
                    borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
                  }}>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: isDarkMode ? '#f1f5f9' : '#2D3748',
                      marginBottom: '0.25rem'
                    }}>
                      {displayName}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: isDarkMode ? '#94a3b8' : '#64748b'
                    }}>
                      {displayEmail}
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem 1.5rem',
                      color: isDarkMode ? '#f1f5f9' : '#2D3748',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'background 0.2s'
                    }}
                    onClick={() => setShowDropdown(false)}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#334155' : '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>👤</span>
                    Hồ sơ cá nhân
                  </Link>
                  
                  <Link
                    href="/settings"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem 1.5rem',
                      color: isDarkMode ? '#f1f5f9' : '#2D3748',
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'background 0.2s'
                    }}
                    onClick={() => setShowDropdown(false)}
                    onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#334155' : '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>⚙️</span>
                    Cài đặt
                  </Link>
                  
                  <hr style={{ margin: '0.5rem 0', borderColor: isDarkMode ? '#334155' : '#e2e8f0', border: 'none', borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` }} />
                  
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                      window.location.href = '/login';
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>🚪</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link href="/login">
              <button style={{
                padding: '0.8rem 1.8rem',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                borderRadius: '50px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              >
                Đăng nhập
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;