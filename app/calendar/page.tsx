// app/calendar/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import CalendarView from '@/components/calendar/CalendarView';
import DayTimelineModal from '@/components/calendar/DayTimelineModal';
import AddTaskModal from '@/components/task/AddTaskModal';
import TaskDetailModal from '@/components/task/TaskDetailModal';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const { 
    tasks, 
    loading: tasksLoading,
    currentMonth,
    addTask, 
    updateTask, 
    deleteTask,
    toggleComplete: toggleTaskComplete,
    changeMonth
  } = useTasks();
  
  const { user, loading: authLoading } = useAuth();
  const { isDarkMode } = useDarkMode();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null);
  const [currentDateKey, setCurrentDateKey] = useState<string>('');
  const [prefillStartTime, setPrefillStartTime] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<{ task: any; dateKey: string; index: number } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        color: isDarkMode ? '#f7fafc' : '#2d3748'
      }}>
        Loading...
      </div>
    );
  }

  const openDayTimeline = (day: number, month: number, year: number) => {
    setSelectedDate({ day, month, year });
    setShowDayModal(true);
  };

  const closeDayModal = () => setShowDayModal(false);

  const goToToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // Chuyển về tháng hiện tại nếu đang ở tháng khác
    if (currentMonth.year !== year || currentMonth.month !== month) {
      changeMonth(year, month);
    }
    
    setSelectedDate({ day, month, year });
  };

  const prefillAddTask = (startTime: number) => {
    setPrefillStartTime(startTime);
    setShowAddModal(true);
  };

  const saveTask = async (task: any) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.dateKey, editingTask.index, task);
        setEditingTask(null);
      } else if (selectedDate) {
        const dateKey = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
        await addTask(dateKey, task);
      }
      setShowAddModal(false);
      setPrefillStartTime(null);
    } catch (error) {
      // Error đã được handle trong useTasks
    }
  };

  const openDetailModal = (index: number, dateKey: string) => {
    setCurrentTaskIndex(index);
    setCurrentDateKey(dateKey);
    setShowDetailModal(true);
  };

  const editTask = () => {
    if (currentTaskIndex !== null && currentDateKey) {
      const task = tasks[currentDateKey][currentTaskIndex];
      setEditingTask({ task, dateKey: currentDateKey, index: currentTaskIndex });
      setShowDetailModal(false);
      setShowAddModal(true);
    }
  };

  const toggleComplete = async () => {
    if (currentTaskIndex !== null && currentDateKey) {
      try {
        await toggleTaskComplete(currentDateKey, currentTaskIndex);
        setShowDetailModal(false);
      } catch (error) {
        // Error đã được handle
      }
    }
  };

  const deleteTaskHandler = async () => {
    if (currentTaskIndex !== null && currentDateKey) {
      try {
        await deleteTask(currentDateKey, currentTaskIndex);
        setShowDetailModal(false);
      } catch (error) {
        // Error đã được handle
      }
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div style={{
        fontFamily: "'Inter', sans-serif",
        background: isDarkMode
          ? "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
          : "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
        color: isDarkMode ? "#f1f5f9" : "#1e293b",
        minHeight: "100vh",
        paddingTop: "80px",
      }}>
        <Header />

        <div style={{ 
          flex: 1,
          maxWidth: "1400px", 
          width: "100%",
          margin: "0 auto", 
          padding: "70px 1rem 1rem 1rem",
          overflow: "auto"
        }}>
          {tasksLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', fontSize: '1.2rem' }}>
              Đang tải tasks...
            </div>
          ) : (
            <CalendarView 
              tasks={tasks} 
              onDayClick={openDayTimeline}
              currentMonth={currentMonth}
              onMonthChange={changeMonth}
            />
          )}
        </div>

        {/* Các modal */}
        {showDayModal && selectedDate && (
          <DayTimelineModal
            date={selectedDate}
            tasks={tasks[`${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`] || []}
            onClose={closeDayModal}
            onAddTask={prefillAddTask}
            onTaskClick={openDetailModal}
            onGoToToday={goToToday}
          />
        )}

        {showAddModal && (
          <AddTaskModal
            onClose={() => {
              setShowAddModal(false);
              setPrefillStartTime(null);
              setEditingTask(null);
            }}
            onSave={saveTask}
            initialStartTime={prefillStartTime || undefined}
            task={editingTask?.task}
          />
        )}

        {showDetailModal && currentTaskIndex !== null && currentDateKey && (
          <TaskDetailModal
            task={tasks[currentDateKey][currentTaskIndex]}
            onClose={() => setShowDetailModal(false)}
            onToggleComplete={toggleComplete}
            onDelete={deleteTaskHandler}
            onEdit={editTask}
          />
        )}
      </div>
    </>
  );
}