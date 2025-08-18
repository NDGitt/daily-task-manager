'use client';

import { useState, useEffect } from 'react';
import { Undo2 } from 'lucide-react';
import type { Task } from '@/types';

interface DeletedTaskInfo {
  task: Task;
  originalIndex: number;
  deletedAt: number;
}

interface MultiTaskUndoNotificationProps {
  deletedTasks: DeletedTaskInfo[];
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number; // Duration in milliseconds
}

export function MultiTaskUndoNotification({ 
  deletedTasks, 
  onUndo, 
  onDismiss, 
  duration = 10000 // 10 seconds for multi-task undo
}: MultiTaskUndoNotificationProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (deletedTasks.length > 0) {
      setIsVisible(true);
      setTimeLeft(duration);

      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            // Auto-dismiss when time runs out
            setIsVisible(false);
            setTimeout(onDismiss, 300); // Wait for fade out animation
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setIsVisible(false);
    }
  }, [deletedTasks, duration, onDismiss]);

  if (deletedTasks.length === 0) return null;

  const progressPercentage = (timeLeft / duration) * 100;
  const taskCount = deletedTasks.length;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
      }`}
    >
      <button
        onClick={onUndo}
        className="relative group bg-gray-900 hover:bg-gray-800 text-white rounded-full p-3 shadow-xl border border-gray-700 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation"
        style={{ opacity: progressPercentage / 100 }}
        title={`Undo ${taskCount} deleted task${taskCount > 1 ? 's' : ''}`}
      >
        {/* Undo icon */}
        <Undo2 size={18} className="opacity-80" />
        
        {/* Task count badge */}
        {taskCount > 1 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {taskCount > 9 ? '9+' : taskCount}
          </div>
        )}
      </button>
    </div>
  );
}
