// lib/api.ts
import axios from 'axios';
import { Task } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9999/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Interceptor để thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để handle token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Task API
export const taskApi = {
  // Tạo task mới
  create: async (data: {
    name: string;
    date: string;
    start: number;
    duration: number;
    priority: 'low' | 'medium' | 'high';
    note?: string;
  }) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  // Lấy tất cả tasks (có filter)
  getAll: async (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    completed?: boolean;
    priority?: string;
  }) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Lấy tasks theo tháng (cho calendar)
  getByMonth: async (year: number, month: number) => {
    const response = await api.get(`/tasks/month/${year}/${month}`);
    return response.data;
  },

  // Lấy chi tiết task
  getOne: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Cập nhật task
  update: async (id: string, data: {
    name?: string;
    date?: string;
    start?: number;
    duration?: number;
    priority?: 'low' | 'medium' | 'high';
    note?: string;
    completed?: boolean;
  }) => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },

  // Toggle hoàn thành
  toggleComplete: async (id: string) => {
    const response = await api.patch(`/tasks/${id}/toggle-complete`);
    return response.data;
  },

  // Xóa task
  delete: async (id: string) => {
    await api.delete(`/tasks/${id}`);
  },

  // Xóa tất cả tasks đã hoàn thành
  deleteCompleted: async () => {
    const response = await api.delete('/tasks/completed/all');
    return response.data;
  },

  // Lấy thống kê
  getStatistics: async (date?: string) => {
    const response = await api.get('/tasks/statistics', {
      params: date ? { date } : {},
    });
    return response.data;
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export default api;
export const statisticsApi = {
  // Lấy thống kê tổng quan
  getUserStats: async () => {
    const response = await fetch(`${API_URL}/statistics/user-stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }

    return response.json();
  },

  // Lấy thông tin streaks
  getStreaks: async () => {
    const response = await fetch(`${API_URL}/statistics/streaks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch streaks');
    }

    return response.json();
  },

  // Điểm danh
  checkIn: async () => {
    const response = await fetch(`${API_URL}/statistics/check-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw { response: { data: errorData } };
    }

    return response.json();
  },

  // Lấy lịch sử điểm danh
  getCheckInHistory: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = `${API_URL}/statistics/check-in-history${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch check-in history');
    }

    return response.json();
  },
};