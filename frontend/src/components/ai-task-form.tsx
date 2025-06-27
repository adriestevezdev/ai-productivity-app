'use client';

import { useState } from 'react';
import { TaskAICreate, TaskPriority, TaskCategory, TaskTag, Goal } from '@/types/task';
import { useApiClient } from '@/lib/api-client';
import { TaskForm } from './task-form';
import { useSubscriptionAwareFeatureUsage } from '@/hooks/use-subscription-aware-feature-usage';
import { ProFeature, FREE_TIER_LIMITS } from '@/lib/features';

interface AITaskFormProps {
  categories: TaskCategory[];
  tags: TaskTag[];
  goals: Goal[];
  selectedGoalId?: number | null;
  onTaskCreated?: () => void;
  onCancel?: () => void;
}

export function AITaskForm({ 
  categories, 
  tags, 
  goals,
  selectedGoalId,
  onTaskCreated,
  onCancel 
}: AITaskFormProps) {
  const apiClient = useApiClient();
  const { canUse, incrementUsage, remainingUses, isPro, isLoading: subscriptionLoading, usageMessage } = useSubscriptionAwareFeatureUsage(ProFeature.AI_TASK_CREATION);
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
    
    if (!canUse) {
      if (isPro) {
        setError('AI task creation is temporarily unavailable. Please try again later.');
      } else {
        setError(`You've reached your daily limit of ${FREE_TIER_LIMITS.MAX_AI_TASKS_PER_DAY} AI tasks. Upgrade to Pro for unlimited AI task creation.`);
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<TaskAICreate>('/api/tasks/parse-ai?description=' + encodeURIComponent(naturalInput));
      
      incrementUsage();
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
      // Add goal_id to the task if a project is selected
      const taskWithGoal = selectedGoalId 
        ? { ...parsedTask, goal_id: selectedGoalId }
        : parsedTask;
      
      await apiClient.post('/api/tasks/create-from-ai', taskWithGoal);
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
    if (!dateStr) return 'No establecida';
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
            Crear Tarea con IA
          </h3>
          <p className="text-[#A0A0A0] text-sm">
            Describe tu tarea en lenguaje natural y deja que la IA te ayude a organizarla
          </p>
          {/* Usage indicator */}
          {!subscriptionLoading && (
            <div className="mt-2 text-xs text-[#606060]">
              {usageMessage}
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="ai-input" className="block text-sm font-medium text-white mb-2">
            Describe tu tarea
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
            placeholder="Ejemplo: Necesito terminar el reporte trimestral para el viernes, es urgente y tomará unas 2 horas"
            autoFocus
          />
          <p className="mt-2 text-xs text-[#A0A0A0]">
            Incluye detalles como fechas de vencimiento, prioridad, estimaciones de tiempo y categorías/etiquetas
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
            Cancelar
          </button>
          <button
            onClick={handleParse}
            className="px-6 py-2 bg-[#4ECDC4] text-black rounded-lg hover:bg-[#45B7B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            disabled={isLoading || !naturalInput.trim()}
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                Procesando...
              </>
            ) : (
              <>
                <span>✨</span>
                Procesar con IA
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
            Vista Previa de Tarea IA
          </h3>
          <p className="text-[#A0A0A0] text-sm">
            Revisa los detalles de la tarea procesada antes de crear
          </p>
        </div>
        
        <div className="bg-[#242426] border border-white/8 rounded-lg p-6 space-y-4">
          <div>
            <h4 className="text-xl font-medium text-white">{parsedTask.title}</h4>
          </div>
          
          {parsedTask.description && (
            <div>
              <p className="text-sm text-[#A0A0A0] mb-1">Descripción</p>
              <p className="text-white">{parsedTask.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#A0A0A0] mb-1">Prioridad</p>
              <p className={`font-medium ${getPriorityColor(parsedTask.priority)}`}>
                {parsedTask.priority}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-[#A0A0A0] mb-1">Fecha de Vencimiento</p>
              <p className="text-white">{formatDate(parsedTask.due_date)}</p>
            </div>
            
            {parsedTask.estimated_duration && (
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">Duración Estimada</p>
                <p className="text-white">
                  {parsedTask.estimated_duration < 60 
                    ? `${parsedTask.estimated_duration} minutos`
                    : `${Math.round(parsedTask.estimated_duration / 60)} horas`
                  }
                </p>
              </div>
            )}
          </div>
          
          {parsedTask.tags && parsedTask.tags.length > 0 && (
            <div>
              <p className="text-sm text-[#A0A0A0] mb-2">Etiquetas</p>
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
          <p className="text-sm text-[#A0A0A0] mb-2">Entrada original:</p>
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
            ← Atrás
          </button>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleConfirmPreview}
              className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
              disabled={isLoading}
            >
              Editar Detalles
            </button>
            <button
              onClick={handleCreateFromAI}
              className="px-6 py-2 bg-[#4ECDC4] text-black rounded-lg hover:bg-[#45B7B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Creando...' : 'Crear Tarea'}
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
            Editar Detalles de la Tarea
          </h3>
          <p className="text-[#A0A0A0] text-sm">
            Ajusta los detalles de la tarea antes de crear
          </p>
        </div>
        
        <TaskForm
          initialData={initialData}
          categories={categories}
          tags={tags}
          goals={goals}
          selectedGoalId={selectedGoalId}
          onSubmit={onTaskCreated}
          onCancel={() => setStep('preview')}
        />
      </div>
    );
  }
  
  return null;
}