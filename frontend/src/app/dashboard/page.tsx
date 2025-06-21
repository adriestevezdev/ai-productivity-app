'use client';

import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="text-gray-600 mb-6">
          This is your productivity dashboard. Here you can manage your tasks, view your calendar, and track your progress.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasks Today</h3>
            <p className="text-3xl font-bold text-indigo-600">0</p>
            <p className="text-sm text-gray-500 mt-1">No tasks scheduled</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed This Week</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500 mt-1">Start adding tasks</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Productivity Score</h3>
            <p className="text-3xl font-bold text-purple-600">--</p>
            <p className="text-sm text-gray-500 mt-1">Complete tasks to build score</p>
          </div>
        </div>
      </div>
    </div>
  );
}