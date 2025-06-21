'use client';

import { useState, useEffect } from 'react';
import { useUser, UserButton } from "@clerk/nextjs";
import { Task, TaskCategory, TaskTag, TaskStatus } from '@/types/task';
import { useTasks } from '@/hooks/use-tasks';
import { TaskForm } from '@/components/task-form';
import { useAuth } from '@clerk/nextjs';
import { ChevronRightIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const {
    getTasks,
    getCategories,
    getTags,
    updateTaskStatus,
    loading,
    error
  } = useTasks();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [tags, setTags] = useState<TaskTag[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [personalExpanded, setPersonalExpanded] = useState(true);
  const [teamExpanded, setTeamExpanded] = useState(true);
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'assistant', content: string}>>([]);

  // Load initial data
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      loadData();
    }
  }, [authLoaded, isSignedIn]);

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

  const handleTaskCreate = async () => {
    setShowTaskForm(false);
    await loadData();
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

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { type: 'user', content: chatInput }]);
      // Here you would integrate with AI to get response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          type: 'assistant', 
          content: 'I understand you want to: ' + chatInput + '. I can help you create tasks for this.'
        }]);
      }, 1000);
      setChatInput('');
    }
  };

  if (!userLoaded || !authLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0B]">
        <div className="text-[#A0A0A0]">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0B]">
        <div className="text-[#A0A0A0]">Please sign in to view your dashboard.</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0B]">
      {/* Left Sidebar */}
      <aside className="w-56 bg-[#1A1A1C] border-r border-white/10 flex flex-col">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-white rounded"></div>
            <h1 className="text-lg font-semibold text-white">productiv.ai</h1>
          </div>

          {/* Today */}
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#242426] text-[#A0A0A0] hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Today
          </button>

          {/* Personal Section */}
          <div className="mt-6">
            <button 
              onClick={() => setPersonalExpanded(!personalExpanded)}
              className="w-full flex items-center gap-1 px-3 py-2 text-[#A0A0A0] hover:text-white transition-all"
            >
              {personalExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal
              <PlusIcon className="w-4 h-4 ml-auto" />
            </button>
            {personalExpanded && (
              <div className="ml-8 mt-1">
                <button className="w-full text-left px-3 py-1 text-sm text-[#606060] hover:text-[#A0A0A0] transition-all">
                  + New project
                </button>
              </div>
            )}
          </div>

          {/* Team Section */}
          <div className="mt-6">
            <button 
              onClick={() => setTeamExpanded(!teamExpanded)}
              className="w-full flex items-center gap-1 px-3 py-2 text-[#A0A0A0] hover:text-white transition-all"
            >
              {teamExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Team
            </button>
          </div>
        </div>

        {/* Chats Section */}
        <div className="mt-auto border-t border-white/10">
          <div className="p-4">
            <button 
              onClick={() => setChatsExpanded(!chatsExpanded)}
              className="w-full flex items-center gap-1 px-3 py-2 text-[#A0A0A0] hover:text-white transition-all"
            >
              {chatsExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
              Chats
            </button>
            {chatsExpanded && (
              <div className="mt-2 space-y-1">
                <div className="px-3 py-2 rounded-lg bg-[#242426] text-white text-sm cursor-pointer">
                  <div className="font-medium">plan steps for a community...</div>
                  <div className="text-xs text-[#606060]">Jun 21 • Active</div>
                </div>
                <div className="px-3 py-2 rounded-lg hover:bg-[#242426] text-[#A0A0A0] hover:text-white text-sm cursor-pointer transition-all">
                  <div>Hello Productiv! I am new here...</div>
                  <div className="text-xs text-[#606060]">May 24</div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: "bg-[#1A1A1C] border border-white/8",
                    userButtonPopoverMain: "bg-[#1A1A1C]",
                    userButtonPopoverFooter: "bg-[#1A1A1C] border-t border-white/8",
                    userButtonPopoverActionButton: "text-white hover:bg-[#242426]",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverActionButtonIcon: "text-[#A0A0A0]"
                  }
                }}
              />
              <div className="text-sm">
                <div className="text-white">{user?.firstName || 'User'}</div>
                <div className="text-xs text-[#606060]">Productiv Free</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Center Chat Area */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          {chatMessages.length === 0 ? (
            <div className="text-center max-w-2xl">
              <div className="w-24 h-24 bg-[#242426] rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-[#4ECDC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-6">What can I help with?</h2>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setChatInput('plan steps for a community growth')}
                  className="w-full px-6 py-3 bg-[#242426] text-[#A0A0A0] rounded-lg hover:bg-[#2A2A2C] hover:text-white transition-all"
                >
                  plan steps for a community growth
                </button>
                <button 
                  onClick={() => setChatInput('brainstorm AI SaaS project ideas')}
                  className="w-full px-6 py-3 bg-[#242426] text-[#A0A0A0] rounded-lg hover:bg-[#2A2A2C] hover:text-white transition-all"
                >
                  brainstorm AI SaaS project ideas
                </button>
                <button 
                  onClick={() => setChatInput('outline Agent as a Service roadmap')}
                  className="w-full px-6 py-3 bg-[#242426] text-[#A0A0A0] rounded-lg hover:bg-[#2A2A2C] hover:text-white transition-all"
                >
                  outline Agent as a Service roadmap
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-4 py-2 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-[#4ECDC4] text-black' 
                      : 'bg-[#242426] text-white'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message Productiv..."
                className="w-full px-4 py-3 bg-[#242426] text-white rounded-lg pr-12 placeholder-[#606060] focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#606060] hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-[#606060]">
              <span className="flex items-center gap-1">
                <span className="text-[#8B5CF6]">●</span> GPT 4.1
              </span>
              <button className="flex items-center gap-1 hover:text-[#A0A0A0]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Agent
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Right Tasks Sidebar */}
      <aside className="w-80 bg-[#1A1A1C] border-l border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">productiv.ai</h2>
          <div className="flex items-center gap-2">
            <button className="p-1 text-[#606060] hover:text-white transition-all">
              <PlusIcon className="w-5 h-5" />
            </button>
            <button className="p-1 text-[#606060] hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <button className="p-1 text-[#606060] hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
            <span className="text-xs text-[#606060] bg-[#242426] px-2 py-1 rounded">0 1</span>
          </div>
        </div>

        <div className="mb-4">
          <button className="flex items-center gap-2 text-sm text-[#A0A0A0]">
            <span className="text-[#606060]">●</span>
            All Personal Tasks
            <ChevronDownIcon className="w-4 h-4 ml-auto" />
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-[#606060]">
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Tasks created in chat will appear here</p>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="p-3 bg-[#242426] rounded-lg hover:bg-[#2A2A2C] transition-all cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={task.status === TaskStatus.COMPLETED}
                    onChange={async () => {
                      const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED;
                      try {
                        const updatedTask = await updateTaskStatus(task.id, newStatus);
                        handleTaskUpdate(updatedTask);
                      } catch (error) {
                        console.error('Failed to update task status:', error);
                      }
                    }}
                    className="mt-1 rounded border-[#606060] bg-transparent"
                  />
                  <div className="flex-1">
                    <h3 className={`text-sm ${task.status === TaskStatus.COMPLETED ? 'text-[#606060] line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-[#606060] mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {task.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          task.priority === 'high' 
                            ? 'bg-red-500/20 text-red-400'
                            : task.priority === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="text-xs text-[#606060]">
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Completed tasks toggle */}
        {tasks.some(t => t.status === TaskStatus.COMPLETED) && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <button className="text-sm text-[#606060] hover:text-[#A0A0A0] transition-all">
              completed tasks
            </button>
          </div>
        )}
      </aside>

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