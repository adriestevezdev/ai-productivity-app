'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task, TaskStatus, KanbanColumn } from '@/types/task';
import { useTasks } from '@/hooks/use-tasks';
import { KanbanColumn as KanbanColumnComponent } from './kanban-column';
import { TaskCard } from './task-card';

const COLUMNS: KanbanColumn[] = [
  { id: TaskStatus.TODO, title: 'To Do', tasks: [] },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress', tasks: [] },
  { id: TaskStatus.COMPLETED, title: 'Completed', tasks: [] },
];

interface KanbanBoardProps {
  initialTasks?: Task[];
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
}

export function KanbanBoard({ initialTasks = [], onTaskUpdate, onTaskDelete }: KanbanBoardProps) {
  const { updateTaskPosition } = useTasks();
  const [columns, setColumns] = useState<KanbanColumn[]>(COLUMNS);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update columns when tasks change
  useEffect(() => {
    const newColumns = COLUMNS.map(column => ({
      ...column,
      tasks: initialTasks
        .filter(task => task.status === column.id)
        .sort((a, b) => a.position - b.position),
    }));
    setColumns(newColumns);
  }, [initialTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(Number(active.id));
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    // Find the containers
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setColumns((prev) => {
      const activeItems = prev.find((col) => col.id === activeContainer)?.tasks || [];
      const overItems = prev.find((col) => col.id === overContainer)?.tasks || [];

      // Find the indices
      const activeIndex = activeItems.findIndex((task) => task.id === activeId);
      const overIndex = overItems.findIndex((task) => task.id === Number(overId));

      let newIndex;
      if (overId in TaskStatus) {
        // We're over a container
        newIndex = overItems.length;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;
        const modifier = isBelowLastItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return prev.map((col) => {
        if (col.id === activeContainer) {
          return {
            ...col,
            tasks: col.tasks.filter((task) => task.id !== activeId),
          };
        }
        if (col.id === overContainer) {
          const task = activeItems[activeIndex];
          const updatedTask = { ...task, status: col.id };
          const newTasks = [...col.tasks];
          newTasks.splice(newIndex, 0, updatedTask);
          return {
            ...col,
            tasks: newTasks,
          };
        }
        return col;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) {
      return;
    }

    const activeIndex = columns
      .find((col) => col.id === activeContainer)
      ?.tasks.findIndex((task) => task.id === activeId) || 0;
    
    const overIndex = columns
      .find((col) => col.id === overContainer)
      ?.tasks.findIndex((task) => task.id === Number(overId)) || 0;

    if (activeContainer !== overContainer) {
      // Moving to a different column
      try {
        const newPosition = overId in TaskStatus ? 0 : overIndex;
        const updatedTask = await updateTaskPosition(activeId, {
          position: newPosition,
          status: overContainer as TaskStatus,
        });
        onTaskUpdate?.(updatedTask);
      } catch (error) {
        console.error('Failed to update task position:', error);
        // Revert the change
        setColumns(COLUMNS.map(column => ({
          ...column,
          tasks: initialTasks
            .filter(task => task.status === column.id)
            .sort((a, b) => a.position - b.position),
        })));
      }
    } else if (activeIndex !== overIndex) {
      // Reordering within the same column
      setColumns((prev) => {
        return prev.map((col) => {
          if (col.id === activeContainer) {
            const newTasks = arrayMove(col.tasks, activeIndex, overIndex);
            // Update positions
            updatePositions(newTasks, col.id as TaskStatus);
            return {
              ...col,
              tasks: newTasks,
            };
          }
          return col;
        });
      });
    }

    setActiveTask(null);
  };

  const updatePositions = async (tasks: Task[], status: TaskStatus) => {
    // Update positions for all tasks in the column
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].position !== i) {
        try {
          await updateTaskPosition(tasks[i].id, {
            position: i,
            status: status,
          });
        } catch (error) {
          console.error('Failed to update task position:', error);
        }
      }
    }
  };

  const findTaskById = (id: number): Task | undefined => {
    for (const column of columns) {
      const task = column.tasks.find((task) => task.id === id);
      if (task) return task;
    }
    return undefined;
  };

  const findContainer = (id: number | string): TaskStatus | undefined => {
    if (id in TaskStatus) {
      return id as TaskStatus;
    }
    const numId = typeof id === 'string' ? parseInt(id) : id;
    for (const column of columns) {
      if (column.tasks.find((task) => task.id === numId)) {
        return column.id;
      }
    }
    return undefined;
  };

  return (
    <div className="flex gap-6 p-6 overflow-x-auto min-h-[600px]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
          />
        ))}
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}