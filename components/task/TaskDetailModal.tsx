import React from 'react';
import { Task } from '../../lib/types';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onToggleComplete, onDelete, onEdit }) => {
  const timeToString = (time: number) => {
    const h = Math.floor(time);
    const m = time - h === 0.5 ? '30' : '00';
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Thấp';
    }
  };

  return (
    <div className="modal" style={{
      display: 'flex',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div className="modal-content" style={{
        background: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
      }}>
        <div className="modal-header" style={{
          padding: '2rem 2rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #eee'
        }}>
          <h3>Chi tiết công việc</h3>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '0 2rem 2rem' }}>
          <p style={{ margin: '1rem 0' }}>
            <strong>Thời gian:</strong> {timeToString(task.start)} - {timeToString(task.start + task.duration)}
          </p>
          <p style={{ margin: '1rem 0' }}>
            <strong>Tên:</strong> {task.name}
          </p>
          <p style={{ margin: '1rem 0' }}>
            <strong>Ghi chú:</strong> {task.note || 'Không có'}
          </p>
          <p style={{ margin: '1rem 0' }}>
            <strong>Ưu tiên:</strong> {getPriorityText(task.priority)}
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            {onEdit && (
              <button
                className="btn"
                onClick={onEdit}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '50px',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  fontWeight: 500,
                  transition: 'all 0.35s ease',
                  flex: 1
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
              >
                Sửa
              </button>
            )}
            <button
              className="btn"
              onClick={onToggleComplete}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '50px',
                background: '#2D3748',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                fontWeight: 500,
                transition: 'all 0.35s ease',
                flex: 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2D3748'}
            >
              {task.completed ? 'Bỏ hoàn thành' : 'Đánh dấu hoàn thành'}
            </button>
            <button
              className="btn"
              onClick={() => {
                if (confirm('Xóa việc này?')) {
                  onDelete();
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '50px',
                background: '#e74c3c',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                fontWeight: 500,
                transition: 'all 0.35s ease',
                flex: 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#c0392b'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#e74c3c'}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
