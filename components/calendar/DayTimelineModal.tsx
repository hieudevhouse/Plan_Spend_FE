"use client";

import React from 'react';
import { Task } from '../../lib/types';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface DayTimelineModalProps {
  date: { day: number; month: number; year: number };
  tasks: Task[];
  onClose: () => void;
  onAddTask: (startTime: number) => void;
  onTaskClick: (index: number, dateKey: string) => void;
  onGoToToday?: () => void;
}

const DayTimelineModal: React.FC<DayTimelineModalProps> = ({
  date,
  tasks,
  onClose,
  onAddTask,
  onTaskClick,
  onGoToToday,
}) => {
  const { isDarkMode } = useDarkMode();

  // Tính toán thống kê
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const incompleteTasks = totalTasks - completedTasks;

  const timeToString = (time: number) => {
    const h = Math.floor(time);
    const m = time - h === 0.5 ? '30' : '00';
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  const getDayName = (day: number, month: number, year: number) => {
    const dateObj = new Date(year, month - 1, day);
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return dayNames[dateObj.getDay()];
  };

  const isValidStartTime = (startTime: number, dayTasks: Task[]) => {
    for (let task of dayTasks) {
      if (startTime >= task.start && startTime < task.start + task.duration) return false;
    }
    return true;
  };

  const renderTimeline = () => {
    const slots = [];
    for (let slot = 0; slot < 48; slot++) {
      const hours = Math.floor(slot / 2);
      const minutes = slot % 2 === 0 ? 0 : 0.5;
      const timeStr = timeToString(hours + minutes);
      const slotTime = hours + minutes;

      const row = (
        <div
          key={slot}
          className="half-hour-row"
          style={{
            display: 'flex',
            minHeight: '50px',
            borderBottom: `1px dashed ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
            alignItems: 'stretch',
          }}
        >
          {/* Time label */}
          <div
            style={{
              width: '100px',
              flexShrink: 0,
              fontWeight: 500,
              color: isDarkMode ? '#cbd5e1' : '#4a5568',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '1rem',
              fontSize: '0.9rem',
            }}
          >
            {timeStr}
          </div>

          {/* Content area */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {(() => {
              const coveringTask = tasks.find((task) => {
                const taskEnd = task.start + task.duration;
                return slotTime >= task.start && slotTime < taskEnd;
              });

              if (coveringTask) {
                // Chỉ hiển thị block ở slot bắt đầu
                if (Math.abs(coveringTask.start - slotTime) < 0.01) {
                  const startStr = timeToString(coveringTask.start);
                  const endStr = timeToString(coveringTask.start + coveringTask.duration);

                  // Màu nền và viền theo priority + dark mode
                  const priorityColors = {
                    high: isDarkMode ? '#7f1d1d' : '#E76F51',
                    medium: isDarkMode ? '#9a3412' : '#F4A261',
                    low: isDarkMode ? '#1e4d5a' : '#A8DADC',
                  };

                  const bgColor = isDarkMode ? '#1e293b' : '#ffffff';
                  const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';

                  return (
                    <div
                      className={`time-block-modal ${coveringTask.priority} ${coveringTask.completed ? 'completed' : ''}`}
                      style={{
                        backgroundColor: coveringTask.completed
                          ? isDarkMode
                            ? '#334155'
                            : '#e2e8f0'
                          : bgColor,
                        color: textColor,
                        borderRadius: '12px',
                        padding: '0.8rem 1rem',
                        width: '100%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        borderLeft: `6px solid ${priorityColors[coveringTask.priority as keyof typeof priorityColors]}`,
                        opacity: coveringTask.completed ? 0.65 : 1,
                        transition: 'all 0.3s ease',
                      }}
                      onClick={() =>
                        onTaskClick(
                          tasks.indexOf(coveringTask),
                          `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
                        )
                      }
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <strong>{startStr} - {endStr}</strong>
                          <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.1rem' }}>
                            {coveringTask.name}
                          </h4>
                          {coveringTask.note && (
                            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
                              {coveringTask.note}
                            </p>
                          )}
                        </div>
                        {coveringTask.completed && (
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.8rem',
                              color: 'white',
                              fontWeight: 'bold',
                              flexShrink: 0,
                            }}
                          >
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              } else if (isValidStartTime(slotTime, tasks)) {
                // Empty slot - có thể thêm task
                return (
                  <div
                    className="empty-slot"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: `2px dashed ${isDarkMode ? '#64748b' : '#cbd5e1'}`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDarkMode ? '#94a3b8' : '#64748b',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => onAddTask(slotTime)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = isDarkMode ? '#e2e8f0' : '#3b82f6';
                      e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.08)' : '#eff6ff';
                      e.currentTarget.style.color = isDarkMode ? '#f1f5f9' : '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isDarkMode ? '#64748b' : '#cbd5e1';
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#64748b';
                    }}
                  >
                    Click để thêm
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      );
      slots.push(row);
    }
    return slots;
  };

  return (
    <div
      className="modal"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem',
      }}
    >
      <style jsx>{`
        .modal-content::-webkit-scrollbar {
          display: none;
        }
        .modal-content {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div
        className="modal-content"
        style={{
          background: isDarkMode ? '#1e293b' : '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: isDarkMode
            ? '0 20px 60px rgba(0,0,0,0.5)'
            : '0 20px 60px rgba(0,0,0,0.15)',
          border: `2px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '2rem 2rem 1rem',
            borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '1.6rem',
                fontWeight: 600,
                color: isDarkMode ? '#f1f5f9' : '#1e293b',
              }}
            >
              {`${getDayName(date.day, date.month, date.year)} - ${date.day}/${date.month}/${date.year}`}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {onGoToToday && (
                <button
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
                  onClick={onGoToToday}
                >
                  ➣ GoToToday 
                </button>
              )}

              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  color: isDarkMode ? '#cbd5e1' : '#64748b',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={onClose}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                ×
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '2rem',
              fontSize: '0.95rem',
              color: isDarkMode ? '#cbd5e1' : '#64748b',
            }}
          >
            <span>
              <strong>Tổng:</strong> {totalTasks}
            </span>
            <span style={{ color: '#10B981' }}>
              <strong>Hoàn thành:</strong> {completedTasks}
            </span>
            <span style={{ color: '#F59E0B' }}>
              <strong>Chưa hoàn thành:</strong> {incompleteTasks}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ padding: '1.5rem 2rem 2rem' }}>{renderTimeline()}</div>
      </div>
    </div>
  );
};

export default DayTimelineModal;