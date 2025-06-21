'use client';

import { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, TaskFilters } from '@/types/task';
import { TaskCard } from './task-card';
import { TaskFiltersComponent } from './task-filters';

interface TaskListViewProps {
  tasks: Task[];
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
}

export function TaskListView({ tasks, onTaskUpdate, onTaskDelete }: TaskListViewProps) {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'created'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    if (filters.category_id) {
      filtered = filtered.filter(task => task.category_id === filters.category_id);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
      );
    }

    // Sort tasks
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          if (!a.due_date && !b.due_date) comparison = 0;
          else if (!a.due_date) comparison = 1;
          else if (!b.due_date) comparison = -1;
          else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [tasks, filters, sortBy, sortOrder]);

  const taskGroups = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    
    filteredAndSortedTasks.forEach(task => {
      const key = task.status;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    return groups;
  }, [filteredAndSortedTasks]);

  return (
    <div className="p-6 space-y-6">
      {/* Filters and sorting */}
      <div className="bg-[#1A1A1C] rounded-xl p-4 border border-white/8">
        <TaskFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          categories={[]} // You would pass actual categories here
          tags={[]} // You would pass actual tags here
        />
        
        {/* Sorting controls */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/8">
          <label className="text-sm text-[#A0A0A0]">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#242426] text-white px-3 py-1.5 rounded-lg text-sm border border-white/8 focus:outline-none focus:border-[#4ECDC4]"
          >
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="created">Created Date</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-[#A0A0A0] hover:text-white transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-6">
        {Object.entries(taskGroups).map(([status, tasks]) => (
          <div key={status} className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>{status.replace('_', ' ')}</span>
              <span className="text-sm text-[#A0A0A0] bg-white/5 px-2 py-1 rounded-full">
                {tasks.length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                />
              ))}
            </div>
          </div>
        ))}
        
        {filteredAndSortedTasks.length === 0 && (
          <div className="text-center py-12 text-[#A0A0A0]">
            <p className="text-lg mb-2">No tasks found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}