'use client';

import { useState } from 'react';
import { GoalCreate, GoalUpdate, GoalType, GoalStatus } from '@/types/task';
import { useTasks } from '@/hooks/use-tasks';

interface GoalFormProps {
  initialData?: Partial<GoalCreate & { id?: number }>;
  onSubmit?: (data: GoalCreate | GoalUpdate) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

const goalIcons = [
  '🎯', '🚀', '💡', '📈', '🏆', '⭐', '🎨', '💪', '🧠', '🔬',
  '📚', '💰', '🏃‍♂️', '🌟', '🎪', '🔥', '💎', '🎵', '🌱', '⚡'
];

const goalColors = [
  '#4ECDC4', '#FF6B6B', '#FFE66D', '#A8E6CF', '#FFA07A', 
  '#98D8E8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471'
];

export function GoalForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel,
  isEdit = false 
}: GoalFormProps) {
  const { createGoal, updateGoal } = useTasks();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<GoalCreate>({
    title: initialData.title ?? '',
    description: initialData.description ?? '',
    goal_type: initialData.goal_type ?? GoalType.PROFESSIONAL,
    status: initialData.status ?? GoalStatus.ACTIVE,
    target_date: initialData.target_date ?? '',
    is_specific: initialData.is_specific ?? false,
    is_measurable: initialData.is_measurable ?? false,
    is_achievable: initialData.is_achievable ?? false,
    is_relevant: initialData.is_relevant ?? false,
    is_time_bound: initialData.is_time_bound ?? false,
    color: initialData.color ?? goalColors[0],
    icon: initialData.icon ?? goalIcons[0],
  });

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Project title must be less than 200 characters';
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    if (formData.target_date && new Date(formData.target_date) < new Date()) {
      newErrors.target_date = 'Target date cannot be in the past';
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
      // Calculate SMART score
      const smartChecks = [
        formData.is_specific,
        formData.is_measurable, 
        formData.is_achievable,
        formData.is_relevant,
        formData.is_time_bound
      ];
      const smart_score = (smartChecks.filter(Boolean).length / smartChecks.length) * 100;

      const goalData = {
        ...formData,
        smart_score,
        progress_percentage: initialData.progress_percentage ?? 0
      };

      if (isEdit && initialData.id) {
        const updateData: GoalUpdate = {};
        // Only include changed fields
        (Object.keys(goalData) as Array<keyof GoalCreate>).forEach((key) => {
          if (goalData[key] !== initialData[key]) {
            (updateData as Record<string, unknown>)[key] = goalData[key];
          }
        });
        
        if (Object.keys(updateData).length > 0) {
          await updateGoal(initialData.id, updateData);
          onSubmit?.(updateData);
        } else {
          onCancel?.();
        }
      } else {
        await createGoal(goalData);
        onSubmit?.(goalData);
      }
    } catch (error: unknown) {
      console.error('Failed to save goal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save project. Please try again.';
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
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
          Project Title *
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
          placeholder="Enter project title"
          required
        />
        {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`w-full bg-[#242426] text-white px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 resize-none transition-colors ${
            errors.description 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-white/8 focus:border-[#4ECDC4] focus:ring-[#4ECDC4]/20'
          }`}
          placeholder="Describe your project goals and objectives..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
      </div>

      {/* Type and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="goal_type" className="block text-sm font-medium text-white mb-2">
            Type
          </label>
          <select
            id="goal_type"
            name="goal_type"
            value={formData.goal_type}
            onChange={handleChange}
            className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
          >
            <option value={GoalType.PROFESSIONAL}>Professional</option>
            <option value={GoalType.PERSONAL}>Personal</option>
            <option value={GoalType.HEALTH}>Health</option>
            <option value={GoalType.LEARNING}>Learning</option>
            <option value={GoalType.FINANCIAL}>Financial</option>
            <option value={GoalType.CREATIVE}>Creative</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
          >
            <option value={GoalStatus.ACTIVE}>Active</option>
            <option value={GoalStatus.COMPLETED}>Completed</option>
            <option value={GoalStatus.PAUSED}>Paused</option>
            <option value={GoalStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Target Date */}
      <div>
        <label htmlFor="target_date" className="block text-sm font-medium text-white mb-2">
          Target Date
        </label>
        <input
          type="date"
          id="target_date"
          name="target_date"
          value={formData.target_date}
          onChange={handleChange}
          className={`w-full bg-[#242426] text-white px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors ${
            errors.target_date 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-white/8 focus:border-[#4ECDC4] focus:ring-[#4ECDC4]/20'
          }`}
        />
        {errors.target_date && <p className="mt-1 text-sm text-red-400">{errors.target_date}</p>}
      </div>

      {/* SMART Criteria */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          SMART Criteria
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_specific"
              checked={formData.is_specific}
              onChange={handleChange}
              className="rounded border-[#606060] bg-transparent text-[#4ECDC4] focus:ring-[#4ECDC4] focus:ring-offset-0"
            />
            <span className="text-sm text-white">Specific - Clear and well-defined</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_measurable"
              checked={formData.is_measurable}
              onChange={handleChange}
              className="rounded border-[#606060] bg-transparent text-[#4ECDC4] focus:ring-[#4ECDC4] focus:ring-offset-0"
            />
            <span className="text-sm text-white">Measurable - Progress can be tracked</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_achievable"
              checked={formData.is_achievable}
              onChange={handleChange}
              className="rounded border-[#606060] bg-transparent text-[#4ECDC4] focus:ring-[#4ECDC4] focus:ring-offset-0"
            />
            <span className="text-sm text-white">Achievable - Realistic and attainable</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_relevant"
              checked={formData.is_relevant}
              onChange={handleChange}
              className="rounded border-[#606060] bg-transparent text-[#4ECDC4] focus:ring-[#4ECDC4] focus:ring-offset-0"
            />
            <span className="text-sm text-white">Relevant - Aligned with your objectives</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_time_bound"
              checked={formData.is_time_bound}
              onChange={handleChange}
              className="rounded border-[#606060] bg-transparent text-[#4ECDC4] focus:ring-[#4ECDC4] focus:ring-offset-0"
            />
            <span className="text-sm text-white">Time-bound - Has a clear deadline</span>
          </label>
        </div>
      </div>

      {/* Icon Selection */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Icon
        </label>
        <div className="grid grid-cols-10 gap-2">
          {goalIcons.map(icon => (
            <button
              key={icon}
              type="button"
              onClick={() => handleIconSelect(icon)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                formData.icon === icon
                  ? 'bg-[#4ECDC4] text-black'
                  : 'bg-[#242426] text-white hover:bg-[#2A2A2C]'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Color
        </label>
        <div className="grid grid-cols-10 gap-2">
          {goalColors.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorSelect(color)}
              className={`w-10 h-10 rounded-lg transition-all ${
                formData.color === color
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1A1A1C]'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

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
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-[#4ECDC4] text-black rounded-lg hover:bg-[#45B7B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
        </button>
      </div>
    </form>
  );
}