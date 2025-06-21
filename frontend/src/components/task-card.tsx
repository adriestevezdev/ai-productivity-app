'use client';

import { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { useTasks } from '@/hooks/use-tasks';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onUpdate?: (updatedTask: Task) => void;
  onDelete?: (taskId: number) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onUpdate, onDelete, isDragging = false }: TaskCardProps) {
  const { updateTaskStatus, deleteTask } = useTasks();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newStatus = task.status === TaskStatus.COMPLETED 
        ? TaskStatus.TODO 
        : TaskStatus.COMPLETED;
      
      const updatedTask = await updateTaskStatus(task.id, newStatus);
      onUpdate?.(updatedTask);
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isLoading || !confirm('Are you sure you want to delete this task?')) return;
    
    setIsLoading(true);
    try {
      await deleteTask(task.id);
      onDelete?.(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'border-red-500 bg-red-500/10';
      case TaskPriority.HIGH:
        return 'border-orange-500 bg-orange-500/10';
      case TaskPriority.MEDIUM:
        return 'border-yellow-500 bg-yellow-500/10';
      case TaskPriority.LOW:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'text-green-500';
      case TaskStatus.IN_PROGRESS:
        return 'text-blue-500';
      case TaskStatus.ARCHIVED:
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== TaskStatus.COMPLETED;

  return (
    <div
      className={`
        bg-[#1A1A1C] border border-white/8 rounded-xl p-6 
        transition-all duration-200 cursor-grab
        hover:translate-y-[-2px] hover:shadow-lg hover:border-white/12
        ${isDragging ? 'opacity-80 cursor-grabbing' : ''}
        ${getPriorityColor(task.priority)}
        ${task.status === TaskStatus.COMPLETED ? 'opacity-60' : ''}
        min-h-[48px]
      `}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Status checkbox */}
          <button
            onClick={handleStatusToggle}
            className={`
              mt-1 w-5 h-5 rounded-md border-2 transition-all duration-200
              ${task.status === TaskStatus.COMPLETED 
                ? 'bg-[#4ECDC4] border-[#4ECDC4]' 
                : 'border-gray-600 hover:border-[#4ECDC4]'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={isLoading}
          >
            {task.status === TaskStatus.COMPLETED && (
              <svg className="w-3 h-3 text-black m-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {/* Title */}
          <h3 className={`
            text-base font-medium text-white flex-1
            ${task.status === TaskStatus.COMPLETED ? 'line-through' : ''}
          `}>
            {task.title}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            disabled={isLoading}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
        {/* Priority */}
        <span className="capitalize">{task.priority.replace('_', ' ')}</span>
        
        {/* Category */}
        {task.category && (
          <span className="flex items-center gap-1">
            {task.category.icon && <span>{task.category.icon}</span>}
            <span style={{ color: task.category.color || undefined }}>
              {task.category.name}
            </span>
          </span>
        )}
        
        {/* Due date */}
        {task.due_date && (
          <span className={isOverdue ? 'text-red-500' : ''}>
            {format(new Date(task.due_date), 'MMM d')}
          </span>
        )}
        
        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex gap-1">
            {task.tags.slice(0, 2).map(tag => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ 
                  backgroundColor: tag.color ? `${tag.color}20` : 'rgba(255,255,255,0.1)',
                  color: tag.color || '#A0A0A0'
                }}
              >
                {tag.name}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs">+{task.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/8 space-y-3 animate-in slide-in-from-top-2">
          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {task.description}
            </p>
          )}
          
          {/* Additional metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-[#A0A0A0]">
            {/* Status */}
            <div className="flex items-center gap-1">
              <span>Status:</span>
              <span className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            
            {/* Time tracking */}
            {(task.estimated_hours || task.actual_hours) && (
              <div className="flex items-center gap-1">
                <span>Time:</span>
                <span>
                  {task.actual_hours || 0}/{task.estimated_hours || 0}h
                </span>
              </div>
            )}
            
            {/* Created date */}
            <div className="flex items-center gap-1">
              <span>Created:</span>
              <span>{format(new Date(task.created_at), 'MMM d, yyyy')}</span>
            </div>
            
            {/* Completed date */}
            {task.completed_at && (
              <div className="flex items-center gap-1">
                <span>Completed:</span>
                <span>{format(new Date(task.completed_at), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}