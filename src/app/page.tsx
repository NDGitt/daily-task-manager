'use client';

import { useState, useEffect, useRef } from 'react';
import { DailyView } from '@/components/DailyView';
import { ProjectList } from '@/components/ProjectList';
import { ProjectView } from '@/components/ProjectView';
import { Settings } from '@/components/Settings';
import { PreviousDays } from '@/components/PreviousDays';
import { ArchivedTasks } from '@/components/ArchivedTasks';
import { Auth } from '@/components/Auth';
import { Onboarding } from '@/components/Onboarding';
import { CarryOverNotification } from '@/components/CarryOverNotification';
import { UndoNotification } from '@/components/UndoNotification';
import { useAuth } from '@/hooks/useAuth';
import { DatabaseService } from '@/lib/database';
import { getTodayString } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

import type { Task, Project, UserSettings } from '@/types';

// Default settings for new users
const defaultSettings: UserSettings = {
  task_completion_behavior: 'stay_visible',
  task_completion_visual: 'change_color',
  smart_suggestions_enabled: true,
  task_overload_threshold: 15,

  project_auto_archive_days: 7,
  project_archive_completed: true
};

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [showArchivedProjects, setShowArchivedProjects] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings);
  const [currentView, setCurrentView] = useState<'daily' | 'projects' | 'project' | 'settings' | 'previous' | 'archived'>('daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [carryOverResult, setCarryOverResult] = useState<{
    carriedTasks: Task[];
    highPriorityTasks: Task[];
    archivedTasks: number;
  } | null>(null);

  // Undo functionality
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [deletedTaskIndex, setDeletedTaskIndex] = useState<number>(-1);
  const [showCarryOverNotification, setShowCarryOverNotification] = useState(false);

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);





  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Ensure user profile exists
      await DatabaseService.ensureUserProfile(user.id, user.email || '');
      
      // Check onboarding status
      if (!onboardingChecked) {
        const hasCompletedOnboarding = await DatabaseService.hasCompletedOnboarding(user.id);
        setShowOnboarding(!hasCompletedOnboarding);
        setOnboardingChecked(true);
      }
      
      // Load user settings
      const settings = await DatabaseService.getUserSettings(user.id);
      setUserSettings(settings);
      

      
      // Load today's tasks
      const todayTasks = await DatabaseService.getTasks(user.id);
      setTasks(todayTasks);
      
      // Load projects
      const userProjects = await DatabaseService.getProjects(user.id);
      setProjects(userProjects);
      
      // Load archived projects
      const userArchivedProjects = await DatabaseService.getArchivedProjects(user.id);
      setArchivedProjects(userArchivedProjects);
      
      // Run project auto-archiving in background
      setTimeout(() => {
        DatabaseService.autoArchiveProjects(user.id, settings)
          .then(result => {
            if (result.completedProjects > 0 || result.inactiveProjects > 0) {
              console.log(`Auto-archived ${result.completedProjects} completed and ${result.inactiveProjects} inactive projects`);
              // Refresh project lists
              return Promise.all([
                DatabaseService.getProjects(user.id),
                DatabaseService.getArchivedProjects(user.id)
              ]);
            }
            return [userProjects, userArchivedProjects];
          })
          .then(([activeProjects, archivedProjects]) => {
            setProjects(activeProjects);
            setArchivedProjects(archivedProjects);
          })
          .catch(console.error);
      }, 2000);
      
      // Check for carry-over tasks (in background)
      setTimeout(() => {
        DatabaseService.carryOverIncompleteTasks(user.id)
          .then(result => {
            if (result.totalCarried > 0) {
              console.log(`Carried over ${result.totalCarried} tasks from yesterday, archived ${result.archivedTasks} older tasks`);
              setCarryOverResult({
                carriedTasks: result.carriedTasks,
                highPriorityTasks: result.highPriorityTasks,
                archivedTasks: result.archivedTasks
              });
              setShowCarryOverNotification(true);
              
              // Reload tasks to include carried over ones
              return DatabaseService.getTasks(user.id);
            }
            return todayTasks;
          })
          .then(updatedTasks => setTasks(updatedTasks))
          .catch(console.error);
      }, 1500); // Slightly longer delay to ensure UI is ready
      
    } catch (err: any) {
      console.error('Error loading user data:', err);
      setError(err.message || 'Failed to load data');
      
      // Fallback to localStorage for development
    const savedTasks = localStorage.getItem('daily-tasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed);
        } catch (parseError) {
          console.error('Error parsing localStorage tasks:', parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTasksChange = async (newTasks: Task[]) => {
    console.log('handleTasksChange called with user:', user?.id);
    console.log('New tasks:', newTasks);
    
    if (!user || !user.id) {
      console.log('No user or user.id, falling back to localStorage');
      // Fallback to localStorage if not authenticated
      setTasks(newTasks);
      localStorage.setItem('daily-tasks', JSON.stringify(newTasks));
      return;
    }

    console.log('User authenticated, user.id:', user.id);

    // Optimistically update the UI first
    setTasks(newTasks);
    
    // Find what changed
    const currentTaskIds = new Set(tasks.map(t => t.id));
    const newTaskIds = new Set(newTasks.map(t => t.id));
    
    try {
      // Handle new tasks
      for (const task of newTasks) {
        if (!currentTaskIds.has(task.id)) {
          // New task - create in database
          console.log('Creating new task for user:', user.id);
          console.log('Task content:', task.content);
          
          try {
            const createdTask = await DatabaseService.createTask(user.id, task.content);
            console.log('Task created successfully:', createdTask);
            
            // Update the local task with the database-generated data
            setTasks(prevTasks => 
              prevTasks.map(t => t.id === task.id ? createdTask : t)
            );
          } catch (error) {
            console.error('Failed to create task:', error);
            // Revert the optimistic update
            setTasks(tasks); // Reset to previous state
            alert('Failed to save task. Please try again.');
            return;
          }
        } else {
          // Existing task - check for updates
          const oldTask = tasks.find(t => t.id === task.id);
          if (oldTask && (
            oldTask.content !== task.content ||
            oldTask.completed !== task.completed ||
            oldTask.order !== task.order
          )) {
            const updatedTask = await DatabaseService.updateTask(task.id, {
              content: task.content,
              completed: task.completed,
              order: task.order,
              date_completed: task.completed ? new Date().toISOString() : null
            });
            
            if (!updatedTask) {
              // Task doesn't exist in database, might be a locally created task that failed to save
              console.warn(`Task ${task.id} not found in database, might need to recreate`);
            }
          }
        }
      }
      
      // Handle tasks that are missing from newTasks
      // This could be either deleted tasks or tasks hidden due to completion behavior
      for (const oldTask of tasks) {
        if (!newTaskIds.has(oldTask.id)) {
          // If we're using hide behavior and this task was incomplete, it was likely just completed and hidden
          if (userSettings?.task_completion_behavior === 'hide' && !oldTask.completed) {
            // Task was just completed and hidden, update it in database
            console.log('Task was completed and hidden, updating in database:', oldTask.id);
            await DatabaseService.updateTask(oldTask.id, {
              completed: true,
              date_completed: new Date().toISOString()
            });
          } else {
            // This was an actually deleted task (user used delete button)
            console.log('Task was actually deleted, removing from database:', oldTask.id);
            await DatabaseService.deleteTask(oldTask.id);
          }
        }
      }
      
      // Handle reordering
      if (newTasks.length > 0) {
        await DatabaseService.reorderTasks(user.id, newTasks.map(t => t.id));
      }
      
      // Update local state
      setTasks(newTasks);
      
    } catch (err: any) {
      console.error('Error updating tasks:', err);
      setError(err.message || 'Failed to update tasks');
      
      // Fallback to localStorage
      setTasks(newTasks);
      localStorage.setItem('daily-tasks', JSON.stringify(newTasks));
    }
  };

  const handleShowProjects = () => {
    setCurrentView('projects');
  };

  const handleShowPreviousDays = () => {
    setCurrentView('previous');
    setCurrentProject(null);
    setShowArchivedProjects(false); // Always start with active projects
  };

  const handleShowArchivedTasks = () => {
    setCurrentView('archived');
    setCurrentProject(null);
    setShowArchivedProjects(false);
  };

  const handleDeleteTask = (taskToDelete: Task) => {
    const taskIndex = tasks.findIndex(t => t.id === taskToDelete.id);
    if (taskIndex === -1) return;

    // Store deleted task info for undo
    setDeletedTask(taskToDelete);
    setDeletedTaskIndex(taskIndex);

    // Remove task from UI immediately
    const newTasks = tasks.filter(t => t.id !== taskToDelete.id);
    setTasks(newTasks);

    // Update database (will be handled by handleTasksChange)
    handleTasksChange(newTasks);
  };

  const handleUndoDelete = async () => {
    if (!deletedTask || deletedTaskIndex === -1) return;

    try {
      // Recreate the task in the database with original properties
      const restoredTask = await DatabaseService.createTask(user?.id || '', deletedTask.content);
      
      // Update the restored task to match the original task's state
      let finalTask = restoredTask;
      let newTasks: Task[];
      
      if (deletedTask.completed !== restoredTask.completed || 
          deletedTask.date_completed !== restoredTask.date_completed ||
          deletedTask.eisenhower_quadrant !== restoredTask.eisenhower_quadrant) {
        
        const updatedTask = await DatabaseService.updateTask(restoredTask.id, {
          completed: deletedTask.completed,
          date_completed: deletedTask.date_completed,
          eisenhower_quadrant: deletedTask.eisenhower_quadrant
        });
        
        if (updatedTask) {
          // Use the updated task instead of the basic restored task
          finalTask = updatedTask;
        }
      }
      
      // Insert the task back at its original position
      newTasks = [...tasks];
      newTasks.splice(deletedTaskIndex, 0, finalTask);
      setTasks(newTasks);

      // Update order in database
      if (user?.id) {
        await DatabaseService.reorderTasks(user.id, newTasks.map((t: Task) => t.id));
      }

      console.log('Task restored successfully');
    } catch (error) {
      console.error('Error restoring task:', error);
      alert('Failed to restore task. Please try again.');
    }

    // Clear undo state
    setDeletedTask(null);
    setDeletedTaskIndex(-1);
  };

  const handleDismissUndo = () => {
    setDeletedTask(null);
    setDeletedTaskIndex(-1);
  };

  const handleOnboardingComplete = async () => {
    if (user) {
      try {
        await DatabaseService.completeOnboarding(user.id);
        setShowOnboarding(false);
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        // Still hide onboarding even if database update fails
        setShowOnboarding(false);
      }
    } else {
      setShowOnboarding(false);
    }
  };

  const handleCreateProject = async (title: string) => {
    if (!user) return;
    
    try {
      const newProject = await DatabaseService.createProject(user.id, title);
      setProjects(prev => [newProject, ...prev]);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleSelectProject = async (project: Project) => {
    if (!user) return;
    
    try {
      setCurrentProject(project);
      setCurrentView('project');
      
      // Load project tasks
      const tasks = await DatabaseService.getProjectTasks(user.id, project.id);
      setProjectTasks(tasks);
      
      // Update last accessed time
      await DatabaseService.updateProjectAccess(project.id);
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project. Please try again.');
    }
  };

  const handleProjectTasksChange = async (newTasks: Task[]) => {
    if (!user || !currentProject) return;
    
    // Update local state optimistically
    setProjectTasks(newTasks);
    
    // Handle task changes similar to daily tasks but for projects
    const currentTaskIds = new Set(projectTasks.map(t => t.id));
    
    try {
      // Handle new tasks
      for (const task of newTasks) {
        if (!currentTaskIds.has(task.id)) {
          await DatabaseService.createTask(user.id, task.content, currentProject.id);
        } else {
          // Handle updates
          const oldTask = projectTasks.find(t => t.id === task.id);
          if (oldTask && (
            oldTask.content !== task.content ||
            oldTask.completed !== task.completed ||
            oldTask.order !== task.order
          )) {
            await DatabaseService.updateTask(task.id, {
              content: task.content,
              completed: task.completed,
              order: task.order,
              date_completed: task.completed ? new Date().toISOString() : null
            });
          }
        }
      }
      
      // Handle deleted tasks
      for (const oldTask of projectTasks) {
        if (!newTasks.some(t => t.id === oldTask.id)) {
          await DatabaseService.deleteTask(oldTask.id);
        }
      }
      
      // Update project task count
      const updatedProjects = projects.map(p => 
        p.id === currentProject.id 
          ? { ...p, task_count: newTasks.length }
          : p
      );
      setProjects(updatedProjects);
      
    } catch (error) {
      console.error('Error updating project tasks:', error);
      // Revert optimistic update
      setProjectTasks(projectTasks);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user) return;
    
    try {
      await DatabaseService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setArchivedProjects(prev => prev.filter(p => p.id !== projectId));
      setCurrentView('projects');
      setCurrentProject(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    if (!user) return;
    
    try {
      await DatabaseService.archiveProject(projectId);
      const projectToArchive = projects.find(p => p.id === projectId);
      if (projectToArchive) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setArchivedProjects(prev => [...prev, { ...projectToArchive, archived: true }]);
      }
    } catch (error) {
      console.error('Failed to archive project:', error);
      alert('Failed to archive project. Please try again.');
    }
  };

  const handleUnarchiveProject = async (projectId: string) => {
    if (!user) return;
    
    try {
      await DatabaseService.unarchiveProject(projectId);
      const projectToUnarchive = archivedProjects.find(p => p.id === projectId);
      if (projectToUnarchive) {
        setArchivedProjects(prev => prev.filter(p => p.id !== projectId));
        setProjects(prev => [...prev, { ...projectToUnarchive, archived: false }]);
      }
    } catch (error) {
      console.error('Failed to unarchive project:', error);
      alert('Failed to unarchive project. Please try again.');
    }
  };

  const handleShowSettings = () => {
    setCurrentView('settings');
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    if (!user) return;
    
    try {
      await DatabaseService.updateUserSettings(user.id, newSettings);
      setUserSettings(newSettings);
      
      // If task completion behavior changed, reload today's tasks to show/hide completed tasks
      if (userSettings.task_completion_behavior !== newSettings.task_completion_behavior) {
        console.log('Task completion behavior changed from', userSettings.task_completion_behavior, 'to', newSettings.task_completion_behavior);
        console.log('Reloading today\'s tasks...');
        
        // Debug: Check what's actually in the database
        const todayString = getTodayString();
        console.log('Today\'s date string:', todayString);
        
        // Let's check all tasks for this user (not just today's)
        const { data: allTasks, error: allError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('date_created', { ascending: false });
        
        if (allError) {
          console.error('Error fetching all tasks:', allError);
        } else {
          console.log('All tasks for user:', allTasks);
          console.log('Tasks by date:', allTasks?.reduce((acc, task) => {
            acc[task.date_created] = (acc[task.date_created] || 0) + 1;
            return acc;
          }, {}));
          
          // Show details of today's tasks to debug why getTasks isn't finding them
          const todaysTasks = allTasks?.filter(task => task.date_created === todayString);
          console.log('Today\'s tasks details:', todaysTasks);
          todaysTasks?.forEach(task => {
            console.log('Task details:', {
              id: task.id,
              content: task.content,
              date_created: task.date_created,
              archived: task.archived,
              project_id: task.project_id,
              completed: task.completed
            });
          });
        }
        
        const todayTasks = await DatabaseService.getTasks(user.id);
        console.log('Loaded', todayTasks.length, 'tasks from database for today:', todayTasks);
        
        // Apply the new completion behavior to existing tasks
        let filteredTasks = [...todayTasks];
        
        switch (newSettings.task_completion_behavior) {
          case 'hide':
            // Hide all completed tasks
            filteredTasks = todayTasks.filter(task => !task.completed);
            console.log('Hiding', todayTasks.length - filteredTasks.length, 'completed tasks');
            break;
          case 'move_to_bottom':
            // Move completed tasks to bottom
            const incomplete = todayTasks.filter(task => !task.completed);
            const completed = todayTasks.filter(task => task.completed);
            filteredTasks = [...incomplete, ...completed];
            console.log('Moving', completed.length, 'completed tasks to bottom');
            break;
          case 'stay_visible':
          default:
            // Show all tasks in their current order
            filteredTasks = todayTasks;
            console.log('Showing all', todayTasks.length, 'tasks in current order');
            break;
        }
        
        setTasks(filteredTasks);
        
        // Quick fix: If we found project tasks but no daily tasks, offer to move them
        const todaysProjectTasks = allTasks?.filter(task => task.date_created === todayString);
        if (todayTasks.length === 0 && todaysProjectTasks && todaysProjectTasks.length > 0) {
          console.log('🔧 FOUND YOUR MISSING TASKS!');
          console.log('Your tasks are in a project, but you want them in daily view.');
          console.log('Tasks found:', todaysProjectTasks.map(t => t.content));
          
          // Create a global function to move tasks back
          (window as any).moveTasksToDaily = async () => {
            try {
              const taskIds = todaysProjectTasks.map(t => t.id);
              await DatabaseService.moveTasksToDaily(taskIds);
              console.log('✅ Tasks moved to daily view! Reloading...');
              window.location.reload();
            } catch (error) {
              console.error('❌ Error moving tasks:', error);
            }
          };
          
          console.log('🎯 To move your tasks back to daily view, run: moveTasksToDaily()');
        }
      }
      
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  };



  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">My Diary</div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={loadUserData} />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">⚠️ {error}</div>
          <button
            onClick={loadUserData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
          <div className="mt-4 text-sm text-gray-600">
            The app will work offline with local storage
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className={`min-h-screen transition-colors ${currentView === 'settings' ? '' : 'bg-gray-50 dark:bg-gray-900'}`}>
      <div className={`${currentView === 'settings' ? '' : 'container mx-auto px-4 py-8'}`}>
            {/* Carry-over notification */}
            {showCarryOverNotification && carryOverResult && (
              <CarryOverNotification
                carriedTasks={carryOverResult.carriedTasks}
                highPriorityTasks={carryOverResult.highPriorityTasks}
                archivedTasks={carryOverResult.archivedTasks}
                onDismiss={() => setShowCarryOverNotification(false)}
                onViewTasks={() => setShowCarryOverNotification(false)}
              />
            )}

            {currentView === 'daily' && user && (
                      <DailyView
            tasks={tasks}
            onTasksChange={handleTasksChange}
            onDeleteTask={handleDeleteTask}
            userSettings={userSettings}
                userId={user.id}
            onShowProjects={handleShowProjects}
            onShowSettings={handleShowSettings}
            onShowPreviousDays={handleShowPreviousDays}
          />
        )}
        
        {currentView === 'projects' && (
              <ProjectList
                projects={projects}
                archivedProjects={archivedProjects}
                showArchived={showArchivedProjects}
                onCreateProject={handleCreateProject}
                onSelectProject={handleSelectProject}
                onArchiveProject={handleArchiveProject}
                onUnarchiveProject={handleUnarchiveProject}
                onToggleArchived={() => setShowArchivedProjects(!showArchivedProjects)}
                onBackToDaily={() => setCurrentView('daily')}
              />
            )}

                        {currentView === 'project' && currentProject && (
              <ProjectView
                project={currentProject}
                tasks={projectTasks}
                onTasksChange={handleProjectTasksChange}
                onBackToProjects={() => setCurrentView('projects')}
                onBackToDaily={() => setCurrentView('daily')}
                onDeleteProject={handleDeleteProject}
                userSettings={userSettings}
              />
        )}

        {currentView === 'settings' && (
                      <Settings
          settings={userSettings}
          onSaveSettings={handleSaveSettings}
          onBack={() => setCurrentView('daily')}
          onShowPreviousDays={handleShowPreviousDays}
          onShowArchivedTasks={handleShowArchivedTasks}
        />
      )}

      {currentView === 'previous' && user && (
        <PreviousDays
          userId={user.id}
          onBack={() => setCurrentView('daily')}
        />
      )}

      {currentView === 'archived' && user && (
        <ArchivedTasks
          userId={user.id}
          onBack={() => setCurrentView('settings')}
        />
      )}




      </div>

      {/* Undo Notification */}
      <UndoNotification
        deletedTask={deletedTask}
        onUndo={handleUndoDelete}
        onDismiss={handleDismissUndo}
        duration={5000} // 5 seconds
      />
    </div>
  );
}