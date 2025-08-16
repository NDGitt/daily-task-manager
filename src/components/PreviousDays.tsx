'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, CheckCircle, Circle, TrendingUp } from 'lucide-react';
import { DatabaseService } from '@/lib/database';
import { getTodayString, dateToDateString } from '@/lib/utils';
import type { Task } from '@/types';

interface PreviousDaysProps {
  userId: string;
  onBack: () => void;
}

interface DailySummary {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

export function PreviousDays({ userId, onBack }: PreviousDaysProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Load summaries for current month
  useEffect(() => {
    loadMonthlySummaries();
  }, [currentMonth, userId]);

  // Use the imported utility function for timezone-aware date conversion

  const loadMonthlySummaries = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const startDateStr = dateToDateString(startDate);
      const endDateStr = dateToDateString(endDate);
      
      const summaries = await DatabaseService.getDailyTaskSummaries(userId, startDateStr, endDateStr);
      setDailySummaries(summaries);
    } catch (error) {
      console.error('Error loading monthly summaries:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, userId]);

  const loadTasksForDate = async (date: string) => {
    setTasksLoading(true);
    try {
      const tasks = await DatabaseService.getTasksForDate(userId, date);
      setSelectedDayTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks for date:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    loadTasksForDate(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    setSelectedDate(null); // Clear selection when changing months
  };

  const getSummaryForDate = (dateStr: string) => {
    return dailySummaries.find(s => s.date === dateStr);
  };

  const renderCalendarGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const currentDate = new Date(startDate);

    // Generate 6 weeks (42 days) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      const dateStr = dateToDateString(currentDate);
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = dateStr === getTodayString();
      const summary = getSummaryForDate(dateStr);
      const hasData = summary && summary.total_tasks > 0;

      days.push(
        <button
          key={dateStr}
          onClick={() => hasData ? handleDateSelect(dateStr) : null}
          disabled={!hasData || !isCurrentMonth}
          className={`
            aspect-square p-1 text-sm relative transition-colors
            ${!isCurrentMonth 
              ? 'text-gray-300 cursor-not-allowed' 
              : hasData 
                ? 'text-gray-900 hover:bg-blue-50 cursor-pointer' 
                : 'text-gray-400 cursor-not-allowed'
            }
            ${selectedDate === dateStr ? 'bg-blue-100 ring-2 ring-blue-500' : ''}
            ${isToday ? 'font-bold text-blue-600' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span>{currentDate.getDate()}</span>
            {hasData && (
              <div className="flex gap-0.5 mt-1">
                <div 
                  className={`w-1 h-1 rounded-full ${
                    summary.completion_rate >= 80 ? 'bg-green-500' :
                    summary.completion_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} 
                />
                <span className="text-xs text-gray-600">{summary.total_tasks}</span>
              </div>
            )}
          </div>
        </button>
      );

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Back to Daily View"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Previous Days</h1>
                <p className="text-sm text-gray-600">Browse your task history</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Calendar Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              disabled={currentMonth >= new Date()} // Don't allow future months
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarGrid()}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>80%+ complete</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>50-79% complete</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>&lt;50% complete</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDate && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  {(() => {
                    const summary = getSummaryForDate(selectedDate);
                    if (summary) {
                      return (
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">
                            {summary.completed_tasks} of {summary.total_tasks} tasks completed
                          </span>
                          <span className={`text-sm px-2 py-1 rounded-full ${getCompletionColor(summary.completion_rate)}`}>
                            {summary.completion_rate}%
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4">
              {tasksLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedDayTasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        task.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {task.completed ? (
                        <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle size={18} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`flex-1 ${task.completed ? 'text-green-800' : 'text-gray-900'}`}>
                        {task.content}
                      </span>
                      {task.completed && task.date_completed && (
                        <span className="text-xs text-green-600">
                          {new Date(task.date_completed).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No tasks found for this date</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Monthly Stats */}
        {dailySummaries.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Monthly Overview</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {dailySummaries.reduce((sum, s) => sum + s.total_tasks, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dailySummaries.reduce((sum, s) => sum + s.completed_tasks, 0)}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    dailySummaries.reduce((sum, s) => sum + s.completion_rate, 0) / 
                    dailySummaries.length
                  )}%
                </div>
                <div className="text-sm text-gray-600">Avg. Completion</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

