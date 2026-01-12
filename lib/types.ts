// lib/types.ts

export interface Task {
  _id?: string; // MongoDB ID
  name: string;
  start: number; // Giờ bắt đầu (0-23.5)
  duration: number; // Thời lượng (0.5-24)
  priority: 'low' | 'medium' | 'high';
  note?: string;
  completed: boolean;
}

export interface Tasks {
  [dateKey: string]: Task[]; // dateKey format: "YYYY-MM-DD"
}

export interface User {
  _id: string;
  email: string;
  name: string;
}