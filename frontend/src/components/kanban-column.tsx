'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task, KanbanColumn as KanbanColumnType } from '@/types/task';
import { SortableTaskCard } from './sortable-task-card';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
}

export function KanbanColumn({ column, onTaskUpdate, onTaskDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map((task) => task.id);

  const getColumnColor = () => {
    switch (column.id) {
      case 'todo':
        return 'border-gray-600';
      case 'in_progress':
        return 'border-blue-600';
      case 'completed':
        return 'border-green-600';
      default:
        return 'border-gray-600';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col min-w-[380px] max-w-[380px] 
        bg-[#1A1A1C] rounded-xl border-2 
        ${getColumnColor()}
        ${isOver ? 'border-[#4ECDC4] border-dashed' : 'border-solid'}
        transition-all duration-200
      `}
    >
      {/* Column header */}
      <div className="p-4 border-b border-white/8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{column.title}</h3>
          <span className="text-sm text-[#A0A0A0] bg-white/5 px-2 py-1 rounded-full">
            {column.tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {column.tasks.length === 0 && (
          <div className="text-center py-12 text-[#A0A0A0]">
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs mt-1">Drag tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}