'use client';

import { useState, useEffect } from 'react';
import { Undo2, X } from 'lucide-react';
import type { Task } from '@/types';

interface UndoNotificationProps {
  deletedTask: Task | null;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number; // Duration in milliseconds
}

export function UndoNotification({ 
  deletedTask, 
  onUndo, 
  onDismiss, 
  duration = 5000 
}: UndoNotificationProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (deletedTask) {
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
  }, [deletedTask, duration, onDismiss]);

  if (!deletedTask) return null;

  const progressPercentage = (timeLeft / duration) * 100;

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
              <p className="text-sm font-medium text-white mb-1">
                Task deleted
              </p>
              <p className="text-sm text-gray-300 truncate">
                &quot;{deletedTask.content}&quot;
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <Undo2 size={14} />
                Undo
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

