'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, TaskItemProps, UserSettings } from '@/types';

export function TaskItem({ 
  task, 
  onToggleComplete, 
  onUpdateContent, 
  onDelete,
  userSettings
}: TaskItemProps & { userSettings?: UserSettings }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(task.content);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (content.trim() !== task.content) {
      onUpdateContent(task.id, content.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(task.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (content.trim() === '') {
        e.preventDefault();
        onDelete(task.id);
      }
    }
  };

  const showCarryOverWarning = task.carry_over_count >= 2;

  // Apply completion behavior styling
  const getCompletionStyle = () => {
    if (!task.completed) return "";
    
    // Visual styling based on task_completion_visual setting
    const visualStyle = userSettings?.task_completion_visual === 'change_color' 
      ? "bg-green-50 border-green-200" 
      : "opacity-60";
    
    return visualStyle;
  };

  return (
    <div className={cn(
      "group flex items-center gap-3 py-2 px-1 hover:bg-gray-50 transition-colors rounded border border-transparent",
      getCompletionStyle()
    )}>
      {/* Completion checkbox */}
      <button
        onClick={() => onToggleComplete(task.id)}
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center",
          task.completed 
            ? "bg-green-500 border-green-500 text-white" 
            : "border-gray-400 hover:border-green-400"
        )}
      >
        {task.completed && <Check size={12} />}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full px-1 py-0.5 text-gray-900 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500"
            placeholder="Enter task..."
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className={cn(
              "cursor-text py-0.5 px-1 text-gray-900 leading-relaxed",
              task.completed && "line-through text-gray-500"
            )}
          >
            {task.content}
            
            {/* Carry-over warning */}
            {showCarryOverWarning && !task.completed && (
              <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                <AlertCircle size={10} />
                <span>Carried over {task.carry_over_count} times</span>
              </div>
            )}
          </div>
        )}
      </div>



      {/* Delete button */}
      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 ml-2 text-gray-300 hover:text-red-500 transition-colors duration-200"
        title="Delete task"
      >
        <X size={12} />
      </button>
    </div>
  );
}
