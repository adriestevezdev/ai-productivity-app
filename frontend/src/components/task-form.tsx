'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TaskCreate, TaskUpdate, TaskStatus, TaskPriority, TaskCategory, TaskTag, Goal } from '@/types/task';
import { useTasks } from '@/hooks/use-tasks';

interface TaskFormProps {
  initialData?: Partial<TaskCreate & { id?: number }>;
  categories: TaskCategory[];
  tags: TaskTag[];
  goals: Goal[];
  selectedGoalId?: number | null;
  onSubmit?: (data: TaskCreate | TaskUpdate) => void;
  onCancel?: () => void;
  isEdit?: boolean;
  showSuccess?: (title: string, message?: string) => void;
  showError?: (title: string, message?: string) => void;
}

export function TaskForm({ 
  initialData = {}, 
  categories, 
  tags,
  goals,
  selectedGoalId,
  onSubmit, 
  onCancel,
  isEdit = false,
  showSuccess,
  showError
}: TaskFormProps) {
  const { createTask, updateTask } = useTasks();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<TaskCreate>({
    title: initialData.title ?? '',
    description: initialData.description ?? '',
    status: initialData.status ?? TaskStatus.TODO,
    priority: initialData.priority ?? TaskPriority.MEDIUM,
    due_date: initialData.due_date ?? '',
    estimated_hours: initialData.estimated_hours ?? undefined,
    category_id: initialData.category_id ?? undefined,
    goal_id: initialData.goal_id ?? selectedGoalId ?? undefined,
    parent_task_id: initialData.parent_task_id ?? undefined,
    tag_ids: initialData.tag_ids ?? [],
  });

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título de la tarea es obligatorio';
    } else if (formData.title.length > 200) {
      newErrors.title = 'El título de la tarea debe tener menos de 200 caracteres';
    }
    
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'La descripción debe tener menos de 2000 caracteres';
    }
    
    if (formData.due_date && new Date(formData.due_date) < new Date()) {
      newErrors.due_date = 'La fecha de vencimiento no puede ser en el pasado';
    }
    
    if (formData.estimated_hours && (formData.estimated_hours < 0 || formData.estimated_hours > 1000)) {
      newErrors.estimated_hours = 'Las horas estimadas deben estar entre 0 y 1000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit && initialData.id) {
        const updateData: TaskUpdate = {};
        // Only include changed fields
        (Object.keys(formData) as Array<keyof TaskCreate>).forEach((key) => {
          if (formData[key] !== initialData[key]) {
            (updateData as Record<string, unknown>)[key] = formData[key];
          }
        });
        
        if (Object.keys(updateData).length > 0) {
          await updateTask(initialData.id, updateData);
          showSuccess?.(
            'Tarea actualizada',
            `La tarea "${formData.title}" se ha actualizado correctamente`
          );
          onSubmit?.(updateData);
        } else {
          onCancel?.();
        }
      } else {
        await createTask(formData);
        showSuccess?.(
          'Tarea creada',
          `La tarea "${formData.title}" se ha creado correctamente`
        );
        onSubmit?.(formData);
      }
    } catch (error: unknown) {
      console.error('Failed to save task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la tarea. Por favor, inténtalo de nuevo.';
      showError?.(
        isEdit ? 'Error al actualizar' : 'Error al crear tarea',
        errorMessage
      );
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTagToggle = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids?.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...(prev.tag_ids || []), tagId],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
          Título *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full bg-[#242426] text-white px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
            errors.title 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-white/8 focus:border-[#4ECDC4] focus:ring-[#4ECDC4]/20'
          }`}
          placeholder="Ingresa el título de la tarea"
          required
        />
        {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
      </div>

      {/* Description with Markdown */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="description" className="block text-sm font-medium text-white">
            Descripción
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-[#4ECDC4] hover:text-[#45B7B8] transition-colors"
          >
            {showPreview ? 'Editar' : 'Vista Previa'}
          </button>
        </div>
        
        {showPreview ? (
          <div className="w-full bg-[#242426] text-white px-4 py-3 rounded-lg border border-white/8 min-h-[120px] prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {formData.description || '*No description*'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className={`w-full bg-[#242426] text-white px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 resize-none transition-colors ${
              errors.description 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-white/8 focus:border-[#4ECDC4] focus:ring-[#4ECDC4]/20'
            }`}
            placeholder="Ingresa la descripción de la tarea (Markdown soportado)"
          />
        )}
        {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
        <p className="mt-1 text-xs text-[#A0A0A0]">
          Soporta formato Markdown: **negrita**, *cursiva*, `código`, etc.
        </p>
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
          >
            <option value={TaskStatus.TODO}>Por Hacer</option>
            <option value={TaskStatus.IN_PROGRESS}>En Progreso</option>
            <option value={TaskStatus.COMPLETED}>Completada</option>
            <option value={TaskStatus.ARCHIVED}>Archivada</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-white mb-2">
            Prioridad
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
          >
            <option value={TaskPriority.LOW}>Baja</option>
            <option value={TaskPriority.MEDIUM}>Media</option>
            <option value={TaskPriority.HIGH}>Alta</option>
            <option value={TaskPriority.URGENT}>Urgente</option>
          </select>
        </div>
      </div>

      {/* Due Date and Estimated Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-white mb-2">
            Fecha de Vencimiento
          </label>
          <input
            type="datetime-local"
            id="due_date"
            name="due_date"
            value={formData.due_date ?? ''}
            onChange={handleChange}
            className={`w-full bg-[#242426] text-white px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
              errors.due_date 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-white/8 focus:border-[#4ECDC4] focus:ring-[#4ECDC4]/20'
            }`}
          />
          {errors.due_date && <p className="mt-1 text-sm text-red-400">{errors.due_date}</p>}
        </div>

        <div>
          <label htmlFor="estimated_hours" className="block text-sm font-medium text-white mb-2">
            Horas Estimadas
          </label>
          <input
            type="number"
            id="estimated_hours"
            name="estimated_hours"
            value={formData.estimated_hours ?? ''}
            onChange={handleChange}
            min="0"
            max="1000"
            className={`w-full bg-[#242426] text-white px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
              errors.estimated_hours 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-white/8 focus:border-[#4ECDC4] focus:ring-[#4ECDC4]/20'
            }`}
            placeholder="0"
          />
          {errors.estimated_hours && <p className="mt-1 text-sm text-red-400">{errors.estimated_hours}</p>}
        </div>
      </div>

      {/* Category and Project */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-white mb-2">
            Categoría
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id ?? ''}
            onChange={handleChange}
            className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
          >
            <option value="">Sin categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon && `${category.icon} `}{category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Project/Goal */}
        <div>
          <label htmlFor="goal_id" className="block text-sm font-medium text-white mb-2">
            Proyecto
          </label>
          <select
            id="goal_id"
            name="goal_id"
            value={formData.goal_id ?? ''}
            onChange={handleChange}
            className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
          >
            <option value="">Sin proyecto</option>
            {goals.map(goal => (
              <option key={goal.id} value={goal.id}>
                {goal.icon && `${goal.icon} `}{goal.title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[#A0A0A0]">
            Asigna esta tarea a un proyecto o meta específica
          </p>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Etiquetas
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`
                  px-3 py-1 rounded-full text-sm transition-all
                  ${formData.tag_ids?.includes(tag.id)
                    ? 'bg-opacity-100'
                    : 'bg-opacity-20 hover:bg-opacity-30'
                  }
                `}
                style={{
                  backgroundColor: tag.color || 'rgba(255,255,255,0.1)',
                  color: formData.tag_ids?.includes(tag.id) 
                    ? '#000' 
                    : (tag.color || '#A0A0A0'),
                  borderColor: tag.color || 'rgba(255,255,255,0.2)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error display */}
      {errors.submit && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-[#A0A0A0] hover:text-white transition-colors"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-[#4ECDC4] text-black rounded-lg hover:bg-[#45B7B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : (isEdit ? 'Actualizar Tarea' : 'Crear Tarea')}
        </button>
      </div>
    </form>
  );
}