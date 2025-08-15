'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Archive, Search, Filter, CheckCircle, Circle, RotateCcw, Trash2, Calendar } from 'lucide-react';
import { DatabaseService } from '@/lib/database';
import { getTodayString, getYesterdayString } from '@/lib/utils';
import type { Task } from '@/types';

interface ArchivedTasksProps {
  userId: string;
  onBack: () => void;
}

type FilterType = 'all' | 'completed' | 'incomplete';

export function ArchivedTasks({ userId, onBack }: ArchivedTasksProps) {
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadArchivedTasks();
  }, [userId]);

  // When a date is selected, filter tasks for that date
  useEffect(() => {
    if (selectedDate) {
      const dateTasks = archivedTasks.filter(task => task.date_created === selectedDate);
      applyFiltersToDateTasks(dateTasks);
    }
  }, [selectedDate, archivedTasks, searchQuery, filterType]);

  const loadArchivedTasks = async () => {
    setLoading(true);
    try {
      const tasks = await DatabaseService.getArchivedTasks(userId, 200); // Load more for better browsing
      setArchivedTasks(tasks);
    } catch (error) {
      console.error('Error loading archived tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersToDateTasks = (dateTasks: Task[]) => {
    let filtered = [...dateTasks];

    // Apply completion filter
    if (filterType === 'completed') {
      filtered = filtered.filter(task => task.completed);
    } else if (filterType === 'incomplete') {
      filtered = filtered.filter(task => !task.completed);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.content.toLowerCase().includes(query)
      );
    }

    setSelectedDateTasks(filtered);
  };

  const handleTaskSelect = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === selectedDateTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(selectedDateTasks.map(task => task.id)));
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTasks(new Set()); // Clear task selections when changing dates
  };

  const handleBackToDatesList = () => {
    setSelectedDate(null);
    setSelectedTasks(new Set());
    setSearchQuery('');
    setFilterType('all');
  };

  const handleRestoreTask = async (taskId: string) => {
    try {
      // Update task to be unarchived and move to today
      await DatabaseService.updateTask(taskId, {
        archived: false,
        date_created: getTodayString() // Move to today
      });
      
      // Remove from local state
      setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    } catch (error) {
      console.error('Error restoring task:', error);
    }
  };

  const handleRestoreSelected = async () => {
    try {
      const promises = Array.from(selectedTasks).map(taskId => 
        DatabaseService.updateTask(taskId, {
          archived: false,
          date_created: getTodayString()
        })
      );
      
      await Promise.all(promises);
      
      // Remove restored tasks from local state
      setArchivedTasks(prev => prev.filter(task => !selectedTasks.has(task.id)));
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Error restoring selected tasks:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to permanently delete this task? This cannot be undone.')) {
      return;
    }

    try {
      await DatabaseService.deleteTask(taskId);
      setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${selectedTasks.size} tasks? This cannot be undone.`)) {
      return;
    }

    try {
      const promises = Array.from(selectedTasks).map(taskId => 
        DatabaseService.deleteTask(taskId)
      );
      
      await Promise.all(promises);
      
      // Remove deleted tasks from local state
      setArchivedTasks(prev => prev.filter(task => !selectedTasks.has(task.id)));
      setSelectedTasks(new Set());
    } catch (error) {
      console.error('Error deleting selected tasks:', error);
    }
  };

  // Group tasks by date for the main dates list
  const groupedTasks = archivedTasks.reduce((groups: Record<string, Task[]>, task) => {
    const date = task.date_created;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedTasks).sort((a, b) => b.localeCompare(a)); // Most recent first

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');

    if (dateStr === getTodayString()) {
      return 'Today';
    } else if (dateStr === getYesterdayString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={selectedDate ? handleBackToDatesList : onBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title={selectedDate ? "Back to dates list" : "Back to Settings"}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {selectedDate ? getDateLabel(selectedDate) : 'Archived Tasks'}
                </h1>
                <p className="text-sm text-gray-600">
                  {selectedDate 
                    ? `${selectedDateTasks.length} tasks on this date`
                    : `${sortedDates.length} dates with archived tasks`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Archive className="text-orange-600" size={20} />
            </div>
          </div>

          {/* Search and Filters - only show when viewing a specific date */}
          {selectedDate && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search tasks on this date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Tasks</option>
                  <option value="completed">Completed</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>
            </div>
          )}

          {/* Bulk Actions - only show when viewing a specific date and tasks are selected */}
          {selectedDate && selectedTasks.size > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestoreSelected}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <RotateCcw size={14} />
                  Restore
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !selectedDate ? (
          // Show dates list
          sortedDates.length > 0 ? (
            <div className="space-y-3">
              {sortedDates.map(date => {
                const dateTasks = groupedTasks[date];
                const completedCount = dateTasks.filter(t => t.completed).length;
                const completionRate = Math.round((completedCount / dateTasks.length) * 100);
                
                return (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{getDateLabel(date)}</h3>
                          <p className="text-sm text-gray-600">
                            {dateTasks.length} task{dateTasks.length !== 1 ? 's' : ''} • {completedCount} completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          completionRate >= 80 ? 'bg-green-100 text-green-700' :
                          completionRate >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {completionRate}%
                        </div>
                        <div className="text-gray-400">→</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Archive size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No archived tasks yet</h3>
              <p className="text-gray-600">Tasks older than yesterday will automatically appear here.</p>
            </div>
          )
        ) : (
          // Show tasks for selected date
          selectedDateTasks.length > 0 ? (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedTasks.size === selectedDateTasks.length && selectedDateTasks.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Select all tasks</span>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                {selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={() => handleTaskSelect(task.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      {task.completed ? (
                        <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <Circle size={18} className="text-gray-400 flex-shrink-0 mt-1" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm sm:text-base ${task.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                          {task.content}
                        </p>
                        {task.completed && task.date_completed && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completed: {new Date(task.date_completed).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRestoreTask(task.id)}
                          className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                          title="Restore to today"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete permanently"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Archive size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filterType !== 'all' 
                  ? 'No matching tasks on this date' 
                  : 'No tasks found for this date'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'This date has no archived tasks.'
                }
              </p>
              {(searchQuery || filterType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
