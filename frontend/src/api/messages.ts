/**
 * Messages API
 */
import { axiosClient } from './axiosClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text?: string;
  attachments?: any;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface SendMessageData {
  conversationId?: string;
  receiverId: string;
  text: string;
  attachments?: any;
}

export const messagesApi = {
  getConversations: async () => {
    const response = await axiosClient.get('/messages/conversations');
    return response.data;
  },

  getMessages: async (conversationId: string) => {
    const response = await axiosClient.get(`/messages/conversations/${conversationId}/messages`);
    return response.data;
  },

  createConversation: async (receiverId: string, text?: string) => {
    const response = await axiosClient.post('/messages/conversations', { 
      receiverId, 
      text: text || 'Hello! I would like to inquire about your services.' 
    });
    return response.data;
  },

  sendMessage: async (data: SendMessageData) => {
    const response = await axiosClient.post('/messages', data);
    return response.data;
  },

  markAsRead: async (messageId: string) => {
    const response = await axiosClient.patch(`/messages/${messageId}/read`);
    return response.data;
  },
};

// React Query hooks
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: messagesApi.getConversations,
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messagesApi.getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 2000, // Consider data fresh for 2 seconds to reduce unnecessary refetches
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: messagesApi.sendMessage,
    onSuccess: (data, variables) => {
      // Get conversation ID from response
      const conversationId = data.conversationId || variables.conversationId;
      
      // Just invalidate queries - React Query will refetch automatically when needed
      // Don't manually refetch to avoid rate limiting
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error, variables) => {
      // On error, still invalidate to ensure UI is in sync
      const conversationId = variables.conversationId;
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: messagesApi.markAsRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
