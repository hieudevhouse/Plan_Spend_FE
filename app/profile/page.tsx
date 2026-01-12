// app/profile/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useStatistics } from '@/hooks/useStatistics';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  description?: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  
  // Sử dụng hook statistics
  const { 
    stats, 
    streaks, 
    loading: statsLoading, 
    checkInLoading,
    hasCheckedInToday,
    checkIn,
    refresh: refreshStats 
  } = useStatistics();

  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // User data from API
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch user profile on mount
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfile(data);
      setName(data.name);
      setEmail(data.email);
      setDescription(data.description || 'Sự thành công thường đến cho những người không bao giờ từ bỏ');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setProfile(updatedUser);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Không thể cập nhật thông tin');
      alert('Lỗi: ' + (err.message || 'Không thể cập nhật thông tin'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      // Verify current password by attempting login
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profile?.email,
          password: currentPassword,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Mật khẩu hiện tại không đúng');
      }

      // Update password
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể đổi mật khẩu');
      }

      alert('Đổi mật khẩu thành công!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error changing password:', err);
      alert('Lỗi: ' + (err.message || 'Không thể đổi mật khẩu'));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkIn();
    } catch (err) {
      // Error đã được handle trong hook
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const bgGradient = isDarkMode
    ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
    : 'linear-gradient(135deg, #f0f4f8 0%, #c7d2fe 100%)';

  const cardBg = isDarkMode ? '#2d3748' : '#ffffff';
  const textPrimary = isDarkMode ? '#f1f5f9' : '#1e293b';
  const textSecondary = isDarkMode ? '#cbd5e1' : '#64748b';
  const borderColor = isDarkMode ? '#4a5568' : '#e2e8f0';
  const inputBg = isDarkMode ? '#1e293b' : '#f8fafc';

  // Sử dụng data từ API thay vì hardcode
  const statsData = [
    { 
      label: 'Tasks hoàn thành', 
      value: stats?.completedTasks?.toString() || '0', 
      icon: '✅', 
      color: '#10B981' 
    },
    { 
      label: 'Chuỗi task liên tiếp', 
      value: streaks?.taskStreak?.current?.toString() || '0', 
      icon: '🔥', 
      color: '#F59E0B' 
    },
    { 
      label: 'Thời gian tập trung', 
      value: `${stats?.totalFocusHours || 0}h`, 
      icon: '⏰', 
      color: '#3B82F6' 
    },
    { 
      label: 'Mục tiêu đạt được', 
      value: stats?.goalsAchieved?.toString() || '0', 
      icon: '🎯', 
      color: '#8B5CF6' 
    },
  ];

  const achievements = [
    { 
      title: 'Người mới', 
      icon: '🌱', 
      desc: 'Hoàn thành 10 tasks đầu tiên', 
      unlocked: (stats?.completedTasks || 0) >= 10 
    },
    { 
      title: 'Kiên trì', 
      icon: '💪', 
      desc: 'Duy trì 7 ngày liên tiếp', 
      unlocked: (streaks?.taskStreak?.longest || 0) >= 7 
    },
    { 
      title: 'Chuyên nghiệp', 
      icon: '⭐', 
      desc: 'Hoàn thành 100 tasks', 
      unlocked: (stats?.completedTasks || 0) >= 100 
    },
    { 
      title: 'Siêu sao', 
      icon: '🏆', 
      desc: 'Duy trì 30 ngày liên tiếp', 
      unlocked: (streaks?.taskStreak?.longest || 0) >= 30 
    },
  ];

  if ((loading && !profile) || statsLoading) {
    return (
      <div style={{
        fontFamily: "'Inter', sans-serif",
        background: bgGradient,
        minHeight: '100vh',
        paddingTop: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: textPrimary, fontSize: '1.2rem' }}>
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: bgGradient,
      minHeight: '100vh',
      paddingTop: '70px',
    }}>
      <Header />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
      }}>
        {error && (
          <div style={{
            background: '#FEE2E2',
            color: '#991B1B',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            border: '1px solid #FCA5A5',
          }}>
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div style={{
          background: cardBg,
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.08)',
          border: `1px solid ${borderColor}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: '2rem',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Avatar */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3.5rem',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
              position: 'relative',
            }}>
              🐻‍❄️
              <div style={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: profile?.status === 'active' ? '#10B981' : '#94A3B8',
                border: `3px solid ${cardBg}`,
              }} />
            </div>

            {/* Info */}
            <div>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tên của bạn"
                    style={{
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      color: textPrimary,
                      background: inputBg,
                      border: `2px solid ${borderColor}`,
                      borderRadius: '8px',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      width: '100%',
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email của bạn"
                    style={{
                      fontSize: '1rem',
                      color: textSecondary,
                      background: inputBg,
                      border: `2px solid ${borderColor}`,
                      borderRadius: '8px',
                      padding: '0.5rem',
                      width: '100%',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả về bạn"
                    style={{
                      fontSize: '0.95rem',
                      color: textPrimary,
                      background: inputBg,
                      border: `2px solid ${borderColor}`,
                      borderRadius: '8px',
                      padding: '0.5rem',
                      width: '100%',
                      minHeight: '60px',
                      fontFamily: "'Inter', sans-serif",
                      resize: 'vertical',
                    }}
                  />
                </>
              ) : (
                <>
                  <h1 style={{
                    margin: '0 0 0.5rem',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: textPrimary,
                  }}>
                    {name}
                  </h1>
                  <p style={{
                    margin: '0 0 0.8rem',
                    fontSize: '1rem',
                    color: textSecondary,
                  }}>
                    {email}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    color: textSecondary,
                    fontStyle: 'italic',
                  }}>
                    {description}
                  </p>
                  {profile?.role === 'admin' && (
                    <div style={{
                      marginTop: '0.5rem',
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      color: 'white',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      👑 Admin
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
            }}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                      padding: '0.7rem 1.5rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: loading ? '#94A3B8' : '#10B981',
                      color: 'white',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#059669')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#10B981')}
                  >
                    {loading ? '⏳ Đang lưu...' : '💾 Lưu'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setName(profile?.name || '');
                      setEmail(profile?.email || '');
                      setDescription(profile?.description || '');
                    }}
                    disabled={loading}
                    style={{
                      padding: '0.7rem 1.5rem',
                      borderRadius: '12px',
                      border: `2px solid ${borderColor}`,
                      background: 'transparent',
                      color: textSecondary,
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    ✕ Hủy
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '0.7rem 1.5rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#3B82F6',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563EB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#3B82F6'}
                  >
                    ✏️ Chỉnh sửa
                  </button>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    style={{
                      padding: '0.7rem 1.5rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#8B5CF6',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#7C3AED'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#8B5CF6'}
                  >
                    🔐 Đổi mật khẩu
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '0.7rem 1.5rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#EF4444',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#EF4444'}
                  >
                    🚪 Đăng xuất
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Check-in Button */}
        <div style={{
          background: cardBg,
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
          border: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{
              margin: '0 0 0.5rem',
              fontSize: '1.2rem',
              fontWeight: 600,
              color: textPrimary,
            }}>
              📅 Điểm danh hàng ngày
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: textSecondary,
            }}>
              Chuỗi điểm danh hiện tại: <strong style={{ color: '#F59E0B' }}>{streaks?.checkInStreak?.current || 0} ngày</strong>
              {streaks?.checkInStreak?.longest ? ` • Kỷ lục: ${streaks.checkInStreak.longest} ngày` : ''}
            </p>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={hasCheckedInToday || checkInLoading}
            style={{
              padding: '0.8rem 1.8rem',
              borderRadius: '12px',
              border: 'none',
              background: hasCheckedInToday ? '#94A3B8' : checkInLoading ? '#94A3B8' : '#10B981',
              color: 'white',
              fontWeight: 600,
              cursor: hasCheckedInToday || checkInLoading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!hasCheckedInToday && !checkInLoading) {
                e.currentTarget.style.background = '#059669';
              }
            }}
            onMouseLeave={(e) => {
              if (!hasCheckedInToday && !checkInLoading) {
                e.currentTarget.style.background = '#10B981';
              }
            }}
          >
            {checkInLoading ? '⏳ Đang xử lý...' : hasCheckedInToday ? '✅ Đã điểm danh' : '👆 Điểm danh ngay'}
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {statsData.map((stat, i) => (
            <div
              key={i}
              style={{
                background: cardBg,
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
                border: `1px solid ${borderColor}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = isDarkMode ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: stat.color,
                    marginBottom: '0.3rem',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: textSecondary,
                    fontWeight: 500,
                  }}>
                    {stat.label}
                  </div>
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  opacity: 0.8,
                }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievements Section */}
        <div style={{
          background: cardBg,
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.08)',
          border: `1px solid ${borderColor}`,
        }}>
          <h2 style={{
            margin: '0 0 1.5rem',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: textPrimary,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            🏅 Thành tích
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.2rem',
          }}>
            {achievements.map((achievement, i) => (
              <div
                key={i}
                style={{
                  background: achievement.unlocked 
                    ? (isDarkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)')
                    : (isDarkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(226, 232, 240, 0.5)'),
                  borderRadius: '16px',
                  padding: '1.2rem',
                  border: `2px solid ${achievement.unlocked ? '#8B5CF6' : borderColor}`,
                  opacity: achievement.unlocked ? 1 : 0.6,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => achievement.unlocked && (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => achievement.unlocked && (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '0.5rem',
                  filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
                }}>
                  {achievement.icon}
                </div>
                <h3 style={{
                  margin: '0 0 0.3rem',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: textPrimary,
                }}>
                  {achievement.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  color: textSecondary,
                  lineHeight: 1.4,
                }}>
                  {achievement.desc}
                </p>
                {achievement.unlocked && (
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#10B981',
                    fontWeight: 600,
                  }}>
                    ✓ Đã mở khóa
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1rem',
          }}
          onClick={() => setShowChangePassword(false)}
        >
          <div
            style={{
              background: cardBg,
              borderRadius: '20px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: isDarkMode ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.15)',
              border: `1px solid ${borderColor}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '1.5rem 1.5rem 1rem',
              borderBottom: `1px solid ${borderColor}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.3rem',
                fontWeight: 600,
                color: textPrimary,
              }}>
                🔐 Đổi mật khẩu
              </h3>
              <button
                onClick={() => setShowChangePassword(false)}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  color: textSecondary,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = isDarkMode ? '#334155' : '#f1f5f9')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'transparent')}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: textSecondary,
                fontWeight: 500,
                fontSize: '0.9rem',
              }}>
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: `2px solid ${borderColor}`,
                  background: inputBg,
                  color: textPrimary,
                  fontSize: '0.95rem',
                  marginBottom: '1.2rem',
                }}
              />

              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: textSecondary,
                fontWeight: 500,
                fontSize: '0.9rem',
              }}>
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: `2px solid ${borderColor}`,
                  background: inputBg,
                  color: textPrimary,
                  fontSize: '0.95rem',
                  marginBottom: '1.2rem',
                }}
              />

              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: textSecondary,
                fontWeight: 500,
                fontSize: '0.9rem',
              }}>
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: `2px solid ${borderColor}`,
                  background: inputBg,
                  color: textPrimary,
                  fontSize: '0.95rem',
                  marginBottom: '1.5rem',
                }}
              />

              <div style={{
                display: 'flex',
                gap: '1rem',
              }}>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.9rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: loading ? '#94A3B8' : '#8B5CF6',
                    color: 'white',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#7C3AED')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#8B5CF6')}
                >
                  Xác nhận
                </button>
                <button
                  onClick={() => setShowChangePassword(false)}
                  style={{
                    flex: 1,
                    padding: '0.9rem',
                    borderRadius: '10px',
                    border: `2px solid ${borderColor}`,
                    background: 'transparent',
                    color: textSecondary,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}