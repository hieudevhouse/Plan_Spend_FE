// hooks/useAuth.ts
import { useState, useEffect } from 'react';

// Define the response type from your backend
interface LoginResponse {
  Message: string;
  access_token: string; // Backend trả về snake_case
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    status?: string;
  };
}

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  status?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra user khi component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Đăng nhập thất bại');
    }

    const data: LoginResponse = await res.json();
    
    // Lưu vào localStorage
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Cập nhật state
    setUser(data.user);
    
    return data;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const getUser = (): User | null => {
    return user;
  };

  return { user, loading, login, logout, getToken, getUser };
};