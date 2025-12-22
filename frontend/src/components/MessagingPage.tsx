import { useState, useEffect } from 'react';
import { Search, Send, MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useUser } from '../context/UserContext';
import { formatDistanceToNow } from 'date-fns';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from '../api/messages';
import { useNotifications } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import { Skeleton } from './ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';

import { useSearchParams } from 'react-router-dom';

export default function MessagingPage() {
  const { user, isAuthenticated } = useUser();
  const [searchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // API Hooks
  const { data: conversations = [], isLoading: loadingConversations } = useConversations();
  const { data: messages = [], isLoading: loadingMessages } = useMessages(selectedConversationId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Socket integration
  const { socket } = useSocket();

  // Handle URL params for deep linking
  useEffect(() => {
    const userIdFromUrl = searchParams.get('userId');
    if (userIdFromUrl) {
      setSelectedConversationId(userIdFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
        // If message belongs to current conversation, add it to list
        if (selectedConversationId && (msg.senderId === selectedConversationId || msg.receiverId === selectedConversationId)) {
            // Optimistically update messages cache
            queryClient.setQueryData(['messages', selectedConversationId], (old: any[] = []) => {
                // Check if already exists to avoid dupes from successful mutation + socket event race
                if (old.find(m => m.id === msg.id)) return old;
                return [...old, msg];
            });

            // Mark as read immediately if we are looking at it
            if (msg.senderId === selectedConversationId) {
                 markAsReadMutation.mutate(selectedConversationId);
            }
        }

        // Always invalidate conversations to update sidebar (last message, unread count)
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('message:new', handleNewMessage);

    return () => {
        socket.off('message:new', handleNewMessage);
    };
  }, [socket, selectedConversationId, queryClient, markAsReadMutation]);

  // Mark as read when opening conversation
  useEffect(() => {
      if (selectedConversationId) {
          markAsReadMutation.mutate(selectedConversationId);
      }
  }, [selectedConversationId]);

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

  // Filter conversations
  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find selected conversation OR create a temporary placeholder if coming from URL
  // If we don't have the conversation details in the list, we might miss the name/avatar until a message is sent or we fetch profile.
  // For MVP, if it's not in the list, we can try to find it, or we rely on the backend to create the conversation implicitly.
  // We need the OTHER USER's details for the header.
  // If `selectedConv` is undefined, we probably need a way to fetch the user's basic info (name/avatar) given the ID.
  // Let's assume for now it's in the list OR we display "New Conversation" / "Loading..." until the first message.
  
  const selectedConv = conversations.find(c => c.userId === selectedConversationId) || (
      selectedConversationId ? {
          userId: selectedConversationId,
          name: 'New Conversation', // Ideally fetch this
          email: '',
          avatarUrl: undefined,
          lastMessage: '',
          lastMessageTime: '',
          unreadCount: 0
      } : undefined
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId) return;

    try {
        await sendMessageMutation.mutateAsync({
            receiverId: selectedConversationId,
            text: messageText
        });
        setMessageText('');
        // Socket should handle the update via 'message:new' (if backend emits back to sender) 
        // OR we rely on invalidation.
        // Usually backend only emits 'message:new' to receiver. 
        // Sender gets it from mutation response -> React Query `onSuccess` usually updates cache.
        // Let's rely on standard mutation response invalidations for sender side.
    } catch (error) {
        toast.error('Failed to send message');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4 pb-20 md:pb-4">
        {/* Conversations List - Glass Sidebar */}
        <div className={`w-full md:w-80 glass rounded-xl flex flex-col overflow-hidden ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
          {/* Search */}
          <div className="p-4 border-b border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 text-sm"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
                <div className="p-4 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No conversations found</div>
            ) : (
                filteredConversations.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => setSelectedConversationId(conv.userId)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-white/20 transition-all border-b border-white/10 ${
                  selectedConversationId === conv.userId ? 'bg-[#ff6b35]/10 border-l-4 border-l-[#ff6b35]' : ''
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-orange-100 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                   {/* Fallback avatar logic */}
                   {conv.avatarUrl ? (
                        <ImageWithFallback src={conv.avatarUrl} alt={conv.name} className="w-full h-full object-cover" />
                   ) : (
                       <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-lg">
                            {conv.name.charAt(0)}
                       </div>
                   )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900 truncate">{conv.name}</span>
                    <span className="text-xs text-gray-600 flex-shrink-0">
                      {conv.lastMessageTime ? formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                    {conv.lastMessage || 'Start a conversation'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-[#ff6b35] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-xs text-white">{conv.unreadCount}</span>
                  </div>
                )}
              </button>
            )))}
          </div>
        </div>

        {/* Chat Area - Glass Panel */}
        <div className={`flex-1 glass rounded-xl flex flex-col overflow-hidden ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversationId && selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/20 flex items-center justify-between bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                   <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversationId(null)}>
                        <ArrowLeft className="h-5 w-5" />
                   </Button>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-200 to-orange-100 rounded-full overflow-hidden shadow-md flex items-center justify-center">
                     {selectedConv.avatarUrl ? (
                        <ImageWithFallback src={selectedConv.avatarUrl} alt={selectedConv.name} className="w-full h-full object-cover" />
                     ) : (
                        <span className="text-orange-600 font-bold">{selectedConv.name.charAt(0)}</span>
                     )}
                  </div>
                  <div>
                    <h2 className="text-gray-900 font-semibold">{selectedConv.name}</h2>
                    {/* Could show 'Typing...' here if state exists */}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="hover:bg-white/20">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {loadingMessages ? (
                      <div className="space-y-4">
                        <div className="flex justify-start"><Skeleton className="h-12 w-2/3 rounded-2xl" /></div>
                        <div className="flex justify-end"><Skeleton className="h-12 w-2/3 rounded-2xl" /></div>
                        <div className="flex justify-start"><Skeleton className="h-12 w-1/2 rounded-2xl" /></div>
                      </div>
                 ) : messages.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-70">
                         <p>No messages yet.</p>
                         <p className="text-sm">Say hello! 👋</p>
                     </div>
                 ) : (
                     messages.map((message) => {
                    const isSent = message.senderId === user.id;
                    return (
                        <div
                        key={message.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                        <div
                            className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                            isSent
                                ? 'bg-[#ff6b35] text-white rounded-br-none'
                                : 'bg-white text-gray-900 rounded-bl-none'
                            }`}
                        >
                            <p className="text-sm break-words">{message.text}</p>
                            <p className={`text-[10px] mt-1 text-right ${isSent ? 'text-white/70' : 'text-gray-500'}`}>
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                        </div>
                    );
                    })
                 )}
                 {/* Auto-scroll target */}
                 <div />
              </div>

              {/* Message Input - Glass Capsule */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 bg-white/40 backdrop-blur-md">
                <div className="flex gap-2 bg-white rounded-full p-1 pl-4 shadow-sm border border-gray-100">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 placeholder:text-gray-400"
                  />
                  <Button
                    type="submit"
                    className="bg-[#ff6b35] hover:bg-[#ff5722] rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-md transition-transform active:scale-95"
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4 text-white ml-0.5" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center glass-light rounded-2xl p-8 max-w-sm mx-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-[#ff6b35]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Conversations</h3>
                <p className="text-sm text-gray-600">Select a conversation from the list to start messaging securely with providers.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}