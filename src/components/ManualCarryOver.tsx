'use client';

import { useState } from 'react';
import { ArrowRight, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { DatabaseService } from '@/lib/database';
import { formatDate } from '@/lib/utils';
import type { Task } from '@/types';

interface ManualCarryOverProps {
  userId: string;
  onTasksCarriedOver: (carriedTasks: Task[]) => void;
}

export function ManualCarryOver({ userId, onTasksCarriedOver }: ManualCarryOverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [incompleteTasks, setIncompleteTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [carrying, setCarrying] = useState(false);

  const loadIncompleteTasks = async () => {
    setLoading(true);
    try {
      const tasks = await DatabaseService.getIncompleteTasks(userId, 7);
      setIncompleteTasks(tasks);
      // Pre-select tasks with high carry-over count
      const highPriorityIds = tasks
        .filter(task => task.carry_over_count >= 1)
        .map(task => task.id);
      setSelectedTasks(new Set(highPriorityIds));
    } catch (error) {
      console.error('Error loading incomplete tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    loadIncompleteTasks();
  };

  const handleClose = () => {
    setIsOpen(false);
    setIncompleteTasks([]);
    setSelectedTasks(new Set());
  };

  const toggleTask = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleCarryOver = async () => {
    if (selectedTasks.size === 0) return;

    setCarrying(true);
    try {
      const selectedTaskList = incompleteTasks.filter(task => selectedTasks.has(task.id));
      const allCarriedTasks: Task[] = [];

      // Create new tasks for today from the selected tasks
      for (const task of selectedTaskList) {
        const carriedTask = await DatabaseService.createTask(userId, task.content);
        allCarriedTasks.push(carriedTask);
      }

      onTasksCarriedOver(allCarriedTasks);
      handleClose();
    } catch (error) {
      console.error('Error carrying over tasks:', error);
    } finally {
      setCarrying(false);
    }
  };

  // Group tasks by date for better organization
  const tasksByDate = incompleteTasks.reduce((acc, task) => {
    const date = task.date_created;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
      >
        <ArrowRight size={16} />
        Carry over tasks
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Carry Over Tasks</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select incomplete tasks from previous days to add to today
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-gray-400" size={24} />
              <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
          ) : incompleteTasks.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">No incomplete tasks found from the last 7 days.</p>
              <p className="text-sm text-gray-500 mt-1">Great job staying on top of your tasks! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(tasksByDate)
                .sort(([a], [b]) => b.localeCompare(a)) // Most recent first
                .map(([date, _tasks]) => (
                  <div key={date} className="space-y-2">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Calendar size={16} />
                      {formatDate(date)}
                      <span className="text-sm text-gray-500">({_tasks.length} tasks)</span>
                    </h3>
                    <div className="space-y-2 ml-6">
                      {_tasks.map((task) => (
                        <label
                          key={task.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTasks.has(task.id)}
                            onChange={() => toggleTask(task.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="text-gray-900">{task.content}</span>
                            {task.carry_over_count > 0 && (
                              <span className="ml-2 text-xs text-amber-600 font-medium">
                                Carried {task.carry_over_count} time{task.carry_over_count > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {incompleteTasks.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              {selectedTasks.size} of {incompleteTasks.length} tasks selected
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCarryOver}
                disabled={selectedTasks.size === 0 || carrying}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carrying ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Carrying over...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Carry over {selectedTasks.size} tasks
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

