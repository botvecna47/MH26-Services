import { axiosClient } from './axiosClient';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

export interface Conversation {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const messagesApi = {
  // Get all conversations (threads)
  getConversations: async (): Promise<Conversation[]> => {
    const response = await axiosClient.get<{ data: any[] }>('/messages/conversations');
    
    // Transform backend response to frontend interface
    return response.data.data.map((item: any) => ({
      userId: item.otherUser.id,
      name: item.otherUser.businessName || item.otherUser.name || 'Unknown',
      email: item.otherUser.email,
      avatarUrl: item.otherUser.avatarUrl,
      lastMessage: item.lastMessage?.text || 'Sent an attachment',
      lastMessageTime: item.lastMessage?.createdAt || item.updatedAt,
      unreadCount: item.unreadCount || 0
    }));
  },

  // Get messages for a specific conversation (user)
  getMessages: async (otherUserId: string): Promise<Message[]> => {
    const response = await axiosClient.get<{ data: Message[] }>(`/messages/${otherUserId}`);
    return response.data.data;
  },

  // Send a message
  sendMessage: async (receiverId: string, text: string): Promise<Message> => {
    const response = await axiosClient.post<Message>('/messages', {
      receiverId,
      text,
    });
    return response.data;
  },
  
  // Mark messages as read
  markAsRead: async (senderId: string): Promise<void> => {
      await axiosClient.put(`/messages/${senderId}/read`);
  }
};

// React Query Hooks

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: messagesApi.getConversations,
    // Refetch often for unread badges if socket fails, but socket should handle it
    staleTime: 1000 * 60, 
  });
};

export const useMessages = (otherUserId: string | null) => {
  return useQuery({
    queryKey: ['messages', otherUserId],
    queryFn: () => messagesApi.getMessages(otherUserId!),
    enabled: !!otherUserId,
    placeholderData: keepPreviousData,
    // Keep messages fresh
    staleTime: 1000 * 5, 
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ receiverId, text }: { receiverId: string; text: string }) =>
      messagesApi.sendMessage(receiverId, text),
    onSuccess: (newMessage, variables) => {
      // Optimistically update or invalidate
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiverId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (senderId: string) => messagesApi.markAsRead(senderId),
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    })
}
