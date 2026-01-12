// app/spend/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Transaction {
  _id?: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface Statistics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryStats: Array<{
    category: string;
    type: string;
    amount: number;
    count: number;
  }>;
  transactionCount: number;
}

const expenseCategories = [
  { name: 'Ăn uống', emoji: '🍔', color: '#f472b6' },
  { name: 'Di chuyển', emoji: '🚗', color: '#60a5fa' },
  { name: 'Giải trí', emoji: '🎮', color: '#a78bfa' },
  { name: 'Mua sắm', emoji: '🛍️', color: '#fb923c' },
  { name: 'Hóa đơn', emoji: '⚡', color: '#f87171' },
  { name: 'Sức khỏe', emoji: '💊', color: '#34d399' },
  { name: 'Học tập', emoji: '📚', color: '#818cf8' },
  { name: 'Khác', emoji: '🎯', color: '#94a3b8' }
];

const incomeCategories = [
  { name: 'Lương', emoji: '💰', color: '#10b981' },
  { name: 'Thưởng', emoji: '🎁', color: '#f59e0b' },
  { name: 'Đầu tư', emoji: '📈', color: '#3b82f6' },
  { name: 'Khác', emoji: '💵', color: '#8b5cf6' }
];

type ViewMode = 'day' | 'month' | 'year';

const API_URL = 'http://localhost:9999/api';

export default function SpendPage() {
  const { user, loading } = useAuth();
  const { isDarkMode } = useDarkMode();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(expenseCategories[0].name);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incomePage, setIncomePage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchStatistics();
    }
  }, [user, viewMode, selectedDate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found. Please login again.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        viewMode,
        selectedDate
      });

      const response = await fetch(`${API_URL}/transactions?${params}`, {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tải giao dịch');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams({
        viewMode,
        selectedDate
      });

      const response = await fetch(`${API_URL}/transactions/statistics?${params}`, {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const addTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description.trim() || (transactionType === 'income' ? 'Thu nhập' : 'Chi tiêu'),
          category,
          date: new Date(selectedDate).toISOString(),
          type: transactionType
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (response.ok) {
        setAmount('');
        setDescription('');
        const cats = transactionType === 'expense' ? expenseCategories : incomeCategories;
        setCategory(cats[0].name);
        setShowAddForm(false);
        
        await fetchTransactions();
        await fetchStatistics();
        
        setIncomePage(1);
        setExpensePage(1);
      } else {
        const error = await response.json();
        alert(error.message || 'Không thể thêm giao dịch');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Lỗi khi thêm giao dịch. Vui lòng thử lại.');
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này?')) return;

    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (response.ok) {
        await fetchTransactions();
        await fetchStatistics();
      } else {
        alert('Không thể xóa giao dịch');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Lỗi khi xóa giao dịch');
    }
  };

  if (loading || !user) return null;

  const totalIncome = statistics?.totalIncome || 0;
  const totalExpense = statistics?.totalExpense || 0;
  const balance = statistics?.balance || 0;

  const getCategoryEmoji = (categoryName: string) => {
    const allCats = [...expenseCategories, ...incomeCategories];
    const found = allCats.find(c => c.name === categoryName);
    return found?.emoji || '📊';
  };

  const getCategoryColor = (categoryName: string) => {
    const allCats = [...expenseCategories, ...incomeCategories];
    const found = allCats.find(c => c.name === categoryName);
    return found?.color || '#94a3b8';
  };

  const allCategories = [...expenseCategories, ...incomeCategories];
  const catStats = allCategories.map(cat => {
    const apiStat = statistics?.categoryStats.find(s => s.category === cat.name);
    const amt = apiStat?.amount || 0;
    const isIncome = incomeCategories.some(ic => ic.name === cat.name);
    const total = isIncome ? totalIncome : totalExpense;
    return { 
      ...cat, 
      amount: amt, 
      percent: total ? (amt / total) * 100 : 0, 
      isIncome 
    };
  }).filter(c => c.amount > 0);

  const formatPeriod = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'day') return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
    if (viewMode === 'month') return d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    return d.getFullYear().toString();
  };

  const incomeTransactions = transactions.filter(tx => tx.type === 'income');
  const expenseTransactions = transactions.filter(tx => tx.type === 'expense');

  const totalIncomePages = Math.ceil(incomeTransactions.length / itemsPerPage);
  const totalExpensePages = Math.ceil(expenseTransactions.length / itemsPerPage);
  
  const paginatedIncomeTransactions = incomeTransactions.slice(
    (incomePage - 1) * itemsPerPage,
    incomePage * itemsPerPage
  );
  
  const paginatedExpenseTransactions = expenseTransactions.slice(
    (expensePage - 1) * itemsPerPage,
    expensePage * itemsPerPage
  );

  const Pagination = ({ currentPage, totalPages, onPageChange }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: '0.5rem', 
        marginTop: '1rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            padding: '0.5rem 0.8rem',
            borderRadius: '8px',
            background: currentPage === 1 ? 'transparent' : (isDarkMode ? '#334155' : '#f1f5f9'),
            color: currentPage === 1 ? (isDarkMode ? '#475569' : '#cbd5e1') : (isDarkMode ? '#f1f5f9' : '#1e293b'),
            border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: currentPage === 1 ? 0.5 : 1
          }}
        >
          ←
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              padding: '0.5rem 0.8rem',
              minWidth: '36px',
              borderRadius: '8px',
              background: currentPage === page ? '#3b82f6' : (isDarkMode ? '#334155' : '#f1f5f9'),
              color: currentPage === page ? 'white' : (isDarkMode ? '#f1f5f9' : '#1e293b'),
              border: `1px solid ${currentPage === page ? '#3b82f6' : (isDarkMode ? '#475569' : '#cbd5e1')}`,
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: '0.5rem 0.8rem',
            borderRadius: '8px',
            background: currentPage === totalPages ? 'transparent' : (isDarkMode ? '#334155' : '#f1f5f9'),
            color: currentPage === totalPages ? (isDarkMode ? '#475569' : '#cbd5e1') : (isDarkMode ? '#f1f5f9' : '#1e293b'),
            border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: currentPage === totalPages ? 0.5 : 1
          }}
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: isDarkMode ? "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)" : "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)",
      color: isDarkMode ? "#f1f5f9" : "#1e293b",
      minHeight: "100vh",
      paddingTop: "80px",
      paddingBottom: "100px",
    }}>
      <Header />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Header */}
        <div style={{
          background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          padding: '1.5rem',
          margin: '2rem 0',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              {(['day', 'month', 'year'] as ViewMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  style={{
                    padding: '0.6rem 1.4rem',
                    borderRadius: '9999px',
                    background: viewMode === m ? '#3b82f6' : 'transparent',
                    color: viewMode === m ? 'white' : (isDarkMode ? '#cbd5e1' : '#64748b'),
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {m === 'day' ? 'Ngày' : m === 'month' ? 'Tháng' : 'Năm'}
                </button>
              ))}
            </div>

            <input
              type={viewMode === 'year' ? 'number' : viewMode === 'month' ? 'month' : 'date'}
              value={viewMode === 'year' ? new Date(selectedDate).getFullYear() : selectedDate}
              onChange={(e) => {
                if (viewMode === 'year') {
                  setSelectedDate(`${e.target.value}-01-01`);
                } else {
                  setSelectedDate(e.target.value);
                }
              }}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                background: isDarkMode ? '#1e293b' : '#f8fafc',
                color: isDarkMode ? '#f1f5f9' : '#1e293b',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
              {formatPeriod()}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.3rem' }}>Thu nhập</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', margin: 0 }}>
                  +{totalIncome.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.3rem' }}>Chi tiêu</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444', margin: 0 }}>
                  -{totalExpense.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.3rem' }}>Còn lại</p>
                <p style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: balance >= 0 ? '#10b981' : '#ef4444',
                  margin: 0
                }}>
                  {balance.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#ef4444'
          }}>
            {error}
          </div>
        )}

        {/* Phân bổ danh mục */}
        {catStats.length > 0 && (
          <div style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
              Phân bổ danh mục
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {catStats.map(stat => (
                <div key={stat.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '1.8rem', width: '40px', textAlign: 'center' }}>
                    {stat.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600 }}>{stat.name}</span>
                      <span>{stat.amount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div style={{
                      height: '10px',
                      background: isDarkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${stat.percent}%`,
                        background: stat.color,
                        borderRadius: '9999px',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>
                  <span style={{ width: '50px', textAlign: 'right', opacity: 0.8 }}>
                    {stat.percent.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
            Đang tải...
          </div>
        )}

        {!isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            <div style={{
              background: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💰</span> Thu nhập
                {incomeTransactions.length > 0 && (
                  <span style={{ fontSize: '0.85rem', opacity: 0.7, fontWeight: 400 }}>
                    ({incomeTransactions.length} giao dịch)
                  </span>
                )}
              </h3>

              {incomeTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                  Chưa có giao dịch thu nhập
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {paginatedIncomeTransactions.map(tx => (
                      <div
                        key={tx._id}
                        style={{
                          background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                          borderRadius: '14px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'}`,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                            {tx.description}
                          </div>
                          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.3rem' }}>
                            {getCategoryEmoji(tx.category)} {tx.category} • {new Date(tx.date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>
                            +{tx.amount.toLocaleString('vi-VN')} ₫
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTransaction(tx._id!)}
                          style={{
                            marginLeft: '1rem',
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            opacity: 0.6
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <Pagination 
                    currentPage={incomePage}
                    totalPages={totalIncomePages}
                    onPageChange={(page) => setIncomePage(page)}
                  />
                </>
              )}
            </div>

            <div style={{
              background: isDarkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💸</span> Chi tiêu
                {expenseTransactions.length > 0 && (
                  <span style={{ fontSize: '0.85rem', opacity: 0.7, fontWeight: 400 }}>
                    ({expenseTransactions.length} giao dịch)
                  </span>
                )}
              </h3>

              {expenseTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                  Chưa có giao dịch chi tiêu
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {paginatedExpenseTransactions.map(tx => (
                      <div
                        key={tx._id}
                        style={{
                          background: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                          borderRadius: '14px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: `1px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'}`,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                            {tx.description}
                          </div>
                          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.3rem' }}>
                            {getCategoryEmoji(tx.category)} {tx.category} • {new Date(tx.date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>
                            -{tx.amount.toLocaleString('vi-VN')} ₫
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTransaction(tx._id!)}
                          style={{
                            marginLeft: '1rem',
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            opacity: 0.6
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <Pagination 
                    currentPage={expensePage}
                    totalPages={totalExpensePages}
                    onPageChange={(page) => setExpensePage(page)}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAddForm(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
          color: 'white',
          border: 'none',
          fontSize: '2rem',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(236, 72, 153, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        +
      </button>

      {showAddForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '1rem'
        }}>
          <div style={{
            background: isDarkMode ? '#1e293b' : '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '460px',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, textAlign: 'center', marginBottom: '1.8rem' }}>
              {transactionType === 'income' ? 'Thêm thu nhập' : 'Thêm chi tiêu'}
            </h3>

            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => {
                  setTransactionType('income');
                  setCategory(incomeCategories[0].name);
                }}
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  borderRadius: '12px',
                  background: transactionType === 'income' ? '#10b981' : 'transparent',
                  color: transactionType === 'income' ? 'white' : (isDarkMode ? '#cbd5e1' : '#64748b'),
                  border: `1px solid ${transactionType === 'income' ? '#10b981' : (isDarkMode ? '#475569' : '#cbd5e1')}`,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                💰 Thu nhập
              </button>
              <button
                onClick={() => {
                  setTransactionType('expense');
                  setCategory(expenseCategories[0].name);
                }}
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  borderRadius: '12px',
                  background: transactionType === 'expense' ? '#ef4444' : 'transparent',
                  color: transactionType === 'expense' ? 'white' : (isDarkMode ? '#cbd5e1' : '#64748b'),
                  border: `1px solid ${transactionType === 'expense' ? '#ef4444' : (isDarkMode ? '#475569' : '#cbd5e1')}`,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                💸 Chi tiêu
              </button>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Số tiền</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="150000"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  borderRadius: '12px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                  background: isDarkMode ? '#334155' : '#f8fafc',
                  color: isDarkMode ? '#f1f5f9' : '#1e293b',
                  fontSize: '1.1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Mô tả</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cà phê, ăn trưa..."
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  borderRadius: '12px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                  background: isDarkMode ? '#334155' : '#f8fafc',
                  color: isDarkMode ? '#f1f5f9' : '#1e293b',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.8rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  borderRadius: '12px',
                  border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                  background: isDarkMode ? '#334155' : '#f8fafc',
                  color: isDarkMode ? '#f1f5f9' : '#1e293b',
                  fontSize: '1rem'
                }}
              >
                {(transactionType === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: isDarkMode ? '#cbd5e1' : '#64748b',
                  border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={addTransaction}
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}