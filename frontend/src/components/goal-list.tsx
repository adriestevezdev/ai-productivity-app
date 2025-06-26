
'use client';

import { useState, useEffect } from 'react';
import { Goal } from '@/types/goal'; // Assuming you have a goal type defined
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

interface GoalListProps {
  // Props if needed
}

export function GoalList({}: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await apiClient.get('/goals');
      setGoals(response.data.goals);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (window.confirm('Are you sure you want to delete this goal and all its tasks?')) {
      try {
        await apiClient.delete(`/goals/${goalId}`);
        setGoals(goals.filter((goal) => goal.id !== goalId));
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Goals</h2>
      {goals.map((goal) => (
        <div key={goal.id} className="flex items-center justify-between p-4 border rounded-lg">
          <span>{goal.title}</span>
          <Button variant="destructive" onClick={() => handleDeleteGoal(goal.id)}>
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
}
