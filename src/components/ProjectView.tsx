'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, FolderOpen, Calendar, MoreHorizontal, Trash2 } from 'lucide-react';
import { TaskList } from './TaskList';
import { formatDate } from '@/lib/utils';
import type { Project, Task, UserSettings } from '@/types';

interface ProjectViewProps {
  project: Project;
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onBackToProjects: () => void;
  onBackToDaily: () => void;
  onDeleteProject?: (projectId: string) => void;
  userSettings?: UserSettings;
}

export function ProjectView({
  project,
  tasks,
  onTasksChange,
  onBackToProjects,
  onBackToDaily,
  onDeleteProject,
  userSettings
}: ProjectViewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  const handleDeleteProject = () => {
    if (tasks.length > 0) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${project.title}"? This will permanently delete all ${tasks.length} tasks in this project.`
      );
      if (!confirmed) return;
    }
    
    onDeleteProject?.(project.id);
    setShowMenu(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToProjects}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <FolderOpen size={24} className="text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Created {formatDate(project.date_created)}</span>
                </div>
                {tasks.length > 0 && (
                  <span>
                    {completedTasks.length} of {tasks.length} completed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Project Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
              <button
                onClick={handleDeleteProject}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
        userSettings={userSettings}
      />

      {/* Completion Message */}
      {tasks.length > 0 && completedTasks.length === tasks.length && (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Project Complete!</h3>
          <p className="text-gray-600">All tasks in this project are finished.</p>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
        <button
          onClick={onBackToProjects}
          className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          <FolderOpen size={16} />
          All Projects
        </button>
        <button
          onClick={onBackToDaily}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Calendar size={16} />
          Daily View
        </button>
      </div>
    </div>
  );
}
