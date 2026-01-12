// app/login/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      
      console.log('Login response:', data); // Debug log
      
      // Lưu token vào localStorage (backend trả về access_token)
      if (data.access_token) {
        localStorage.setItem('accessToken', data.access_token);
        console.log('Token saved:', data.access_token); // Debug log
      }
      
      // Lưu thông tin user nếu cần
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('User saved:', data.user); // Debug log
      }

      console.log('Redirecting to /calendar...'); // Debug log
      
      // Chuyển hướng đến calendar
      router.replace('/calendar');
    } catch (err: any) {
      console.error('Login error:', err); // Debug log
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 40%, #c7d2fe 80%, #ddd6fe 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden',
      padding: '10px',
    }}>
      {/* Nền trang trí gradient nhẹ */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.35,
        background: `
          radial-gradient(circle at 15% 80%, #a5b4fc 0%, transparent 50%),
          radial-gradient(circle at 85% 20%, #c4b5fd 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, #f9a8d4 0%, transparent 40%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Emoji trang trí - chỉ hiển thị trên màn lớn */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: typeof window !== 'undefined' && window.innerWidth > 768 ? 'block' : 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '3rem', opacity: 0.6, animation: 'float 12s infinite ease-in-out' }}>🐻‍❄️</div>
        <div style={{ position: 'absolute', top: '15%', right: '12%', fontSize: '2.5rem', opacity: 0.6, animation: 'float 14s infinite ease-in-out reverse' }}>🦸‍♂️</div>
        <div style={{ position: 'absolute', bottom: '15%', left: '15%', fontSize: '3rem', opacity: 0.6, animation: 'float 13s infinite ease-in-out' }}>💻</div>
        <div style={{ position: 'absolute', bottom: '20%', right: '18%', fontSize: '2.5rem', opacity: 0.7, animation: 'bounce 5s infinite' }}>😄</div>
        <div style={{ position: 'absolute', top: '30%', left: '50%', fontSize: '2rem', opacity: 0.7, animation: 'heartBeat 3s infinite' }}>❤️</div>
        <div style={{ position: 'absolute', top: '50%', right: '8%', fontSize: '3rem', opacity: 0.6, animation: 'float 16s infinite ease-in-out' }}>🎧</div>
      </div>

      {/* Form đăng nhập - compact */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px)',
        borderRadius: '30px',
        padding: '2rem 2.5rem',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 30px 80px rgba(167, 199, 231, 0.5)',
        border: '1px solid rgba(199, 210, 254, 0.8)',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Logo + Tiêu đề - compact */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '70px',
            height: '70px',
            margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd, #f9a8d4)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 15px 40px rgba(165, 180, 252, 0.5)',
          }}>
            <span style={{ fontSize: '2.5rem' }}>🚀</span>
          </div>

          <h2 style={{
            fontSize: '2rem',
            fontWeight: 900,
            margin: '0 0 0.5rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            Peak Planner
          </h2>

          <p style={{
            fontSize: '0.95rem',
            opacity: 0.85,
            color: '#64748b',
            margin: 0,
          }}>
            Chào mừng trở lại! Đăng nhập để tiếp tục 💫
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Thông báo lỗi */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid #fca5a5',
              borderRadius: '16px',
              color: '#dc2626',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 700,
              color: '#4c1d95',
              fontSize: '0.95rem'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="you@peakplanner.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '16px',
                border: '2px solid #c7d2fe',
                background: loading ? '#f1f5f9' : '#f8fafc',
                color: '#1e293b',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'text',
              }}
              onFocus={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#8b5cf6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.2)';
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#c7d2fe';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 700,
              color: '#4c1d95',
              fontSize: '0.95rem'
            }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '16px',
                border: '2px solid #c7d2fe',
                background: loading ? '#f1f5f9' : '#f8fafc',
                color: '#1e293b',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'text',
              }}
              onFocus={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#ec4899';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.2)';
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#c7d2fe';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1.1rem',
              fontWeight: 800,
              background: loading 
                ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)' 
                : 'linear-gradient(135deg, #8b5cf6, #a78bfa, #ec4899)',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading 
                ? '0 10px 30px rgba(148, 163, 184, 0.3)' 
                : '0 15px 40px rgba(139, 92, 246, 0.5)',
              transition: 'all 0.4s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(139, 92, 246, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.5)';
              }
            }}
          >
            {loading ? (
              <>
                <span style={{ 
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}>
                </span>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.4rem' }}>🚀</span>
                Đăng nhập ngay
              </>
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: '#64748b',
          marginBottom: 0,
        }}>
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            style={{
              color: '#8b5cf6',
              fontWeight: 700,
              textDecoration: 'none',
              borderBottom: '2px solid #c4b5fd',
              paddingBottom: '1px',
              transition: 'all 0.3s ease',
              pointerEvents: loading ? 'none' : 'auto',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#a78bfa'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#8b5cf6'}
          >
            {/* Đăng ký miễn phí */}
          </Link>
        </p>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}