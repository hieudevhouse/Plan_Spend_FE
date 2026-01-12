"use client";

import React, { useState } from 'react';
import { Task } from '../../lib/types';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface AddTaskModalProps {
  onClose: () => void;
  onSave: (task: Task) => void;
  initialStartTime?: number;
  task?: Task;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  onClose,
  onSave,
  initialStartTime,
  task,
}) => {
  const { isDarkMode } = useDarkMode();

  const [startTime, setStartTime] = useState(initialStartTime || task?.start || 9);
  const [duration, setDuration] = useState(task?.duration || 1);
  const [name, setName] = useState(task?.name || '');
  const [note, setNote] = useState(task?.note || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
    task?.priority || 'medium'
  );

  const timeToString = (time: number) => {
    const h = Math.floor(time);
    const m = time - h === 0.5 ? '30' : '00';
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên việc!');
      return;
    }
    const taskData: Task = {
      start: startTime,
      duration,
      name: name.trim(),
      note: note.trim(),
      priority,
      completed: task?.completed || false,
    };
    onSave(taskData);
  };

  const startTimeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 0.5]) {
      const time = h + m;
      startTimeOptions.push(
        <option key={time} value={time}>
          {timeToString(time)}
        </option>
      );
    }
  }

  const durationOptions = [0.5, 1, 1.5, 2, 3, 4, 5, 6].map((d) => (
    <option key={d} value={d}>
      {d === 0.5
        ? '30p'
        : d % 1 === 0
        ? `${d}h`
        : `${Math.floor(d)}h30`}
    </option>
  ));

  const bgColor = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
  const labelColor = isDarkMode ? '#cbd5e1' : '#4a5568';
  const inputBg = isDarkMode ? '#334155' : '#f8fafc';
  const inputBorder = isDarkMode ? '#475569' : '#cbd5e1';

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
        zIndex: 3000,
        padding: '0.5rem',
      }}
    >
      <div
        className="modal-content"
        style={{
          background: bgColor,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDarkMode
            ? '0 20px 60px rgba(0,0,0,0.5)'
            : '0 20px 60px rgba(0,0,0,0.12)',
          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        }}
      >
        {/* Header - Fixed */}
        <div
          style={{
            padding: '1rem 1.2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
            flexShrink: 0,
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: textColor }}>
            {task ? 'Sửa Task' : 'Thêm Task'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: isDarkMode ? '#cbd5e1' : '#64748b',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f1f5f9')
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            ×
          </button>
        </div>

        {/* Body - Scrollable */}
        <div style={{ 
          padding: '1rem 1.2rem', 
          overflowY: 'auto',
          flex: 1,
        }}>
          {/* Thời gian bắt đầu */}
          <label style={{ display: 'block', marginBottom: '0.4rem', color: labelColor, fontWeight: 500, fontSize: '0.85rem' }}>
            Thời gian bắt đầu
          </label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(parseFloat(e.target.value))}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '8px',
              border: `1px solid ${inputBorder}`,
              backgroundColor: inputBg,
              color: textColor,
              fontSize: '0.9rem',
              marginBottom: '1rem',
            }}
          >
            {startTimeOptions}
          </select>

          {/* Thời lượng */}
          <label style={{ display: 'block', marginBottom: '0.4rem', color: labelColor, fontWeight: 500, fontSize: '0.85rem' }}>
            Thời lượng
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '8px',
              border: `1px solid ${inputBorder}`,
              backgroundColor: inputBg,
              color: textColor,
              fontSize: '0.9rem',
              marginBottom: '1rem',
            }}
          >
            {durationOptions}
          </select>

          {/* Tên việc */}
          <label style={{ display: 'block', marginBottom: '0.4rem', color: labelColor, fontWeight: 500, fontSize: '0.85rem' }}>
            Tên việc
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tập gym, Học tiếng Anh..."
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '8px',
              border: `1px solid ${inputBorder}`,
              backgroundColor: inputBg,
              color: textColor,
              fontSize: '0.9rem',
              marginBottom: '1rem',
            }}
          />

          {/* Ghi chú */}
          <label style={{ display: 'block', marginBottom: '0.4rem', color: labelColor, fontWeight: 500, fontSize: '0.85rem' }}>
            Ghi chú (tùy chọn)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Chi tiết công việc..."
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '8px',
              border: `1px solid ${inputBorder}`,
              backgroundColor: inputBg,
              color: textColor,
              fontSize: '0.9rem',
              resize: 'vertical',
              marginBottom: '1rem',
            }}
          />

          {/* Ưu tiên */}
          <label style={{ display: 'block', marginBottom: '0.4rem', color: labelColor, fontWeight: 500, fontSize: '0.85rem' }}>
            Độ ưu tiên
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '8px',
              border: `1px solid ${inputBorder}`,
              backgroundColor: inputBg,
              color: textColor,
              fontSize: '0.9rem',
            }}
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
          </select>
        </div>

        {/* Footer - Fixed */}
        <div style={{ 
          padding: '1rem 1.2rem', 
          borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
          flexShrink: 0,
        }}>
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '0.7rem',
              border: 'none',
              borderRadius: '8px',
              background: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#2563eb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#3b82f6')}
          >
            {task ? 'Cập nhật' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;