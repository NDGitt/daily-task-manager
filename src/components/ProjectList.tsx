'use client';

import { useState } from 'react';
import { Plus, FolderOpen, Calendar, ArrowLeft, Archive, ArchiveX } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectListProps {
  projects: Project[];
  archivedProjects: Project[];
  showArchived: boolean;
  onCreateProject: (title: string) => void;
  onSelectProject: (project: Project) => void;
  onArchiveProject: (projectId: string) => void;
  onUnarchiveProject: (projectId: string) => void;
  onToggleArchived: () => void;
  onBackToDaily: () => void;
}

export function ProjectList({ 
  projects, 
  archivedProjects,
  showArchived,
  onCreateProject, 
  onSelectProject,
  onArchiveProject,
  onUnarchiveProject,
  onToggleArchived,
  onBackToDaily 
}: ProjectListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const handleCreateProject = () => {
    if (newProjectTitle.trim()) {
      onCreateProject(newProjectTitle.trim());
      setNewProjectTitle('');
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateProject();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewProjectTitle('');
    }
  };

  const currentProjects = showArchived ? archivedProjects : projects;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDaily}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Daily View"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {showArchived ? 'Archived Projects' : 'Projects'}
            </h1>
            <p className="text-gray-600 mt-1">
              {currentProjects.length} project{currentProjects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {/* Archive Toggle */}
        <button
          onClick={onToggleArchived}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          {showArchived ? (
            <>
              <FolderOpen size={16} />
              Active Projects
            </>
          ) : (
            <>
              <Archive size={16} />
              Archived ({archivedProjects.length})
            </>
          )}
        </button>
      </div>

      {/* Create Project - only show for active projects */}
      {!showArchived && isCreating ? (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
          <input
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newProjectTitle.trim()) {
                setIsCreating(false);
              }
            }}
            placeholder="Project name..."
            className="w-full text-lg font-medium bg-transparent border-none focus:outline-none placeholder-gray-400"
            autoFocus
          />
          <div className="flex gap-3 mt-3 text-sm">
            <button
              onClick={handleCreateProject}
              disabled={!newProjectTitle.trim()}
              className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewProjectTitle('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : !showArchived && (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
        >
          <div className="flex items-center justify-center gap-2 text-gray-500 group-hover:text-blue-600">
            <Plus size={20} />
            <span className="font-medium">Create New Project</span>
          </div>
        </button>
      )}

      {/* Projects Grid */}
      {currentProjects.length === 0 && !isCreating ? (
        <div className="text-center py-12">
          {showArchived ? (
            <>
              <Archive className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No archived projects</h3>
              <p className="text-gray-600 mb-4">
                Completed and inactive projects will appear here automatically.
              </p>
            </>
          ) : (
            <>
              <FolderOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first project to organize tasks by theme, goal, or area of focus.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Create Project
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {currentProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div 
                  className="flex items-center gap-2 flex-1 cursor-pointer"
                  onClick={() => onSelectProject(project)}
                >
                  <FolderOpen size={20} className={showArchived ? "text-gray-500" : "text-blue-600"} />
                  <h3 className={`font-medium group-hover:text-blue-700 ${showArchived ? 'text-gray-700' : 'text-gray-900'}`}>
                    {project.title}
                  </h3>
                </div>
                
                {/* Archive/Unarchive Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showArchived ? onUnarchiveProject(project.id) : onArchiveProject(project.id);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={showArchived ? "Unarchive project" : "Archive project"}
                >
                  {showArchived ? <ArchiveX size={16} /> : <Archive size={16} />}
                </button>
              </div>
              
              <div 
                className="space-y-2 text-sm text-gray-600 cursor-pointer"
                onClick={() => onSelectProject(project)}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Created {formatDate(project.date_created)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>{project.task_count} task{project.task_count !== 1 ? 's' : ''}</span>
                  <span className="text-xs text-gray-500">
                    {project.last_accessed === project.date_created 
                      ? 'Never opened' 
                      : `Last opened ${formatDate(project.last_accessed.split('T')[0])}`
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Return to Daily */}
      <div className="text-center pt-6 border-t border-gray-200">
        <button
          onClick={onBackToDaily}
          className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Daily View
        </button>
      </div>
    </div>
  );
}
