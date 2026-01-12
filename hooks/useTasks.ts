// hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { Task, Tasks } from '../lib/types';
import { taskApi } from '../lib/api';
import { toast } from 'react-hot-toast';

// Helper: Convert API task to frontend format
const convertApiTask = (apiTask: any): Task & { _id: string } => ({
  _id: apiTask._id,
  name: apiTask.name,
  start: apiTask.start,
  duration: apiTask.duration,
  priority: apiTask.priority,
  note: apiTask.note || '',
  completed: apiTask.completed,
});

// Helper: Group tasks by date
const groupTasksByDate = (apiTasks: any[]): Tasks => {
  const grouped: Tasks = {};
  apiTasks.forEach((task) => {
    if (!grouped[task.date]) {
      grouped[task.date] = [];
    }
    grouped[task.date].push(convertApiTask(task));
  });
  return grouped;
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Tasks>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  // Fetch tasks by month
  const fetchTasksByMonth = useCallback(async (year: number, month: number) => {
    try {
      setLoading(true);
      const data = await taskApi.getByMonth(year, month);
      
      // Convert từ dạng { "2025-01-01": [task1, task2], ... }
      const formattedTasks: Tasks = {};
      Object.keys(data).forEach((dateKey) => {
        formattedTasks[dateKey] = data[dateKey].map(convertApiTask);
      });
      
      setTasks(formattedTasks);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error(error.response?.data?.message || 'Không thể tải tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks khi component mount hoặc khi đổi tháng
  useEffect(() => {
    fetchTasksByMonth(currentMonth.year, currentMonth.month);
  }, [currentMonth, fetchTasksByMonth]);

  // Add task
  const addTask = async (dateKey: string, task: Omit<Task, '_id'>) => {
    try {
      const newTask = await taskApi.create({
        name: task.name,
        date: dateKey,
        start: task.start,
        duration: task.duration,
        priority: task.priority,
        note: task.note,
      });

      // Update local state
      setTasks((prev) => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), convertApiTask(newTask)],
      }));

      toast.success('Thêm task thành công!');
      return newTask;
    } catch (error: any) {
      console.error('Error adding task:', error);
      const message = error.response?.data?.message || 'Không thể thêm task';
      toast.error(message);
      throw error;
    }
  };

  // Update task
  const updateTask = async (
    dateKey: string,
    index: number,
    updates: Partial<Task> & { date?: string }
  ) => {
    try {
      const taskToUpdate = tasks[dateKey][index] as Task & { _id: string };
      const updatedTask = await taskApi.update(taskToUpdate._id, updates);

      // Update local state
      setTasks((prev) => {
        const newTasks = { ...prev };
        const oldDateTasks = [...(newTasks[dateKey] || [])];
        
        // Nếu đổi ngày, cần di chuyển task
        if (updates.date && updates.date !== dateKey) {
          // Xóa khỏi ngày cũ
          oldDateTasks.splice(index, 1);
          if (oldDateTasks.length === 0) {
            delete newTasks[dateKey];
          } else {
            newTasks[dateKey] = oldDateTasks;
          }
          
          // Thêm vào ngày mới
          newTasks[updates.date] = [
            ...(newTasks[updates.date] || []),
            convertApiTask(updatedTask),
          ];
        } else {
          // Cập nhật tại chỗ
          oldDateTasks[index] = convertApiTask(updatedTask);
          newTasks[dateKey] = oldDateTasks;
        }
        
        return newTasks;
      });

      toast.success('Cập nhật task thành công!');
      return updatedTask;
    } catch (error: any) {
      console.error('Error updating task:', error);
      const message = error.response?.data?.message || 'Không thể cập nhật task';
      toast.error(message);
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (dateKey: string, index: number) => {
    try {
      const taskToDelete = tasks[dateKey][index] as Task & { _id: string };
      await taskApi.delete(taskToDelete._id);

      // Update local state
      setTasks((prev) => {
        const newTasks = { ...prev };
        const dateTasks = [...newTasks[dateKey]];
        dateTasks.splice(index, 1);
        
        if (dateTasks.length === 0) {
          delete newTasks[dateKey];
        } else {
          newTasks[dateKey] = dateTasks;
        }
        
        return newTasks;
      });

      toast.success('Xóa task thành công!');
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Không thể xóa task');
      throw error;
    }
  };

  // Toggle complete
  const toggleComplete = async (dateKey: string, index: number) => {
    try {
      const taskToToggle = tasks[dateKey][index] as Task & { _id: string };
      const updatedTask = await taskApi.toggleComplete(taskToToggle._id);

      // Update local state
      setTasks((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey].map((t, i) =>
          i === index ? convertApiTask(updatedTask) : t
        ),
      }));

      return updatedTask;
    } catch (error: any) {
      console.error('Error toggling task:', error);
      toast.error('Không thể cập nhật trạng thái');
      throw error;
    }
  };

  // Change month (for calendar navigation)
  const changeMonth = (year: number, month: number) => {
    setCurrentMonth({ year, month });
  };

  return {
    tasks,
    loading,
    currentMonth,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    changeMonth,
    refresh: () => fetchTasksByMonth(currentMonth.year, currentMonth.month),
  };
};