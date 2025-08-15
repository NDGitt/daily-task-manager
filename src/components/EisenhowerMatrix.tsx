'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ArrowLeft, Info } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { cn } from '@/lib/utils';
import { EISENHOWER_QUADRANTS } from '@/types';
import type { Task } from '@/types';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onBack: () => void;
}

export function EisenhowerMatrix({ 
  tasks, 
  onTasksChange, 
  onBack 
}: EisenhowerMatrixProps) {
  const [showInfo, setShowInfo] = useState(false);

  // Group tasks by quadrant
  const tasksByQuadrant = {
    1: tasks.filter(task => task.eisenhower_quadrant === 1),
    2: tasks.filter(task => task.eisenhower_quadrant === 2),
    3: tasks.filter(task => task.eisenhower_quadrant === 3),
    4: tasks.filter(task => task.eisenhower_quadrant === 4),
    unassigned: tasks.filter(task => !task.eisenhower_quadrant)
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;

    const sourceQuadrant = source.droppableId === 'unassigned' 
      ? null 
      : parseInt(source.droppableId) as 1 | 2 | 3 | 4;
    
    const destQuadrant = destination.droppableId === 'unassigned' 
      ? null 
      : parseInt(destination.droppableId) as 1 | 2 | 3 | 4;

    if (sourceQuadrant === destQuadrant) return;

    const taskId = result.draggableId;
    const updatedTasks = tasks.map(task =>
      task.id === taskId 
        ? { ...task, eisenhower_quadrant: destQuadrant }
        : task
    );

    onTasksChange(updatedTasks);
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
    onTasksChange(updatedTasks);
  };

  const handleTaskUpdate = (taskId: string, content: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, content } : task
    );
    onTasksChange(updatedTasks);
  };

  const handleTaskDelete = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    onTasksChange(updatedTasks);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Eisenhower Matrix</h2>
            <p className="text-gray-600">Organize your tasks by urgency and importance</p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How to use the Eisenhower Matrix:</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li><strong>Quadrant 1 (Do First):</strong> Urgent and important tasks - handle immediately</li>
            <li><strong>Quadrant 2 (Schedule):</strong> Important but not urgent - plan for these</li>
            <li><strong>Quadrant 3 (Delegate):</strong> Urgent but not important - delegate if possible</li>
            <li><strong>Quadrant 4 (Eliminate):</strong> Neither urgent nor important - consider removing</li>
          </ul>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Unassigned Tasks */}
        {tasksByQuadrant.unassigned.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Unassigned Tasks</h3>
            <Droppable droppableId="unassigned">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-2",
                    snapshot.isDraggingOver && "border-blue-400 bg-blue-50"
                  )}
                >
                  <p className="text-sm text-gray-600 mb-2">
                    Drag tasks to the appropriate quadrant
                  </p>
                  {tasksByQuadrant.unassigned.map((task, index) => (
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
                            onReorder={() => {}}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EISENHOWER_QUADRANTS.map((quadrant) => (
            <div key={quadrant.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded text-xs font-bold flex items-center justify-center text-white",
                  quadrant.id === 1 && "bg-red-500",
                  quadrant.id === 2 && "bg-blue-500",
                  quadrant.id === 3 && "bg-yellow-500",
                  quadrant.id === 4 && "bg-gray-500"
                )}>
                  {quadrant.id}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{quadrant.name}</h3>
                  <p className="text-sm text-gray-600">{quadrant.description}</p>
                </div>
              </div>

              <Droppable droppableId={quadrant.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "min-h-[200px] p-4 border-2 rounded-lg space-y-2",
                      quadrant.color,
                      snapshot.isDraggingOver && "border-opacity-60 bg-opacity-60"
                    )}
                  >
                    {tasksByQuadrant[quadrant.id as keyof typeof tasksByQuadrant].length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Drop tasks here
                      </p>
                    )}
                    
                    {(tasksByQuadrant[quadrant.id as keyof typeof tasksByQuadrant] as Task[]).map((task, index) => (
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
                              onReorder={() => {}}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back to Daily View
        </button>
        <button
          onClick={() => {
            // Clear all quadrant assignments
            const clearedTasks = tasks.map(task => ({
              ...task,
              eisenhower_quadrant: null
            }));
            onTasksChange(clearedTasks);
          }}
          className="px-6 py-2 text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
        >
          Clear Matrix
        </button>
      </div>
    </div>
  );
}
