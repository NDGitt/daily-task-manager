import { supabase } from './supabase';
import type { Task, Project } from '@/types';
import { getTodayString, getYesterdayString, generateTaskId, generateProjectId } from './utils';

export class TaskService {
  // Task CRUD operations
  static async getTasks(userId: string, date?: string): Promise<Task[]> {
    const targetDate = date || getTodayString();
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date_created', targetDate)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getTasksByProject(userId: string, projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createTask(userId: string, content: string, projectId?: string): Promise<Task> {
    const today = getTodayString();
    
    // Get the next order value
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('order')
      .eq('user_id', userId)
      .eq('date_created', today)
      .order('order', { ascending: false })
      .limit(1);

    const nextOrder = existingTasks && existingTasks.length > 0 
      ? existingTasks[0].order + 1 
      : 0;

    const newTask = {
      id: generateTaskId(),
      user_id: userId,
      content,
      date_created: today,
      order: nextOrder,
      completed: false,
      project_id: projectId || null,
      carry_over_count: 0,
      eisenhower_quadrant: null
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
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
      date_completed: !currentTask.completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
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
    const updates = taskIds.map((id, index) => ({
      id,
      order: index,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('tasks')
      .upsert(updates);

    if (error) throw error;
  }

  // Carry-over logic
  static async carryOverIncompleteTasks(userId: string): Promise<Task[]> {
    const yesterday = getYesterdayString();
    const today = getTodayString();

    // Get incomplete tasks from yesterday
    const { data: incompleteTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date_created', yesterday)
      .eq('completed', false)
      .is('project_id', null); // Only carry over daily tasks, not project tasks

    if (fetchError) throw fetchError;
    if (!incompleteTasks || incompleteTasks.length === 0) return [];

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
    const carriedTasks = incompleteTasks.map(task => ({
      id: generateTaskId(),
      user_id: userId,
      content: task.content,
      date_created: today,
      order: nextOrder++,
      completed: false,
      project_id: null,
      carry_over_count: task.carry_over_count + 1,
      eisenhower_quadrant: task.eisenhower_quadrant
    }));

    const { data, error } = await supabase
      .from('tasks')
      .insert(carriedTasks)
      .select();

    if (error) throw error;
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
      id: generateProjectId(),
      user_id: userId,
      title,
      date_created: new Date().toISOString(),
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

  static async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async archiveProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ 
        archived: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (error) throw error;
  }

  static async updateProjectAccess(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ 
        last_accessed: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (error) throw error;
  }
}
