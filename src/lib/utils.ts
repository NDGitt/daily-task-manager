import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities - Timezone aware
export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to convert any Date to a timezone-aware date string
export const dateToDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateString === getTodayString()) {
    return 'Today';
  } else if (dateString === getYesterdayString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

export const daysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Task utilities
export const shouldShowCarryOverPrompt = (carryOverCount: number): boolean => {
  return carryOverCount >= 2;
};

export const getTaskOverloadMessage = (taskCount: number, threshold: number): string | null => {
  if (taskCount > threshold) {
    return `You have ${taskCount} tasks today. Consider using the Eisenhower Matrix to prioritize them.`;
  }
  return null;
};

export const generateTaskId = (): string => {
  return crypto.randomUUID();
};

export const generateProjectId = (): string => {
  return crypto.randomUUID();
};

// Reorder utility for drag and drop
export const reorderTasks = <T extends { order: number }>(
  tasks: T[],
  startIndex: number,
  endIndex: number
): T[] => {
  const result = Array.from(tasks);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  // Update order values
  return result.map((task, index) => ({
    ...task,
    order: index
  }));
};

// Local storage utilities
export const getStorageKey = (userId: string, key: string): string => {
  return `dtm_${userId}_${key}`;
};

export const saveToLocalStorage = (key: string, data: unknown): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
    }
  }
  return defaultValue;
};
