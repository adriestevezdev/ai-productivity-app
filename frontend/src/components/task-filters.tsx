'use client';

import { TaskStatus, TaskPriority, TaskCategory, TaskTag, TaskFilters } from '@/types/task';

interface TaskFiltersComponentProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  categories: TaskCategory[];
  tags: TaskTag[];
}

export function TaskFiltersComponent({ 
  filters, 
  onFiltersChange, 
  categories, 
  tags 
}: TaskFiltersComponentProps) {
  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    if (value === 'all' || value === '') {
      const { [key]: _, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, [key]: value });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full bg-[#242426] text-white px-4 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4] placeholder-[#A0A0A0]"
        />
      </div>

      {/* Status filter */}
      <select
        value={filters.status || 'all'}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        className="bg-[#242426] text-white px-3 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4]"
      >
        <option value="all">All Status</option>
        <option value={TaskStatus.TODO}>To Do</option>
        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
        <option value={TaskStatus.COMPLETED}>Completed</option>
        <option value={TaskStatus.ARCHIVED}>Archived</option>
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority || 'all'}
        onChange={(e) => handleFilterChange('priority', e.target.value)}
        className="bg-[#242426] text-white px-3 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4]"
      >
        <option value="all">All Priorities</option>
        <option value={TaskPriority.URGENT}>Urgent</option>
        <option value={TaskPriority.HIGH}>High</option>
        <option value={TaskPriority.MEDIUM}>Medium</option>
        <option value={TaskPriority.LOW}>Low</option>
      </select>

      {/* Category filter */}
      {categories.length > 0 && (
        <select
          value={filters.category_id || 'all'}
          onChange={(e) => handleFilterChange('category_id', e.target.value === 'all' ? null : Number(e.target.value))}
          className="bg-[#242426] text-white px-3 py-2 rounded-lg border border-white/8 focus:outline-none focus:border-[#4ECDC4]"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      )}

      {/* Clear filters */}
      {(filters.search || filters.status || filters.priority || filters.category_id) && (
        <button
          onClick={() => onFiltersChange({})}
          className="text-[#FF6B6B] hover:text-[#FF5252] transition-colors text-sm"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}