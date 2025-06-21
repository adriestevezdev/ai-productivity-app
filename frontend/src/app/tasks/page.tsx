'use client';

import { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskTag } from '@/types/task';
import { useTasks } from '@/hooks/use-tasks';
import { KanbanBoard } from '@/components/kanban-board';
import { TaskListView } from '@/components/task-list-view';
import { TaskForm } from '@/components/task-form';
import { useAuth } from '@clerk/nextjs';

export default function TasksPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const {
    getTasks,
    getCategories,
    getTags,
    loading,
    error
  } = useTasks();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [tags, setTags] = useState<TaskTag[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load initial data
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadData();
    }
  }, [isLoaded, isSignedIn]);

  const loadData = async () => {
    try {
      const [tasksData, categoriesData, tagsData] = await Promise.all([
        getTasks(),
        getCategories(),
        getTags()
      ]);
      
      setTasks(tasksData.tasks);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };
  
  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading authentication...</div>
      </div>
    );
  }
  
  // Redirect if not signed in
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Please sign in to view your tasks.</div>
      </div>
    );
  }

  const handleTaskCreate = async () => {
    setShowTaskForm(false);
    await loadData(); // Reload all tasks
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setEditingTask(null);
  };

  const handleTaskDelete = async (taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#A0A0A0]">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Header */}
      <div className="border-b border-white/8 bg-[#1A1A1C]">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Tasks</h1>
            
            <div className="flex items-center gap-4">
              {/* View mode toggle */}
              <div className="flex items-center bg-[#242426] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-[#4ECDC4] text-black'
                      : 'text-[#A0A0A0] hover:text-white'
                  }`}
                >
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#4ECDC4] text-black'
                      : 'text-[#A0A0A0] hover:text-white'
                  }`}
                >
                  List
                </button>
              </div>
              
              {/* Create task button */}
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#FF5252] transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1920px] mx-auto">
        {viewMode === 'kanban' ? (
          <KanbanBoard
            initialTasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        ) : (
          <TaskListView
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        )}
      </div>

      {/* Task form modal */}
      {(showTaskForm || editingTask) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-[#1A1A1C] rounded-xl border border-white/8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <TaskForm
                initialData={editingTask || undefined}
                categories={categories}
                tags={tags}
                onSubmit={editingTask ? () => handleTaskUpdate(editingTask) : handleTaskCreate}
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
                isEdit={!!editingTask}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}