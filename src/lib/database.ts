import { supabase } from './supabase';
import type { Task, Project, UserSettings } from '@/types';
import { getTodayString, getYesterdayString } from './utils';

export class DatabaseService {
  // Task operations
  static async getTasks(userId: string, date?: string): Promise<Task[]> {
    const targetDate = date || getTodayString();
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date_created', targetDate)
      .eq('archived', false) // Only show non-archived tasks
      .is('project_id', null) // Only daily tasks, not project tasks
      .order('"order"', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    return data || [];
  }

  static async createTask(userId: string, content: string, projectId?: string): Promise<Task> {
    if (!userId) {
      throw new Error('userId is required but was not provided');
    }
    
    const today = getTodayString();
    
    // Get the next order value
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('order')
      .eq('user_id', userId)
      .eq('date_created', today)
      .is('project_id', projectId ? null : null) // Match project context
      .order('order', { ascending: false })
      .limit(1);

    const nextOrder = existingTasks && existingTasks.length > 0 
      ? existingTasks[0].order + 1 
      : 0;

    const newTask = {
      user_id: userId,
      content,
      date_created: today,
      order: nextOrder,
      completed: false,
      archived: false,
      project_id: projectId || null,
      carry_over_count: 0,
      eisenhower_quadrant: null
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single();

    if (error) {
      console.error('Task creation failed:', error);
      throw error;
    }
    
    return data;
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    console.log('=== Updating task ===');
    console.log('taskId:', taskId);
    console.log('updates:', updates);
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Task doesn't exist in database
        console.warn(`Task ${taskId} not found in database, skipping update`);
        return null;
      }
      console.error('Task update error:', error);
      throw error;
    }
    
    console.log('Task updated successfully:', data);
    return data;
  }

  static async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  }

  static async toggleTaskComplete(taskId: string): Promise<Task> {
    // First get the current task
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (fetchError) throw fetchError;

    const updates = {
      completed: !currentTask.completed,
      date_completed: !currentTask.completed ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async reorderTasks(userId: string, taskIds: string[]): Promise<void> {
    console.log('=== Reordering tasks (parallel) ===');
    console.log('userId:', userId);
    console.log('taskIds:', taskIds);
    
    // Update all tasks in parallel for better performance
    const updatePromises = taskIds.map((taskId, index) => 
      supabase
        .from('tasks')
        .update({ order: index })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
    );

    try {
      const results = await Promise.all(updatePromises);
      
      // Check for errors in any of the results
      results.forEach((result, index) => {
        if (result.error) {
          console.error(`Failed to update order for task ${taskIds[index]}:`, result.error);
          throw result.error;
        }
        
        if (result.data && result.data.length === 0) {
          console.warn(`Task ${taskIds[index]} not found in database during reordering`);
        }
      });
      
      console.log('Task reordering completed successfully (parallel)');
    } catch (error) {
      console.error('Error in parallel reordering:', error);
      throw error;
    }
  }

  // Batch update multiple tasks in parallel
  static async updateTasksBatch(updates: Array<{ taskId: string; updates: Partial<Task> }>): Promise<(Task | null)[]> {
    console.log('=== Batch updating tasks (parallel) ===');
    console.log('Number of tasks to update:', updates.length);
    
    const updatePromises = updates.map(({ taskId, updates: taskUpdates }) =>
      this.updateTask(taskId, taskUpdates)
    );

    try {
      const results = await Promise.all(updatePromises);
      console.log('Batch task updates completed successfully');
      return results;
    } catch (error) {
      console.error('Error in batch task updates:', error);
      throw error;
    }
  }

  // Batch delete multiple tasks in parallel
  static async deleteTasksBatch(taskIds: string[]): Promise<void> {
    console.log('=== Batch deleting tasks (parallel) ===');
    console.log('Number of tasks to delete:', taskIds.length);
    
    const deletePromises = taskIds.map(taskId => this.deleteTask(taskId));

    try {
      await Promise.all(deletePromises);
      console.log('Batch task deletions completed successfully');
    } catch (error) {
      console.error('Error in batch task deletions:', error);
      throw error;
    }
  }

  // Simple carry-over logic - only from yesterday, archive older tasks
   // Simple carry-over logic - only from yesterday, archive older tasks
   static async carryOverIncompleteTasks(userId: string): Promise<{
    carriedTasks: Task[];
    totalCarried: number;
    highPriorityTasks: Task[];
    archivedTasks: number;
  }> {
    console.log('=== Starting simple task carry-over ===');
    
    // Check if carry-over was already attempted today
    const alreadyAttempted = await this.hasCarryOverBeenAttemptedToday(userId);
    if (alreadyAttempted) {
      console.log('Carry-over already attempted today, skipping');
      return { carriedTasks: [], totalCarried: 0, highPriorityTasks: [], archivedTasks: 0 };
    }

    const yesterday = getYesterdayString();
    const today = getTodayString();
    
    console.log(`Carrying over tasks from ${yesterday} to ${today}`);

    // Get incomplete tasks from yesterday only
    const { data: incompleteTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date_created', yesterday)
      .eq('completed', false)
      .eq('archived', false) // Only carry over non-archived tasks
      .is('project_id', null); // Only carry over daily tasks, not project tasks

    if (fetchError) {
      console.error('Error fetching incomplete tasks:', fetchError);
      throw fetchError;
    }
    
    // Archive all older tasks (more than 1 day old, both completed and incomplete)
    const archivedCount = await this.archiveOldTasks(userId);
    
    if (!incompleteTasks || incompleteTasks.length === 0) {
      console.log('No incomplete tasks from yesterday to carry over');
      return { carriedTasks: [], totalCarried: 0, highPriorityTasks: [], archivedTasks: archivedCount };
    }

    console.log(`Found ${incompleteTasks.length} incomplete tasks from yesterday to carry over`);

    // Check if tasks already exist for today (prevent duplicate carry-overs)
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('content')
      .eq('user_id', userId)
      .eq('date_created', today);

    const existingContents = new Set(existingTasks?.map(t => t.content) || []);

    // Filter out tasks that already exist today
    const tasksToCarryOver = incompleteTasks.filter(task => 
      !existingContents.has(task.content)
    );

    if (tasksToCarryOver.length === 0) {
      console.log('All tasks already exist for today, no carry-over needed');
      return { carriedTasks: [], totalCarried: 0, highPriorityTasks: [], archivedTasks: archivedCount };
    }

    // Get current max order for today
    const { data: todayTasks } = await supabase
      .from('tasks')
      .select('order')
      .eq('user_id', userId)
      .eq('date_created', today)
      .order('order', { ascending: false })
      .limit(1);

    let nextOrder = todayTasks && todayTasks.length > 0 ? todayTasks[0].order + 1 : 0;

    // Create new tasks for today with incremented carry_over_count
    const carriedTasks = tasksToCarryOver.map(task => ({
      user_id: userId,
      content: task.content,
      date_created: today,
      order: nextOrder++,
      completed: false,
      archived: false,
      project_id: null,
      carry_over_count: task.carry_over_count + 1,
      eisenhower_quadrant: task.eisenhower_quadrant
    }));

    const { data, error } = await supabase
      .from('tasks')
      .insert(carriedTasks)
      .select();

    if (error) {
      console.error('Error inserting carried tasks:', error);
      throw error;
    }

    const createdTasks = data || [];
    const highPriorityTasks = createdTasks.filter(task => task.carry_over_count >= 2);

    // Record the carry-over attempt for cross-device tracking
    if (createdTasks.length > 0) {
      await this.recordCarryOverAttempt(userId);
    }

    console.log(`Successfully carried over ${createdTasks.length} tasks from yesterday`);
    console.log(`${highPriorityTasks.length} tasks have been carried over multiple times`);
    console.log(`Archived ${archivedCount} older incomplete tasks`);

    return {
      carriedTasks: createdTasks,
      totalCarried: createdTasks.length,
      highPriorityTasks,
      archivedTasks: archivedCount
    };
  } 

  // Archive all tasks older than yesterday (both completed and incomplete)
  static async archiveOldTasks(userId: string): Promise<number> {
    const yesterday = getYesterdayString();
    
    // Find all non-archived tasks older than yesterday (both completed and incomplete)
    const { data: oldTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', userId)
      .lt('date_created', yesterday)
      .eq('archived', false)
      .is('project_id', null);

    if (fetchError) {
      console.error('Error fetching old tasks:', fetchError);
      return 0;
    }

    if (!oldTasks || oldTasks.length === 0) {
      return 0;
    }

    // Mark all old tasks as archived (preserve their completed status)
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ 
        archived: true
      })
      .in('id', oldTasks.map(t => t.id));

    if (updateError) {
      console.error('Error archiving old tasks:', updateError);
      return 0;
    }

    console.log(`Archived ${oldTasks.length} old tasks (both completed and incomplete)`);
    return oldTasks.length;
  }

  // Get incomplete tasks from multiple previous days
  static async getIncompleteTasks(userId: string, daysBack: number = 7): Promise<Task[]> {
    const dates = [];
    for (let i = 1; i <= daysBack; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }

    const { data: incompleteTasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .in('date_created', dates)
      .eq('completed', false)
      .eq('archived', false) // Only show non-archived tasks
      .is('project_id', null)
      .order('date_created', { ascending: false })
      .order('carry_over_count', { ascending: false });

    if (error) throw error;
    return incompleteTasks || [];
  }

  // Get archived tasks (for viewing archived tasks later)
  static async getArchivedTasks(userId: string, limit: number = 50): Promise<Task[]> {
    const { data: archivedTasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', true)
      .is('project_id', null)
      .order('date_created', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return archivedTasks || [];
  }

  // Get tasks for a specific date
  static async getTasksForDate(userId: string, date: string, includeArchived: boolean = false): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date_created', date)
      .is('project_id', null) // Only daily tasks, not project tasks
      .order('"order"', { ascending: true });
      
    if (!includeArchived) {
      query = query.eq('archived', false);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks for date:', error);
      throw error;
    }

    return data || [];
  }

  // Get daily task summaries for a date range
  static async getDailyTaskSummaries(userId: string, startDate: string, endDate: string): Promise<{
    date: string;
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
  }[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('date_created, completed')
      .eq('user_id', userId)
      .gte('date_created', startDate)
      .lte('date_created', endDate)
      // .eq('archived', false)     -- removed this line to include archived tasks
      .is('project_id', null); // Only daily tasks

    if (error) {
      console.error('Error fetching daily summaries:', error);
      throw error;
    }

    // Group by date and calculate summaries
    const summaries: Record<string, { total: number; completed: number }> = {};
    
    data?.forEach(task => {
      const date = task.date_created;
      if (!summaries[date]) {
        summaries[date] = { total: 0, completed: 0 };
      }
      summaries[date].total++;
      if (task.completed) {
        summaries[date].completed++;
      }
    });

    // Convert to array format
    return Object.entries(summaries).map(([date, stats]) => ({
      date,
      total_tasks: stats.total,
      completed_tasks: stats.completed,
      completion_rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    })).sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
  }



  // Move tasks from project to daily view
  static async moveTasksToDaily(taskIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        project_id: null,
        date_created: getTodayString() // Move to today
      })
      .in('id', taskIds);

    if (error) {
      console.error('Error moving tasks to daily:', error);
      throw error;
    }
  }

  // Get all tasks for a project (including archived projects)
  static async getAllProjectTasks(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('"order"', { ascending: true });

    if (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }

    return data || [];
  }

  // Project operations
  static async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        tasks:tasks(count)
      `)
      .eq('user_id', userId)
      .eq('archived', false)
      .order('last_accessed', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(project => ({
      ...project,
      task_count: project.tasks?.[0]?.count || 0
    }));
  }

  static async createProject(userId: string, title: string): Promise<Project> {
    const newProject = {
      user_id: userId,
      title,
      date_created: getTodayString(),
      last_accessed: new Date().toISOString(),
      archived: false
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
      .single();

    if (error) throw error;
    return { ...data, task_count: 0 };
  }

  static async deleteProject(projectId: string): Promise<void> {
    // First delete all tasks in the project
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('project_id', projectId);

    if (tasksError) throw tasksError;

    // Then delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }

  static async updateProjectAccess(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', projectId);

    if (error) throw error;
  }

  static async getProjectTasks(userId: string, projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('archived', false) // Only show non-archived tasks
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Archive/unarchive projects
  static async archiveProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ archived: true })
      .eq('id', projectId);

    if (error) throw error;
  }

  static async unarchiveProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ 
        archived: false,
        last_accessed: new Date().toISOString() // Update last accessed when unarchiving
      })
      .eq('id', projectId);

    if (error) throw error;
  }

  // Get archived projects
  static async getArchivedProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        tasks:tasks(count)
      `)
      .eq('user_id', userId)
      .eq('archived', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(project => ({
      ...project,
      task_count: project.tasks?.[0]?.count || 0
    }));
  }

  // Smart project archiving based on user settings
  static async autoArchiveProjects(userId: string, settings: UserSettings): Promise<{
    completedProjects: number;
    inactiveProjects: number;
  }> {
    console.log('=== Starting smart project archiving ===');
    
    let completedCount = 0;
    let inactiveCount = 0;

    // Archive completed projects if enabled
    if (settings.project_archive_completed) {
      const { data: completedProjects, error: completedError } = await supabase
        .from('projects')
        .select(`
          id,
          tasks:tasks(completed, archived)
        `)
        .eq('user_id', userId)
        .eq('archived', false);

      if (completedError) {
        console.error('Error fetching projects for completion check:', completedError);
      } else if (completedProjects) {
        const projectsToArchive = completedProjects.filter(project => {
          const tasks = project.tasks || [];
          const activeTasks = tasks.filter((task: { archived: boolean; completed: boolean }) => !task.archived);
          
          // Archive if all active tasks are completed and there's at least one task
          return activeTasks.length > 0 && activeTasks.every((task: { completed: boolean }) => task.completed);
        });

        if (projectsToArchive.length > 0) {
          const { error: archiveError } = await supabase
            .from('projects')
            .update({ archived: true })
            .in('id', projectsToArchive.map(p => p.id));

          if (archiveError) {
            console.error('Error archiving completed projects:', archiveError);
          } else {
            completedCount = projectsToArchive.length;
            console.log(`Archived ${completedCount} completed projects`);
          }
        }
      }
    }

    // Archive inactive projects
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - settings.project_auto_archive_days);
    const cutoffISO = cutoffDate.toISOString();

    const { data: inactiveProjects, error: inactiveError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('archived', false)
      .lt('last_accessed', cutoffISO);

    if (inactiveError) {
      console.error('Error fetching inactive projects:', inactiveError);
    } else if (inactiveProjects && inactiveProjects.length > 0) {
      const { error: archiveError } = await supabase
        .from('projects')
        .update({ archived: true })
        .in('id', inactiveProjects.map(p => p.id));

      if (archiveError) {
        console.error('Error archiving inactive projects:', archiveError);
      } else {
        inactiveCount = inactiveProjects.length;
        console.log(`Archived ${inactiveCount} inactive projects`);
      }
    }

    console.log(`Project archiving complete: ${completedCount} completed, ${inactiveCount} inactive`);
    return { completedProjects: completedCount, inactiveProjects: inactiveCount };
  }

  // User settings
  static async getUserSettings(userId: string): Promise<UserSettings> {
    const { data, error } = await supabase
      .from('users')
      .select('settings')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user settings:', error);
          // Return default settings if user doesn't exist or settings are invalid
    return {
      task_completion_behavior: 'stay_visible',
      task_completion_visual: 'change_color',
      smart_suggestions_enabled: true,
      task_overload_threshold: 15,
      project_auto_archive_days: 7,
      project_archive_completed: true
    };
    }
    
    // Ensure we have valid settings
    const defaultSettings: UserSettings = {
      task_completion_behavior: 'stay_visible',
      task_completion_visual: 'change_color',
      smart_suggestions_enabled: true,
      task_overload_threshold: 15,
      project_auto_archive_days: 7,
      project_archive_completed: true
    };
    
    return data?.settings ? { ...defaultSettings, ...data.settings } : defaultSettings;
  }

  static async updateUserSettings(userId: string, settings: UserSettings): Promise<void> {
    console.log('Updating user settings:', { userId, settings });
    
    const { error } = await supabase
      .from('users')
      .update({ 
        settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
    
    console.log('User settings updated successfully');
  }

  // Ensure user profile exists
  static async ensureUserProfile(userId: string, email: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create profile
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email,
          onboarding_completed: false,
          settings: {
            task_completion_behavior: 'stay_visible' as const,
            task_completion_visual: 'change_color' as const,
            smart_suggestions_enabled: true,
            task_overload_threshold: 15,

            project_auto_archive_days: 7,
            project_archive_completed: true
          }
        }]);

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        throw insertError;
      }
    } else if (error) {
      console.error('Error checking user profile:', error);
      throw error;
    }
  }

  // Check if user has completed onboarding
  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }

    return data?.onboarding_completed || false;
  }

  // Mark onboarding as completed
  static async completeOnboarding(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }
  // Cross-device carry-over tracking methods
  static async hasCarryOverBeenAttemptedToday(userId: string): Promise<boolean> {
    const today = getTodayString();
    
    const { data, error } = await supabase
      .from('carry_over_attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('attempt_date', today)
      .limit(1);

    if (error) {
      console.error('Error checking carry-over attempts:', error);
      return false;
    }

    return data && data.length > 0;
  }

  static async recordCarryOverAttempt(userId: string): Promise<void> {
    const today = getTodayString();
    
    const { error } = await supabase
      .from('carry_over_attempts')
      .insert({
        user_id: userId,
        attempt_date: today
      });

    if (error) {
      console.error('Error recording carry-over attempt:', error);
    }
  }

  static async cleanupOldCarryOverAttempts(userId: string): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = this.dateToDateString(thirtyDaysAgo);

    const { error } = await supabase
      .from('carry_over_attempts')
      .delete()
      .eq('user_id', userId)
      .lt('attempt_date', thirtyDaysAgoStr);

    if (error) {
      console.error('Error cleaning up old carry-over attempts:', error);
    }
  }

  // Helper method for date formatting
  private static dateToDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
