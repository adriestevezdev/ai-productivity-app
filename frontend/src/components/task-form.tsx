'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TaskCreate, TaskUpdate, TaskStatus, TaskPriority, TaskCategory, TaskTag } from '@/types/task';
import { useTasks } from '@/hooks/use-tasks';

interface TaskFormProps {
  initialData?: Partial<TaskCreate & { id?: number }>;
  categories: TaskCategory[];
  tags: TaskTag[];
  onSubmit?: (data: TaskCreate | TaskUpdate) => void;
  onCancel?: () => void;
  isEdit?: boolean;
}

export function TaskForm({ 
  initialData = {}, 
  categories, 
  tags, 
  onSubmit, 
  onCancel,
  isEdit = false 
}: TaskFormProps) {
  const { createTask, updateTask } = useTasks();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<TaskCreate>({
    title: initialData.title || '',
    description: initialData.description || '',
    status: initialData.status || TaskStatus.TODO,
    priority: initialData.priority || TaskPriority.MEDIUM,
    due_date: initialData.due_date || '',
    estimated_hours: initialData.estimated_hours || undefined,
    category_id: initialData.category_id || undefined,
    parent_task_id: initialData.parent_task_id || undefined,
    tag_ids: initialData.tag_ids || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit && initialData.id) {
        const updateData: TaskUpdate = {};
        // Only include changed fields
        Object.keys(formData).forEach((key) => {
          const k = key as keyof TaskCreate;
          if (formData[k] !== initialData[k]) {
            (updateData as any)[k] = formData[k];
          }
        });
        
        if (Object.keys(updateData).length > 0) {
          const updated = await updateTask(initialData.id, updateData);
          onSubmit?.(updateData);
        }
      } else {
        const created = await createTask(formData);
        onSubmit?.(formData);
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
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
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
          placeholder="Enter task title"
          required
        />
      </div>

      {/* Description with Markdown */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="description" className="block text-sm font-medium text-white">
            Description
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-[#4ECDC4] hover:text-[#45B7B8] transition-colors"
          >
            {showPreview ? 'Edit' : 'Preview'}
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
            className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20 resize-none"
            placeholder="Enter task description (Markdown supported)"
          />
        )}
        <p className="mt-1 text-xs text-[#A0A0A0]">
          Supports Markdown formatting: **bold**, *italic*, `code`, etc.
        </p>
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
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
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
            <option value={TaskStatus.ARCHIVED}>Archived</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-white mb-2">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
          >
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.URGENT}>Urgent</option>
          </select>
        </div>
      </div>

      {/* Due Date and Estimated Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-white mb-2">
            Due Date
          </label>
          <input
            type="datetime-local"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
          />
        </div>

        <div>
          <label htmlFor="estimated_hours" className="block text-sm font-medium text-white mb-2">
            Estimated Hours
          </label>
          <input
            type="number"
            id="estimated_hours"
            name="estimated_hours"
            value={formData.estimated_hours || ''}
            onChange={handleChange}
            min="0"
            className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
            placeholder="0"
          />
        </div>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-white mb-2">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id || ''}
            onChange={handleChange}
            className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
          >
            <option value="">No category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon && `${category.icon} `}{category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Tags
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
          className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (isEdit ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
}