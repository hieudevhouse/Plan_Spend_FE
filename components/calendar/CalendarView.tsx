// components/calendar/CalendarView.tsx
import React, { useState, useEffect } from 'react';
import { Tasks, Task } from '../../lib/types';
import { useDarkMode } from '../../contexts/DarkModeContext';

interface CalendarViewProps {
    tasks: Tasks;
    onDayClick: (day: number, month: number, year: number) => void;
    currentMonth: { year: number; month: number };
    onMonthChange: (year: number, month: number) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
    tasks, 
    onDayClick,
    currentMonth,
    onMonthChange
}) => {
    const { isDarkMode } = useDarkMode();

    const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    const prevMonth = () => {
        if (currentMonth.month === 1) {
            onMonthChange(currentMonth.year - 1, 12);
        } else {
            onMonthChange(currentMonth.year, currentMonth.month - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth.month === 12) {
            onMonthChange(currentMonth.year + 1, 1);
        } else {
            onMonthChange(currentMonth.year, currentMonth.month + 1);
        }
    };

    const renderCalendar = () => {
        const firstDay = new Date(currentMonth.year, currentMonth.month - 1, 1).getDay();
        const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
        const startDayOffset = (firstDay + 6) % 7;

        const cells = [];

        // Previous month days
        const prevDays = new Date(currentMonth.year, currentMonth.month - 1, 0).getDate();
        for (let i = startDayOffset - 1; i >= 0; i--) {
            cells.push(createDayCell(prevDays - i, true));
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            cells.push(createDayCell(day, false));
        }

        // Next month days
        let remaining = cells.length % 7;
        if (remaining !== 0) remaining = 7 - remaining;
        for (let day = 1; day <= remaining; day++) {
            cells.push(createDayCell(day, true));
        }

        return cells;
    };

    const createDayCell = (day: number, isOther: boolean) => {
        const dateKey = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTasks = tasks[dateKey] || [];
        const todayDate = new Date();
        const isToday = currentMonth.month === todayDate.getMonth() + 1 && 
                       currentMonth.year === todayDate.getFullYear() && 
                       day === todayDate.getDate();

        return (
            <div
                key={`${isOther ? 'other' : 'current'}-${day}`}
                className={`day-cell ${isToday ? 'today' : ''}`}
                style={{
                    minHeight: '120px',
                    background: isToday ? '#3B82F6' : isOther ? (isDarkMode ? '#4a5568' : '#F0F4F8') : (isDarkMode ? '#4a5568' : '#F0F4F8'),
                    borderRadius: '18px',
                    padding: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.35s ease',
                    boxShadow: isToday ? '0 8px 24px rgba(59, 130, 246, 0.3)' : (isDarkMode ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.05)'),
                    opacity: isOther ? 0.4 : 1,
                    border: isToday ? '3px solid #1D4ED8' : 'none'
                }}
                onClick={() => !isOther && onDayClick(day, currentMonth.month, currentMonth.year)}
                onMouseEnter={(e) => !isOther && (e.currentTarget.style.transform = 'scale(1.05)', e.currentTarget.style.zIndex = '10')}
                onMouseLeave={(e) => !isOther && (e.currentTarget.style.transform = 'scale(1)', e.currentTarget.style.zIndex = 'auto')}
            >
                <div className="day-number" style={{
                    alignSelf: 'flex-end',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: isToday ? 'white' : (isDarkMode ? '#f7fafc' : '#2D3748')
                }}>
                    {day}
                    {isToday && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}>HÔM NAY</span>}
                </div>
                <div className="day-summary" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '0.82rem'
                }}>
                    {dayTasks.slice(0, 3).map((task, index) => (
                        <div key={index} className={`summary-item ${task.completed ? 'completed' : ''}`} style={{
                            background: isToday ? 'rgba(255,255,255,0.9)' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'),
                            borderRadius: '6px',
                            padding: '3px 6px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            opacity: task.completed ? 0.6 : 1,
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: isToday ? '#1e293b' : (isDarkMode ? '#f7fafc' : 'inherit')
                        }}>
                            <span className="dot" style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                flexShrink: 0,
                                background: task.priority === 'high' ? '#E76F51' : task.priority === 'medium' ? '#F4A261' : '#A8DADC'
                            }}></span>
                            {task.name}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="card" style={{
            background: isDarkMode ? '#2d3748' : 'white',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '2.5rem',
            boxShadow: isDarkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.08)',
            border: isDarkMode ? '1px solid #4a5568' : 'none',
            transition: 'all 0.3s ease'
        }}>
            <div className="calendar-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                fontSize: '1.4rem',
                fontWeight: 600
            }}>
                <button onClick={prevMonth} style={{
                    background: '#A7C7E7',
                    color: '#2D3748',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                }}>&lt;</button>
                <div>{`${months[currentMonth.month - 1]} / ${currentMonth.year}`}</div>
                <button onClick={nextMonth} style={{
                    background: '#A7C7E7',
                    color: '#2D3748',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                }}>&gt;</button>
            </div>

            <div className="calendar-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '12px'
            }}>
                {dayNames.map(day => (
                    <div key={day} className="day-name" style={{
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#2D3748',
                        padding: '1rem 0'
                    }}>
                        {day}
                    </div>
                ))}
                {renderCalendar()}
            </div>
        </div>
    );
};

export default CalendarView;