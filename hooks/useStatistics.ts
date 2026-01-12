// hooks/useStatistics.ts
import { useState, useEffect, useCallback } from 'react';
import { statisticsApi } from '../lib/api';
import { toast } from 'react-hot-toast';

interface UserStats {
  completedTasks: number;
  taskStreak: number;
  checkInStreak: number;
  totalFocusHours: number;
  goalsAchieved: number;
}

interface Streaks {
  taskStreak: {
    current: number;
    longest: number;
    lastDate: string | null;
  };
  checkInStreak: {
    current: number;
    longest: number;
    lastDate: string | null;
  };
}

export const useStatistics = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await statisticsApi.getUserStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch streaks
  const fetchStreaks = useCallback(async () => {
    try {
      const data = await statisticsApi.getStreaks();
      setStreaks(data);
    } catch (error: any) {
      console.error('Error fetching streaks:', error);
    }
  }, []);

  // Check if checked in today
  const checkIfCheckedInToday = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const history = await statisticsApi.getCheckInHistory(today, today);
      setHasCheckedInToday(history.length > 0);
    } catch (error: any) {
      console.error('Error checking check-in status:', error);
    }
  }, []);

  // Check in
  const checkIn = async () => {
    try {
      setCheckInLoading(true);
      const result = await statisticsApi.checkIn();
      toast.success(`🎉 ${result.message} Streak: ${result.streak} ngày!`);
      setHasCheckedInToday(true);
      
      // Refresh data
      await Promise.all([fetchStats(), fetchStreaks()]);
      
      return result;
    } catch (error: any) {
      console.error('Error checking in:', error);
      const message = error.response?.data?.message || 'Không thể điểm danh';
      toast.error(message);
      throw error;
    } finally {
      setCheckInLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchStats();
    fetchStreaks();
    checkIfCheckedInToday();
  }, [fetchStats, fetchStreaks, checkIfCheckedInToday]);

  return {
    stats,
    streaks,
    loading,
    checkInLoading,
    hasCheckedInToday,
    checkIn,
    refresh: () => {
      fetchStats();
      fetchStreaks();
      checkIfCheckedInToday();
    },
  };
};