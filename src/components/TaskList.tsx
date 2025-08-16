'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { cn, reorderTasks, getTodayString } from '@/lib/utils';
import type { Task, TaskListProps } from '@/types';

export function TaskList({ 
  tasks, 
  onTasksChange, 
  onDeleteTask,
  userSettings,
  // isMatrixMode = false 
}: TaskListProps) {
  const [newTaskContent, setNewTaskContent] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleAddTask = () => {
    if (newTaskContent.trim()) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        user_id: '', // Will be set by parent component
        content: newTaskContent.trim(),
        date_created: getTodayString(),
        order: tasks.length,
        completed: false,
        archived: false,
        carry_over_count: 0
      };
      
      onTasksChange([...tasks, newTask]);
      setNewTaskContent('');
      setIsAddingTask(false);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed,
            date_completed: !task.completed ? new Date().toISOString() : null
          }
        : task
    );
    
    // Apply task completion behavior based on user settings
    if (userSettings?.task_completion_behavior) {
      const completedTask = updatedTasks.find(t => t.id === taskId);
      if (completedTask?.completed) {
        switch (userSettings.task_completion_behavior) {
          case 'move_to_bottom':
            // Move completed task to bottom
            const withoutCompleted = updatedTasks.filter(t => t.id !== taskId);
            const reordered = [...withoutCompleted, completedTask];
            onTasksChange(reordered);
            return;
          case 'hide':
            // Hide completed task (filter it out) - the parent will handle database updates
            onTasksChange(updatedTasks.filter(t => !t.completed));
            return;
          case 'stay_visible':
          default:
            // Keep in place
            break;
        }
      }
    }
    
    onTasksChange(updatedTasks);
  };

  const handleTaskUpdate = (taskId: string, content: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, content } : task
    );
    onTasksChange(updatedTasks);
  };

  const handleTaskDelete = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (taskToDelete && onDeleteTask) {
      // Use the new undo-enabled delete handler
      onDeleteTask(taskToDelete);
    } else {
      // Fallback to direct deletion (for components that don't support undo)
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      onTasksChange(updatedTasks);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedTasks = reorderTasks(
      tasks,
      result.source.index,
      result.destination.index
    );

    onTasksChange(reorderedTasks);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskContent('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Task List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "space-y-1 min-h-[100px] py-2",
                snapshot.isDraggingOver && "bg-blue-50 rounded"
              )}
            >
              {tasks.length === 0 && !isAddingTask && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-base mb-1">No tasks yet</div>
                  <div className="text-sm">Click &quot;Add a task&quot; below to get started</div>
                </div>
              )}

              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        "transition-transform",
                        snapshot.isDragging && "rotate-2 scale-105 shadow-lg"
                      )}
                    >
                      <TaskItem
                        task={task}
                        onToggleComplete={handleTaskToggle}
                        onUpdateContent={handleTaskUpdate}
                        onDelete={handleTaskDelete}
                        onReorder={() => {}} // Handled by drag and drop
                        userSettings={userSettings}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Task Input */}
      {isAddingTask ? (
        <div className="py-2 px-1">
          <input
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTaskContent.trim()) {
                setIsAddingTask(false);
              }
            }}
            placeholder="What needs to be done?"
            className="w-full px-1 py-0.5 text-gray-900 placeholder-gray-400 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <div className="flex gap-3 mt-2 text-sm">
            <button
              onClick={handleAddTask}
              disabled={!newTaskContent.trim()}
              className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskContent('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
          className="w-full py-2 px-1 text-left text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add a task</span>
        </button>
      )}
    </div>
  );
}
