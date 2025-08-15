'use client';

import { useState, useEffect } from 'react';
import { Calendar, FolderOpen, Settings, AlertCircle } from 'lucide-react';
import { TaskList } from './TaskList';
import { ManualCarryOver } from './ManualCarryOver';
import { cn, formatDate, getTodayString } from '@/lib/utils';
import type { Task, UserSettings } from '@/types';

interface DailyViewProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onDeleteTask: (task: Task) => void;
  userSettings: UserSettings;
  userId: string;
  onShowProjects: () => void;
  onShowSettings: () => void;
  onShowPreviousDays: () => void;
}

export function DailyView({
  tasks,
  onTasksChange,
  onDeleteTask,
  userSettings,
  userId,
  onShowProjects,
  onShowSettings,
  onShowPreviousDays
}: DailyViewProps) {
  const today = getTodayString();
  const todayFormatted = formatDate(today);
  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);

  // Check for carry-over prompts
  const carryOverTasks = tasks.filter(task => task.carry_over_count >= 2);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{todayFormatted}</h1>
          {tasks.length > 0 && (
            <p className="text-gray-600 mt-1">
              {completedTasks.length} of {tasks.length} tasks completed
            </p>
          )}
        </div>
        
        {/* Hidden controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onShowPreviousDays}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Previous days"
          >
            <Calendar size={20} />
          </button>
          <button
            onClick={onShowProjects}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Projects"
          >
            <FolderOpen size={20} />
          </button>
          <button
            onClick={onShowSettings}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>



      {/* Carry-over Warnings */}
      {carryOverTasks.length > 0 && userSettings.smart_suggestions_enabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Tasks carried over multiple days</h3>
              <p className="text-blue-800 text-sm mt-1">
                {carryOverTasks.length} task{carryOverTasks.length > 1 ? 's have' : ' has'} been carried over for 2+ days. 
                Consider breaking them down, postponing, or archiving them.
              </p>
              <div className="space-y-2 mt-3">
                {carryOverTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="text-sm text-blue-800">
                    • "{task.content}" ({task.carry_over_count} times)
                  </div>
                ))}
                {carryOverTasks.length > 3 && (
                  <div className="text-sm text-blue-700">
                    ...and {carryOverTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(completedTasks.length / tasks.length) * 100}%`
            }}
          />
        </div>
      )}

      {/* Manual Carry Over */}
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <ManualCarryOver
          userId={userId}
          onTasksCarriedOver={(carriedTasks) => {
            // Add carried tasks to current tasks
            const updatedTasks = [...tasks, ...carriedTasks];
            onTasksChange(updatedTasks);
          }}
        />
      </div>

      {/* Task List */}
              <TaskList
          tasks={tasks}
          onTasksChange={onTasksChange}
          onDeleteTask={onDeleteTask}
          userSettings={userSettings}
        />



      {/* Completion Message */}
      {tasks.length > 0 && completedTasks.length === tasks.length && (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">All done for today!</h3>
          <p className="text-gray-600">Great job completing all your tasks.</p>
        </div>
      )}
    </div>
  );
}
