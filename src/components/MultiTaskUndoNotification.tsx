'use client';

import { useState, useEffect } from 'react';
import { Undo2, X, Trash2 } from 'lucide-react';
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
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-700">
          <div 
            className="h-full bg-blue-500 transition-all duration-100 ease-linear"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 size={16} className="text-red-400" />
                <p className="text-sm font-medium text-white">
                  {taskCount} task{taskCount > 1 ? 's' : ''} deleted
                </p>
              </div>
              
              {/* Show task previews */}
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {deletedTasks.slice(0, 3).map((deletedTaskInfo, index) => (
                  <p key={deletedTaskInfo.task.id} className="text-sm text-gray-300 truncate">
                    • &quot;{deletedTaskInfo.task.content}&quot;
                  </p>
                ))}
                {taskCount > 3 && (
                  <p className="text-sm text-gray-400">
                    ...and {taskCount - 3} more
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <Undo2 size={14} />
                Undo All
              </button>
              
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onDismiss, 300);
                }}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
