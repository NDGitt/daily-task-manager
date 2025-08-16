'use client';

import React, { useState } from 'react';
import { Calendar, FolderOpen, Settings, AlertCircle, Menu, X, ArrowLeft, HelpCircle, User, LogOut } from 'lucide-react';
import { TaskList } from './TaskList';
import { ManualCarryOver } from './ManualCarryOver';
import { getTodayString } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
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
  onShowHelp: () => void;
  onShowAccount: () => void;
  onSignOut: () => void;
}

export function DailyView({
  tasks,
  onTasksChange,
  onDeleteTask,
  userSettings,
  userId,
  onShowProjects,
  onShowSettings,
  onShowPreviousDays,
  onShowHelp,
  onShowAccount,
  onSignOut
}: DailyViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const today = new Date();
  const todayFormatted = today.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric'
  });
  const completedTasks = tasks.filter(task => task.completed);

  // Check for carry-over prompts
  const carryOverTasks = tasks.filter(task => task.carry_over_count >= 2);

  const handleCarryOverComplete = (carriedTasks: Task[]) => {
    const updatedTasks = [...tasks, ...carriedTasks];
    onTasksChange(updatedTasks);
    setIsSidebarOpen(false); // Close sidebar after carry over
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onSignOut();
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            {/* Carry Over Tasks */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
              <ManualCarryOver
                userId={userId}
                onTasksCarriedOver={handleCarryOverComplete}
              />
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Navigation</h3>
              
              <button
                onClick={() => {
                  onShowPreviousDays();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Calendar size={20} />
                <span>Previous Days</span>
              </button>

              <button
                onClick={() => {
                  onShowProjects();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FolderOpen size={20} />
                <span>Projects</span>
              </button>

              <button
                onClick={() => {
                  onShowSettings();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  onShowHelp();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HelpCircle size={20} />
                <span>Help</span>
              </button>
            </div>

            {/* Account Management */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Account</h3>
              
              <button
                onClick={() => {
                  onShowAccount();
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User size={20} />
                <span>My Account</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Clean Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{todayFormatted}</h1>
            {tasks.length > 0 && (
              <p className="text-gray-600 mt-1">
                {completedTasks.length} of {tasks.length} tasks completed
              </p>
            )}
          </div>
          
          {/* Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Menu"
          >
            <Menu size={24} />
          </button>
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
                    • &quot;{task.content}&quot; ({task.carry_over_count} times)
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
    </>
  );
}
