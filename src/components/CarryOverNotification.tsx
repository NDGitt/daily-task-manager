'use client';

import { useState } from 'react';
import { X, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface CarryOverNotificationProps {
  carriedTasks: Task[];
  highPriorityTasks: Task[];
  archivedTasks?: number;
  onDismiss: () => void;
  onViewTasks?: () => void;
}

export function CarryOverNotification({
  carriedTasks,
  highPriorityTasks,
  archivedTasks = 0,
  onDismiss,
  onViewTasks
}: CarryOverNotificationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (carriedTasks.length === 0) return null;

  const hasHighPriority = highPriorityTasks.length > 0;

  return (
    <div className={cn(
      "mb-4 rounded-lg border-l-4 p-4 shadow-sm transition-all",
      hasHighPriority 
        ? "bg-amber-50 border-amber-400 text-amber-800" 
        : "bg-blue-50 border-blue-400 text-blue-800"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {hasHighPriority ? (
              <AlertTriangle size={20} className="text-amber-600" />
            ) : (
              <ArrowRight size={20} className="text-blue-600" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">
                {carriedTasks.length} task{carriedTasks.length > 1 ? 's' : ''} carried over from yesterday
              </h3>
              {hasHighPriority && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {highPriorityTasks.length} need attention
                </span>
              )}
            </div>
            
            {archivedTasks > 0 && (
              <p className="text-sm mt-1 text-gray-600">
                {archivedTasks} older task{archivedTasks > 1 ? 's were' : ' was'} archived to keep your daily view clean.
              </p>
            )}
            
            {hasHighPriority && (
              <p className="text-sm mt-1">
                Some tasks have been carried over multiple times. Consider breaking them down or completing them today.
              </p>
            )}

            {/* Task preview */}
            <div className="mt-2 space-y-1">
              {carriedTasks.slice(0, isExpanded ? carriedTasks.length : 3).map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={12} className="text-gray-400" />
                  <span className="truncate">{task.content}</span>
                  {task.carry_over_count > 1 && (
                    <span className="text-xs text-amber-600 font-medium">
                      ({task.carry_over_count}x)
                    </span>
                  )}
                </div>
              ))}
              
              {carriedTasks.length > 3 && !isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Show {carriedTasks.length - 3} more...
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={onViewTasks}
                className="text-sm font-medium hover:underline"
              >
                View all tasks
              </button>
              <button
                onClick={onDismiss}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
