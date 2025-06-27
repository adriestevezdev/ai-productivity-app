'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, UserButton } from "@clerk/nextjs";
import { Task, TaskCategory, TaskTag, TaskStatus, Goal, GoalType, GoalStatus } from '@/types/task';
import { useApiClient } from '@/lib/api-client';
import { useTasks } from '@/hooks/use-tasks';
import { TaskForm } from '@/components/task-form';
import { AITaskForm } from '@/components/ai-task-form';
import { GoalForm } from '@/components/goal-form';
import { useAuth } from '@clerk/nextjs';
import { ChevronRightIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { UserPlanStatusClient } from '@/components/user-plan-status-client';
import { ProFeatureGateClient } from '@/components/pro-feature-gate-client';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { useConversations, useConversation } from '@/hooks/use-conversations';
import { ConversationStatus } from '@/types/conversation';
import { ConversationAnalysis } from '@/components/conversation-analysis';

export default function DashboardPage() {
  const apiClient = useApiClient();
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const {
    getTasks,
    getCategories,
    getTags,
    getGoals,
    updateTaskStatus,
    deleteTask,
    error
  } = useTasks();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [tags, setTags] = useState<TaskTag[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAITaskForm, setShowAITaskForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [personalExpanded, setPersonalExpanded] = useState(true);
  const [teamExpanded, setTeamExpanded] = useState(true);
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [hasProPlan, setHasProPlan] = useState<boolean | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [chatMode, setChatMode] = useState<'chat' | 'agent'>('chat');
  const [agentProcessing, setAgentProcessing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Use conversation hooks
  const { conversations, createConversation, fetchConversations } = useConversations();
  const { 
    conversation, 
    sendMessage, 
    sendingMessage,
    analyzeConversation,
    generateProject,
    error: conversationError 
  } = useConversation(currentConversationId);

  const loadData = useCallback(async () => {
    try {
      const [tasksData, categoriesData, tagsData, goalsData] = await Promise.all([
        getTasks(),
        getCategories(),
        getTags(),
        getGoals().catch(() => {
          // Fallback to sample goals if API not available yet
          return [
            {
              id: 1,
              title: "AI Productivity App",
              description: "Build a comprehensive productivity app with AI features",
              goal_type: GoalType.PROFESSIONAL,
              status: GoalStatus.ACTIVE,
              target_date: "2024-12-31",
              is_specific: true,
              is_measurable: true,
              is_achievable: true,
              is_relevant: true,
              is_time_bound: true,
              smart_score: 95,
              progress_percentage: 60,
              color: "#4ECDC4",
              icon: "🚀",
              user_id: user?.id || "",
              created_at: new Date().toISOString(),
            },
            {
              id: 2,
              title: "Health & Fitness",
              description: "Improve overall health and fitness level",
              goal_type: GoalType.HEALTH,
              status: GoalStatus.ACTIVE,
              target_date: "2024-06-30",
              is_specific: true,
              is_measurable: true,
              is_achievable: true,
              is_relevant: true,
              is_time_bound: true,
              smart_score: 85,
              progress_percentage: 40,
              color: "#FF6B6B",
              icon: "💪",
              user_id: user?.id || "",
              created_at: new Date().toISOString(),
            },
            {
              id: 3,
              title: "Learn Machine Learning",
              description: "Master ML concepts and implement real projects",
              goal_type: GoalType.LEARNING,
              status: GoalStatus.ACTIVE,
              target_date: "2024-09-30",
              is_specific: true,
              is_measurable: true,
              is_achievable: true,
              is_relevant: true,
              is_time_bound: true,
              smart_score: 90,
              progress_percentage: 25,
              color: "#FFE66D",
              icon: "🧠",
              user_id: user?.id || "",
              created_at: new Date().toISOString(),
            }
          ] as Goal[];
        })
      ]);
      
      setTasks(tasksData.tasks);
      setCategories(categoriesData);
      setTags(tagsData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, [getTasks, getCategories, getTags, getGoals, user?.id]);

  // Load initial data
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      loadData();
    }
  }, [authLoaded, isSignedIn, loadData]);

  // Check Pro plan status
  const { has } = useAuth();
  useEffect(() => {
    async function checkProPlan() {
      if (has) {
        const isPro = await has({ plan: 'pro' });
        setHasProPlan(isPro);
      }
    }
    checkProPlan();
  }, [has]);

  const handleTaskCreate = async () => {
    setShowTaskForm(false);
    await loadData();
  };

  const handleTaskUpdate = async (updatedTask?: Task) => {
    if (updatedTask) {
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } else {
      // If no updatedTask provided, refresh the data
      await loadData();
    }
    setEditingTask(null);
  };

  const handleTaskDelete = async (taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleGoalCreate = async () => {
    setShowGoalForm(false);
    await loadData();
  };

  const handleGoalUpdate = async (updatedGoal?: Goal) => {
    if (updatedGoal) {
      setGoals(prev => prev.map(goal => 
        goal.id === updatedGoal.id ? updatedGoal : goal
      ));
    } else {
      // If no updatedGoal provided, refresh the data
      await loadData();
    }
    setEditingGoal(null);
  };

  const handleGoalDelete = async (goalId: number) => {
    try {
      await apiClient.delete(`/api/goals/${goalId}`);
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setChatInput('');
  };

  const handleDeleteConversation = async (conversationId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      return;
    }
    
    try {
      await apiClient.delete(`/api/conversations/${conversationId}`);
      // Reload conversations list
      await fetchConversations();
      
      // If we're deleting the current conversation, clear it
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    try {
      // If no current conversation, create one
      if (!currentConversationId) {
        const newConversation = await createConversation({
          title: chatInput.slice(0, 50) + (chatInput.length > 50 ? '...' : ''),
          status: ConversationStatus.ACTIVE,
          initial_message: chatInput
        });
        setCurrentConversationId(newConversation.id);
        setChatInput('');
        
        // In agent mode, automatically analyze after first response
        if (chatMode === 'agent') {
          // Wait a bit for the conversation to be loaded and AI to respond
          setTimeout(async () => {
            try {
              setAgentProcessing(true);
              
              // Use API client directly instead of hook functions
              const analysis = await apiClient.post(`/api/conversations/${newConversation.id}/analyze`);
              
              if (analysis.confidence_score >= 0.5) {
                // Auto-generate project if confidence is high enough
                const result = await apiClient.post(`/api/conversations/${newConversation.id}/generate-project`, {
                  analysis,
                  create_goal: true
                });
                
                if (result.goal_id) {
                  // Refresh data to show new tasks
                  await loadData();
                  
                  // Show success message (you might want to add a toast notification here)
                  console.log('Project created successfully with', result.created_tasks.length, 'tasks');
                }
              }
            } catch (error) {
              console.error('Failed to analyze/generate in agent mode:', error);
            } finally {
              setAgentProcessing(false);
            }
          }, 3000); // Wait for AI response
        }
      } else {
        // Send message to existing conversation
        await sendMessage(chatInput);
        setChatInput('');
        
        // In agent mode, check if we should analyze after each message
        if (chatMode === 'agent' && conversation && conversation.messages.length >= 2) {
          setTimeout(async () => {
            try {
              setAgentProcessing(true);
              
              // Use API client directly
              const analysis = await apiClient.post(`/api/conversations/${currentConversationId}/analyze`);
              
              if (analysis.confidence_score >= 0.7 && !conversation.generated_goal_id) {
                // Auto-generate if we have high confidence and no project yet
                const result = await apiClient.post(`/api/conversations/${currentConversationId}/generate-project`, {
                  conversation_id: currentConversationId,
                  analysis,
                  create_goal: true
                });
                
                if (result.goal_id) {
                  await loadData();
                  console.log('Project created successfully with', result.created_tasks.length, 'tasks');
                }
              }
            } catch (error) {
              console.error('Failed to analyze/generate in agent mode:', error);
            } finally {
              setAgentProcessing(false);
            }
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Filter tasks based on selected project
  const filteredTasks = selectedProjectId 
    ? tasks.filter(task => task.goal_id === selectedProjectId)
    : tasks;

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
              <div className="ml-8 mt-1 space-y-1">
                <button 
                  onClick={() => {
                    if (hasProPlan === false && goals.length >= 3) {
                      setShowUpgradePrompt(true);
                      return;
                    }
                    setShowGoalForm(true);
                  }}
                  className="w-full text-left px-3 py-1 text-sm text-[#606060] hover:text-[#A0A0A0] transition-all"
                >
                  + New project {hasProPlan === false && goals.length >= 3 && '(Pro)'}
                </button>
                {goals.map(goal => (
                  <div key={goal.id} className="group px-3 py-1 flex items-center justify-between gap-2 text-sm text-[#A0A0A0] hover:text-white transition-all cursor-pointer">
                    <div className="flex items-center gap-2 truncate">
                      <span>{goal.icon}</span>
                      <span className="truncate">{goal.title}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this project and all its tasks?')) {
                          handleGoalDelete(goal.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
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
            <div className="w-full flex items-center gap-1 px-3 py-2 text-[#A0A0A0]">
              <button 
                onClick={() => setChatsExpanded(!chatsExpanded)}
                className="flex items-center gap-1 hover:text-white transition-all"
              >
                {chatsExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
                Chats
              </button>
              <button
                onClick={handleNewChat}
                className="ml-auto p-1 text-[#606060] hover:text-white transition-all"
                title="New Chat"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            {chatsExpanded && (
              <div className="mt-2 space-y-1">
                {conversations.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-[#606060]">
                    Start a conversation to see it here
                  </div>
                ) : (
                  conversations.map(conv => (
                    <div 
                      key={conv.id}
                      className={`group px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                        currentConversationId === conv.id 
                          ? 'bg-[#242426] text-white' 
                          : 'hover:bg-[#242426] text-[#A0A0A0] hover:text-white'
                      }`}
                      onClick={() => setCurrentConversationId(conv.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-medium truncate">{conv.title}</div>
                            {conv.generated_goal_id && (
                              <span className="text-xs px-1.5 py-0.5 bg-[#4ECDC4]/20 text-[#4ECDC4] rounded" title="Project created">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#606060]">
                            {new Date(conv.updated_at || conv.created_at).toLocaleDateString()} • {conv.status}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#606060] hover:text-red-400 transition-all"
                          title="Delete conversation"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
                <UserPlanStatusClient />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Center Chat Area */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          {!conversation || conversation.messages.length === 0 ? (
            <div className="text-center max-w-2xl">
              <div className="w-24 h-24 bg-[#242426] rounded-2xl flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-[#4ECDC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-6">
                {currentConversationId ? 'Continue your conversation' : 'What can I help with?'}
              </h2>
              
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
              {conversation.messages.map((msg, idx) => (
                <div key={msg.id} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-4 py-2 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-[#4ECDC4] text-black' 
                      : 'bg-[#242426] text-white'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {sendingMessage && (
                <div className="text-left">
                  <div className="inline-block px-4 py-2 rounded-lg bg-[#242426] text-white">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              {agentProcessing && chatMode === 'agent' && (
                <div className="text-left">
                  <div className="inline-block px-4 py-2 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30">
                    <span className="animate-pulse flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Agent is creating tasks...
                    </span>
                  </div>
                </div>
              )}
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
                placeholder={
                  chatMode === 'agent' 
                    ? "Describe your project and I'll create tasks..." 
                    : currentConversationId 
                      ? "Continue the conversation..." 
                      : "Start a new conversation..."
                }
                disabled={sendingMessage}
                className={`w-full px-4 py-3 bg-[#242426] text-white rounded-lg pr-12 placeholder-[#606060] focus:outline-none focus:ring-2 disabled:opacity-50 ${
                  chatMode === 'agent' ? 'focus:ring-[#8B5CF6]' : 'focus:ring-[#4ECDC4]'
                }`}
              />
              <button
                type="submit"
                disabled={sendingMessage || !chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#606060] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4 text-xs text-[#606060]">
                <span className="flex items-center gap-1">
                  <span className="text-[#8B5CF6]">●</span> GPT 4.1
                </span>
                <button 
                  onClick={() => setChatMode(chatMode === 'chat' ? 'agent' : 'chat')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                    chatMode === 'agent' 
                      ? 'bg-[#4ECDC4]/20 text-[#4ECDC4]' 
                      : 'hover:text-[#A0A0A0]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {chatMode === 'agent' ? 'Agent Mode' : 'Agent'}
                </button>
              </div>
              
              {/* Generate Project Button */}
              {conversation && conversation.messages.length >= 4 && (
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-[#4ECDC4]/10 text-[#4ECDC4] rounded-md hover:bg-[#4ECDC4]/20 transition-colors text-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Generate Project
                </button>
              )}
            </div>
          </div>
        </form>
      </main>

      {/* Right Tasks Sidebar */}
      <aside className="w-80 bg-[#1A1A1C] border-l border-white/10 flex flex-col h-screen">
        {/* Fixed Header */}
        <div className="p-6 pb-0 flex-shrink-0">
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
              <span className="text-xs text-[#606060] bg-[#242426] px-2 py-1 rounded">{filteredTasks.length}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="relative">
              <select
                value={selectedProjectId || ''}
                onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-[#242426] text-[#A0A0A0] text-sm px-3 py-2 rounded-lg border border-[#606060]/20 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]/50 focus:border-[#4ECDC4]/50 appearance-none cursor-pointer"
              >
                <option value="">All Projects</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>
                    {goal.icon && `${goal.icon} `}{goal.title}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#606060] pointer-events-none" />
            </div>
          </div>

          {/* Create Task Buttons */}
          <div className="mb-6 space-y-2">
            <button
              onClick={() => setShowTaskForm(true)}
              className="w-full flex items-center gap-2 px-4 py-3 bg-[#4ECDC4] text-black rounded-lg hover:bg-[#45B7B8] transition-all font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              Create Task
            </button>
            <ProFeatureGateClient
              fallback={
                <button
                  onClick={() => setShowUpgradePrompt(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-[#242426] text-[#606060] border border-[#606060]/20 rounded-lg hover:bg-[#2A2A2C] transition-all font-medium"
                >
                  <span>✨</span>
                  Create with AI (Pro)
                </button>
              }
            >
              <button
                onClick={() => setShowAITaskForm(true)}
                className="w-full flex items-center gap-2 px-4 py-3 bg-[#242426] text-white border border-[#4ECDC4]/20 rounded-lg hover:bg-[#2A2A2C] hover:border-[#4ECDC4]/40 transition-all font-medium"
              >
                <span>✨</span>
                Create with AI
              </button>
            </ProFeatureGateClient>
          </div>
        </div>

        {/* Scrollable Tasks List */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-[#606060]">
                <p className="text-sm">
                  {selectedProjectId ? 'No tasks in this project' : 'No tasks yet'}
                </p>
                <p className="text-xs mt-1">
                  {selectedProjectId 
                    ? 'Tasks from this project will appear here' 
                    : 'Tasks created in chat will appear here'
                  }
                </p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  className="group p-3 bg-[#242426] rounded-lg hover:bg-[#2A2A2C] transition-all cursor-pointer relative"
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
                        <p className="text-xs text-[#606060] mt-1 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {task.goal && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: task.goal.color ? `${task.goal.color}20` : 'rgba(78, 205, 196, 0.2)',
                              color: task.goal.color || '#4ECDC4'
                            }}
                          >
                            {task.goal.icon && `${task.goal.icon} `}{task.goal.title}
                          </span>
                        )}
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
                    
                    {/* Action buttons - visible on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTask(task);
                        }}
                        className="p-1 text-[#606060] hover:text-[#4ECDC4] transition-colors"
                        title="Edit task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this task?')) {
                            try {
                              await deleteTask(task.id);
                              handleTaskDelete(task.id);
                            } catch (error) {
                              console.error('Failed to delete task:', error);
                            }
                          }
                        }}
                        className="p-1 text-[#606060] hover:text-red-400 transition-colors"
                        title="Delete task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 pt-0 flex-shrink-0">
          {/* Completed tasks toggle */}
          {filteredTasks.some(t => t.status === TaskStatus.COMPLETED) && (
            <div className="pt-4 border-t border-white/10">
              <button className="text-sm text-[#606060] hover:text-[#A0A0A0] transition-all">
                completed tasks
              </button>
            </div>
          )}
        </div>
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
                goals={goals}
                onSubmit={editingTask ? () => handleTaskUpdate() : handleTaskCreate}
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

      {/* AI Task form modal */}
      {showAITaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-[#1A1A1C] rounded-xl border border-white/8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AITaskForm
                categories={categories}
                tags={tags}
                goals={goals}
                onTaskCreated={() => {
                  setShowAITaskForm(false);
                  loadData(); // Reload tasks after creation
                }}
                onCancel={() => setShowAITaskForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Goal form modal */}
      {(showGoalForm || editingGoal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-[#1A1A1C] rounded-xl border border-white/8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingGoal ? 'Edit Project' : 'Create New Project'}
              </h2>
              <GoalForm
                initialData={editingGoal || undefined}
                onSubmit={editingGoal ? () => handleGoalUpdate() : handleGoalCreate}
                onCancel={() => {
                  setShowGoalForm(false);
                  setEditingGoal(null);
                }}
                isEdit={!!editingGoal}
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

      {/* Upgrade prompt */}
      {showUpgradePrompt && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 max-w-md w-full px-6 z-50">
          <UpgradePrompt
            title="Unlock Pro Features"
            description={hasProPlan === false && goals.length >= 3 
              ? "You've reached the limit of 3 projects on the Free plan. Upgrade to Pro for unlimited projects, AI task creation, and more!"
              : "Get AI-powered task creation, unlimited projects, and advanced analytics with Pro."
            }
            onClose={() => setShowUpgradePrompt(false)}
          />
        </div>
      )}

      {/* Conversation Analysis Modal */}
      {showAnalysis && currentConversationId && (
        <ConversationAnalysis
          conversationId={currentConversationId}
          onAnalyze={analyzeConversation}
          onGenerateProject={(analysis) => generateProject({ 
            conversation_id: currentConversationId, 
            analysis, 
            create_goal: true 
          })}
          onClose={() => setShowAnalysis(false)}
          onProjectCreated={(goalId) => {
            loadData(); // Reload to show new goal/tasks
            // Keep current conversation active for further discussion
          }}
        />
      )}
    </div>
  );
}