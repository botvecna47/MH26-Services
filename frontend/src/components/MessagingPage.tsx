import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Send, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useUser } from '../context/UserContext';
import { formatDistanceToNow } from 'date-fns';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { useConversations, useMessages, useSendMessage, messagesApi } from '../api/messages';
import { useProvider } from '../api/providers';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../hooks/useSocket';
import { useNotifications } from '../context/NotificationContext';

export default function MessagingPage() {
  const { user, isAuthenticated } = useUser();
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get('provider');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const conversationCreationRef = useRef<string | null>(null); // Track which conversation is being created
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch provider if providerId is in query
  const { data: providerData } = useProvider(providerId || '');

  // Fetch conversations from API
  const queryClient = useQueryClient();
  const { data: conversationsData, isLoading: conversationsLoading, refetch: refetchConversations } = useConversations();
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages, error: messagesError } = useMessages(selectedConversation || '');
  const sendMessageMutation = useSendMessage();
  const socket = useSocket();
  const { unreadCount } = useNotifications();

  // Transform API conversations - must be before early return
  const conversations = useMemo(() => {
    return (conversationsData?.data || []).map((conv: any) => ({
      id: conv.id,
      name: conv.otherUser?.businessName || conv.otherUser?.name || 'Unknown',
      avatar: conv.otherUser?.avatarUrl,
      lastMessage: conv.lastMessage?.text || '',
      lastMessageTime: conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt) : new Date(),
      unread: conv.unreadCount || 0,
      otherUser: conv.otherUser,
    }));
  }, [conversationsData]);

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv: any) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const selectedConv = useMemo(() => {
    return conversations.find((c: any) => c.id === selectedConversation);
  }, [conversations, selectedConversation]);
  
  // Transform messages - ensure we handle the data structure correctly
  const currentMessages = useMemo(() => {
    if (!messagesData) return [];
    
    // Handle both direct array and paginated response
    const messagesArray = messagesData?.data || messagesData || [];
    
    return Array.isArray(messagesArray) ? messagesArray.map((msg: any) => ({
      id: msg.id,
      content: msg.text || msg.content || '',
      fromUserId: msg.senderId || msg.fromUserId,
      createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      read: msg.read || false,
    })) : [];
  }, [messagesData]);

  // Handle provider query parameter - create/select conversation
  useEffect(() => {
    // Cleanup retry timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!providerId || !providerData?.user?.id || !user?.id || isCreatingConversation) {
      return;
    }

    const receiverId = providerData.user.id;
    
    // Don't create conversation with self
    if (receiverId === user.id) {
      toast.error('Cannot message yourself');
      return;
    }

    // Prevent duplicate creation attempts for the same receiver
    if (conversationCreationRef.current === receiverId) {
      return;
    }
    
    // Check if conversation already exists - match by otherUser ID
    const existingConv = conversations.find((conv: any) => 
      conv.otherUser?.id === receiverId
    );

    if (existingConv) {
      setSelectedConversation(existingConv.id);
      conversationCreationRef.current = null;
    } else {
      // Create new conversation with retry logic for 429 errors
      const createConvWithRetry = async (retryCount = 0) => {
        const maxRetries = 3;
        const baseDelay = 1000; // 1 second

        try {
          setIsCreatingConversation(true);
          conversationCreationRef.current = receiverId;
          
          const result = await messagesApi.createConversation(receiverId, 'Hello! I would like to inquire about your services.');
          
          if (result.conversationId) {
            setSelectedConversation(result.conversationId);
            // Refetch conversations to get the new one
            setTimeout(() => {
              refetchConversations();
            }, 500);
            setMessageText('');
            toast.success('Conversation started');
            conversationCreationRef.current = null;
          }
        } catch (error: any) {
          // Handle 429 rate limit errors with exponential backoff
          if (error.response?.status === 429 && retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff: 1s, 2s, 4s
            const retryAfter = error.response?.headers?.['retry-after'] 
              ? parseInt(error.response.headers['retry-after']) * 1000 
              : delay;
            
            console.warn(`Rate limited. Retrying in ${retryAfter}ms... (attempt ${retryCount + 1}/${maxRetries})`);
            
            retryTimeoutRef.current = setTimeout(() => {
              createConvWithRetry(retryCount + 1);
            }, retryAfter);
          } else {
            // For other errors or max retries reached
            const errorMsg = error.response?.status === 429
              ? 'Too many requests. Please wait a moment and try again.'
              : error.response?.data?.error || 'Failed to start conversation';
            
            toast.error(errorMsg);
            console.error('Create conversation error:', error);
            conversationCreationRef.current = null;
            setIsCreatingConversation(false);
          }
        } finally {
          if (retryTimeoutRef.current === null) {
            setIsCreatingConversation(false);
          }
        }
      };

      createConvWithRetry();
    }
  }, [providerId, providerData?.user?.id, user?.id, conversations, isCreatingConversation, refetchConversations]);

  // Debug logging - placed after selectedConv and currentMessages are defined
  useEffect(() => {
    if (selectedConversation) {
      console.log('🔍 Debug Info:', {
        selectedConversation,
        messagesData,
        messagesError,
        selectedConv,
        conversationsCount: conversations.length,
        currentMessagesCount: currentMessages.length,
      });
    }
  }, [selectedConversation, messagesData, messagesError, selectedConv, conversations.length, currentMessages.length]);

  // Listen for real-time messages via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      // Only update if this message is for the current conversation
      if (selectedConversation && message.conversationId === selectedConversation) {
        // Refetch messages to get updated list
        refetchMessages();
      } else {
        // Refetch conversations to update unread count
        refetchConversations();
      }
    };

    const handleNotification = (notification: any) => {
      if (notification.type === 'message') {
        // Show toast notification
        toast.info(notification.payload?.body || 'New message received', {
          action: {
            label: 'View',
            onClick: () => {
              if (notification.payload?.conversationId) {
                setSelectedConversation(notification.payload.conversationId);
              }
            },
          },
        });
        // Refetch conversations to update unread count
        refetchConversations();
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('notification:new', handleNotification);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('notification:new', handleNotification);
    };
  }, [socket, selectedConversation, refetchMessages, refetchConversations]);

  // Scroll to bottom when conversation is selected or messages finish loading
  useEffect(() => {
    if (selectedConversation && !messagesLoading && messagesContainerRef.current) {
      // Scroll to bottom when opening a conversation or when messages finish loading
      const scrollToBottom = () => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        } else if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      };
      
      // Use multiple timeouts to ensure DOM is fully rendered
      setTimeout(scrollToBottom, 50);
      setTimeout(scrollToBottom, 200);
      setTimeout(scrollToBottom, 500);
    }
  }, [selectedConversation, messagesLoading, currentMessages.length]);

  // Only scroll to bottom when receiving new messages (not when sending)
  useEffect(() => {
    // Don't auto-scroll if user is sending a message
    if (isSendingMessage) return;
    
    // Only scroll if user is already near the bottom
    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      
      if (isNearBottom) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [currentMessages, isSendingMessage]);

  // Early return AFTER all hooks
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-2">Please sign in</h2>
          <p className="text-gray-600">You need to be logged in to access messages</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    // If no conversation selected but we have a provider, create conversation first
    if (!selectedConversation && providerId && providerData?.user?.id) {
      // Check if conversation already exists before creating
      const existingConv = conversations.find((conv: any) => 
        conv.otherUser?.id === providerData.user.id
      );

      let conversationId = existingConv?.id;
      
      // Only create if conversation doesn't exist and not already creating
      if (!conversationId && !isCreatingConversation && conversationCreationRef.current !== providerData.user.id) {
        try {
          setIsCreatingConversation(true);
          conversationCreationRef.current = providerData.user.id;
          
          const result = await messagesApi.createConversation(providerData.user.id, messageText.trim());
          conversationId = result.conversationId;
          
          if (conversationId) {
            setSelectedConversation(conversationId);
            conversationCreationRef.current = null;
            setTimeout(() => {
              refetchConversations();
            }, 500);
            // Continue to send the message below
          } else {
            setIsCreatingConversation(false);
            conversationCreationRef.current = null;
            toast.error('Failed to create conversation');
            return;
          }
        } catch (error: any) {
          setIsCreatingConversation(false);
          conversationCreationRef.current = null;
          
          if (error.response?.status === 429) {
            toast.error('Too many requests. Please wait a moment and try again.');
          } else {
            toast.error('Failed to start conversation. Please try again.');
          }
          return;
        } finally {
          setIsCreatingConversation(false);
        }
      } else if (!conversationId) {
        toast.error('Please wait for the conversation to be created');
        return;
      } else {
        // Use existing conversation
        setSelectedConversation(conversationId);
      }
      
      // Now send the message with the conversation ID
      if (conversationId) {
        setSelectedConversation(conversationId);
        // Continue to send message below (don't return here)
      } else {
        return;
      }
    }

    if (!selectedConversation || !selectedConv) {
      toast.error('Please select a conversation');
      return;
    }

    if (!selectedConv.otherUser?.id) {
      toast.error('Invalid conversation. Please select a valid conversation.');
      return;
    }

    try {
      setIsSendingMessage(true);
      const result = await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        receiverId: selectedConv.otherUser.id,
        text: messageText.trim(),
      });
      
      // Ensure we're using the correct conversation ID
      const conversationId = result?.conversationId || selectedConversation;
      if (conversationId !== selectedConversation) {
        setSelectedConversation(conversationId);
      }
      
      // React Query will automatically refetch due to invalidation in useSendMessage
      // Just reset the sending flag after a short delay
      setTimeout(() => {
        setIsSendingMessage(false);
      }, 500);
      
      toast.success('Message sent');
      setMessageText('');
    } catch (error: any) {
      setIsSendingMessage(false);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send message';
      toast.error(errorMessage);
      console.error('Send message error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col md:flex-row overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-sm"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {conversationsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedConversation === conv.id ? 'bg-orange-50 border-l-4 border-l-[#ff6b35]' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={conv.avatar}
                    alt={conv.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900 truncate">{conv.name}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDistanceToNow(conv.lastMessageTime, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 bg-[#ff6b35] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white">{conv.unread}</span>
                  </div>
                )}
              </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
          {selectedConv && selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={selectedConv.avatar || selectedConv.otherUser?.avatarUrl}
                      alt={selectedConv.name || selectedConv.otherUser?.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-medium text-gray-900 truncate">
                      {selectedConv.name || selectedConv.otherUser?.businessName || selectedConv.otherUser?.name || 'Unknown User'}
                    </h2>
                    <p className="text-xs text-green-600">Online</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2" style={{ minHeight: 0 }}>
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : messagesError ? (
                  <div className="flex flex-col items-center justify-center h-full text-red-500">
                    <p className="text-sm mb-2">Error loading messages</p>
                    <button 
                      onClick={() => refetchMessages()} 
                      className="text-sm underline text-blue-600"
                    >
                      Retry
                    </button>
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {currentMessages.map((message, index) => {
                      const isSent = message.fromUserId === user?.id;
                      const prevMessage = index > 0 ? currentMessages[index - 1] : null;
                      const showAvatar = !prevMessage || prevMessage.fromUserId !== message.fromUserId;
                      const showTimestamp = !prevMessage || 
                        new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 5 * 60 * 1000; // 5 minutes
                      
                      return (
                        <div key={message.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                          {!isSent && showAvatar && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                              <ImageWithFallback
                                src={selectedConv?.avatar || selectedConv?.otherUser?.avatarUrl}
                                alt={selectedConv?.name || 'User'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%] md:max-w-md`}>
                            {showTimestamp && (
                              <p className={`text-xs mb-1 px-2 ${isSent ? 'text-gray-500' : 'text-gray-400'}`}>
                                {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                              </p>
                            )}
                            <div
                              className={`px-3 py-1.5 rounded-2xl ${
                                isSent
                                  ? 'bg-[#ff6b35] text-white rounded-br-md'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm break-words leading-relaxed">{message.content}</p>
                            </div>
                          </div>
                          {isSent && showAvatar && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                              <ImageWithFallback
                                src={user?.avatarUrl}
                                alt={user?.name || 'You'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#ff6b35] hover:bg-[#ff5722] h-9 px-3"
                    disabled={!messageText.trim() || sendMessageMutation.isPending || isCreatingConversation}
                  >
                    {sendMessageMutation.isPending || isCreatingConversation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="mb-2">Select a conversation to start messaging</p>
                <p className="text-sm">Real-time messaging via Socket.io</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
