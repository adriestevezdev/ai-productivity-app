import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from '@/lib/api-client';
import { useSubscriptionAwareFeatureUsage } from './use-subscription-aware-feature-usage';
import { ProFeature } from '@/lib/features';
import { 
  Conversation, 
  ConversationWithMessages, 
  ConversationCreate, 
  ChatMessage, 
  ChatResponse,
  ProjectAnalysis,
  ProjectGenerationRequest,
  ProjectGenerationResponse
} from '@/types/conversation';

export function useConversations() {
  const apiClient = useApiClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<Conversation[]>('/api/conversations');
      setConversations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = async (conversationData: ConversationCreate): Promise<Conversation> => {
    try {
      const conversation = await apiClient.post<Conversation>('/api/conversations', conversationData);
      setConversations(prev => [conversation, ...prev]);
      return conversation;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create conversation');
    }
  };

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    createConversation
  };
}

export function useConversation(conversationId: number | null) {
  const apiClient = useApiClient();
  const [conversation, setConversation] = useState<ConversationWithMessages | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Check subscription for AI features
  const { canUse, incrementUsage, isPro } = useSubscriptionAwareFeatureUsage(ProFeature.AI_TASK_CREATION);

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<ConversationWithMessages>(`/api/conversations/${conversationId}`);
      setConversation(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversation');
    } finally {
      setLoading(false);
    }
  }, [conversationId, apiClient]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  const sendMessage = async (messageContent: string): Promise<void> => {
    if (!conversationId || !messageContent.trim()) return;

    // Check subscription limits for free users
    if (!canUse) {
      throw new Error('You\'ve reached your daily AI conversation limit. Upgrade to Pro for unlimited access.');
    }

    try {
      setSendingMessage(true);
      setError(null);
      
      const response = await apiClient.post<ChatResponse>(
        `/api/conversations/${conversationId}/messages`,
        { content: messageContent.trim() } as ChatMessage
      );

      // Update conversation with new messages
      setConversation(prev => {
        if (!prev) return null;
        return {
          ...response.conversation,
          messages: [...prev.messages, response.message]
        };
      });

      // Track usage for free users
      if (!isPro) {
        incrementUsage();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      throw err;
    } finally {
      setSendingMessage(false);
    }
  };

  const analyzeConversation = async (): Promise<ProjectAnalysis> => {
    if (!conversationId) throw new Error('No conversation selected');

    try {
      const analysis = await apiClient.post<ProjectAnalysis>(
        `/api/conversations/${conversationId}/analyze`
      );
      return analysis;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to analyze conversation');
    }
  };

  const generateProject = async (request: ProjectGenerationRequest): Promise<ProjectGenerationResponse> => {
    if (!conversationId) throw new Error('No conversation selected');

    try {
      const result = await apiClient.post<ProjectGenerationResponse>(
        `/api/conversations/${conversationId}/generate-project`,
        request
      );
      
      // Update conversation status if project was created
      if (result.goal_id && conversation) {
        setConversation(prev => prev ? {
          ...prev,
          generated_goal_id: result.goal_id,
          status: 'completed' as any
        } : null);
      }
      
      return result;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to generate project');
    }
  };

  return {
    conversation,
    loading,
    error,
    sendingMessage,
    sendMessage,
    analyzeConversation,
    generateProject,
    refetch: fetchConversation
  };
}