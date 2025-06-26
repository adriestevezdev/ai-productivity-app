'use client';

import { useState } from 'react';
import { TaskAICreate, TaskPriority, TaskCategory, TaskTag, Goal } from '@/types/task';
import { useApiClient } from '@/lib/api-client';
import { TaskForm } from './task-form';

interface AITaskFormProps {
  categories: TaskCategory[];
  tags: TaskTag[];
  goals: Goal[];
  onTaskCreated?: () => void;
  onCancel?: () => void;
}

export function AITaskForm({ 
  categories, 
  tags, 
  goals,
  onTaskCreated,
  onCancel 
}: AITaskFormProps) {
  const apiClient = useApiClient();
  const [step, setStep] = useState<'input' | 'preview' | 'form'>('input');
  const [naturalInput, setNaturalInput] = useState('');
  const [parsedTask, setParsedTask] = useState<TaskAICreate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleParse = async () => {
    if (!naturalInput.trim()) {
      setError('Please enter a task description');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<TaskAICreate>('/api/tasks/parse-ai?description=' + encodeURIComponent(naturalInput));
      
      setParsedTask(response);
      setStep('preview');
    } catch (err) {
      console.error('Failed to parse task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse task with AI';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmPreview = () => {
    setStep('form');
  };
  
  const handleBackToInput = () => {
    setStep('input');
    setParsedTask(null);
  };
  
  const handleCreateFromAI = async () => {
    if (!parsedTask) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.post('/api/tasks/create-from-ai', parsedTask);
      onTaskCreated?.();
    } catch (err) {
      console.error('Failed to create task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Not set';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getPriorityColor = (priority: TaskPriority | string) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'text-red-400';
      case TaskPriority.HIGH:
        return 'text-orange-400';
      case TaskPriority.MEDIUM:
        return 'text-yellow-400';
      case TaskPriority.LOW:
        return 'text-green-400';
      default:
        return 'text-[#A0A0A0]';
    }
  };
  
  if (step === 'input') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Create Task with AI
          </h3>
          <p className="text-[#A0A0A0] text-sm">
            Describe your task in natural language and let AI help you organize it
          </p>
        </div>
        
        <div>
          <label htmlFor="ai-input" className="block text-sm font-medium text-white mb-2">
            Describe your task
          </label>
          <textarea
            id="ai-input"
            value={naturalInput}
            onChange={(e) => {
              setNaturalInput(e.target.value);
              setError(null);
            }}
            rows={5}
            className={`w-full bg-[#242426] text-white px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 resize-none transition-colors ${
              error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-white/8 focus:border-[#4ECDC4] focus:ring-[#4ECDC4]/20'
            }`}
            placeholder="Example: I need to finish the quarterly report by Friday, it's urgent and will take about 2 hours"
            autoFocus
          />
          <p className="mt-2 text-xs text-[#A0A0A0]">
            Include details like due dates, priority, time estimates, and categories/tags
          </p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-[#A0A0A0] hover:text-white transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            className="px-6 py-2 bg-[#4ECDC4] text-black rounded-lg hover:bg-[#45B7B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            disabled={isLoading || !naturalInput.trim()}
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <span>✨</span>
                Parse with AI
              </>
            )}
          </button>
        </div>
      </div>
    );
  }
  
  if (step === 'preview' && parsedTask) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            AI Task Preview
          </h3>
          <p className="text-[#A0A0A0] text-sm">
            Review the parsed task details before creating
          </p>
        </div>
        
        <div className="bg-[#242426] border border-white/8 rounded-lg p-6 space-y-4">
          <div>
            <h4 className="text-xl font-medium text-white">{parsedTask.title}</h4>
          </div>
          
          {parsedTask.description && (
            <div>
              <p className="text-sm text-[#A0A0A0] mb-1">Description</p>
              <p className="text-white">{parsedTask.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#A0A0A0] mb-1">Priority</p>
              <p className={`font-medium ${getPriorityColor(parsedTask.priority)}`}>
                {parsedTask.priority}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-[#A0A0A0] mb-1">Due Date</p>
              <p className="text-white">{formatDate(parsedTask.due_date)}</p>
            </div>
            
            {parsedTask.estimated_duration && (
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">Estimated Duration</p>
                <p className="text-white">
                  {parsedTask.estimated_duration < 60 
                    ? `${parsedTask.estimated_duration} minutes`
                    : `${Math.round(parsedTask.estimated_duration / 60)} hours`
                  }
                </p>
              </div>
            )}
          </div>
          
          {parsedTask.tags && parsedTask.tags.length > 0 && (
            <div>
              <p className="text-sm text-[#A0A0A0] mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {parsedTask.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 text-white rounded-full text-sm border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-[#1B1B1D] border border-white/8 rounded-lg p-4">
          <p className="text-sm text-[#A0A0A0] mb-2">Original input:</p>
          <p className="text-white italic">&ldquo;{naturalInput}&rdquo;</p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBackToInput}
            className="px-6 py-2 text-[#A0A0A0] hover:text-white transition-colors"
            disabled={isLoading}
          >
            ← Back
          </button>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleConfirmPreview}
              className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
              disabled={isLoading}
            >
              Edit Details
            </button>
            <button
              onClick={handleCreateFromAI}
              className="px-6 py-2 bg-[#4ECDC4] text-black rounded-lg hover:bg-[#45B7B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (step === 'form' && parsedTask) {
    // Convert AI task to form initial data
    const initialData = {
      title: parsedTask.title,
      description: parsedTask.description,
      priority: parsedTask.priority as TaskPriority,
      due_date: parsedTask.due_date,
      estimated_hours: parsedTask.estimated_duration 
        ? Math.ceil(parsedTask.estimated_duration / 60) 
        : undefined,
    };
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Edit Task Details
          </h3>
          <p className="text-[#A0A0A0] text-sm">
            Fine-tune the task details before creating
          </p>
        </div>
        
        <TaskForm
          initialData={initialData}
          categories={categories}
          tags={tags}
          goals={goals}
          onSubmit={onTaskCreated}
          onCancel={() => setStep('preview')}
        />
      </div>
    );
  }
  
  return null;
}