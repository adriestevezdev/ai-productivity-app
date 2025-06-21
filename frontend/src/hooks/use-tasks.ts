'use client';

import { useState, useCallback } from 'react';
import { useApiClient } from '@/lib/api';
import {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskStatusUpdate,
  TaskPositionUpdate,
  TaskList,
  TaskCategory,
  TaskCategoryCreate,
  TaskCategoryUpdate,
  TaskTag,
  TaskTagCreate,
  TaskTagUpdate,
  TaskFilters,
  TaskStatus
} from '@/types/task';

export function useTasks() {
  const api = useApiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Task operations
  const getTasks = useCallback(async (filters?: TaskFilters & { skip?: number; limit?: number }): Promise<TaskList> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<TaskList>('/api/tasks', filters);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const getTask = useCallback(async (taskId: number): Promise<Task> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Task>(`/api/tasks/${taskId}`);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createTask = useCallback(async (taskData: TaskCreate): Promise<Task> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post<Task>('/api/tasks', taskData);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const updateTask = useCallback(async (taskId: number, taskData: TaskUpdate): Promise<Task> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.put<Task>(`/api/tasks/${taskId}`, taskData);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const updateTaskStatus = useCallback(async (taskId: number, status: TaskStatus): Promise<Task> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.patch<Task>(`/api/tasks/${taskId}/status`, { status });
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const updateTaskPosition = useCallback(async (taskId: number, positionData: TaskPositionUpdate): Promise<Task> => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await api.patch<Task>(`/api/tasks/${taskId}/position`, positionData);
      return updatedTask;
    } catch (err: any) {
      setError(err.message || 'Failed to update task position');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const deleteTask = useCallback(async (taskId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/tasks/${taskId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Category operations
  const getCategories = useCallback(async (): Promise<TaskCategory[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<TaskCategory[]>('/api/task-categories');
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createCategory = useCallback(async (categoryData: TaskCategoryCreate): Promise<TaskCategory> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post<TaskCategory>('/api/task-categories', categoryData);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const updateCategory = useCallback(async (categoryId: number, categoryData: TaskCategoryUpdate): Promise<TaskCategory> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.put<TaskCategory>(`/api/task-categories/${categoryId}`, categoryData);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const deleteCategory = useCallback(async (categoryId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/task-categories/${categoryId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Tag operations
  const getTags = useCallback(async (): Promise<TaskTag[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<TaskTag[]>('/api/task-tags');
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tags');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createTag = useCallback(async (tagData: TaskTagCreate): Promise<TaskTag> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post<TaskTag>('/api/task-tags', tagData);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to create tag');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const updateTag = useCallback(async (tagId: number, tagData: TaskTagUpdate): Promise<TaskTag> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.put<TaskTag>(`/api/task-tags/${tagId}`, tagData);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to update tag');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const deleteTag = useCallback(async (tagId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/task-tags/${tagId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete tag');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  return {
    loading,
    error,
    // Task operations
    getTasks,
    getTask,
    createTask,
    updateTask,
    updateTaskStatus,
    updateTaskPosition,
    deleteTask,
    // Category operations
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    // Tag operations
    getTags,
    createTag,
    updateTag,
    deleteTag
  };
}