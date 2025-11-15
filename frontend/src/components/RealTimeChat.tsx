import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar } from './ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Phone, 
  Video,
  MoreVertical,
  X,
  Check,
  CheckCheck,
  Smile,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
  bookingId?: string;
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  userType: 'customer' | 'provider';
}

interface ChatProps {
  currentUser: ChatUser;
  chatWith: ChatUser;
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
}

export function RealTimeChat({ 
  currentUser, 
  chatWith, 
  bookingId, 
  isOpen, 
  onClose,
  onCall,
  onVideoCall 
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Mock message sending - simplified to avoid API dependencies
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const sendMessageApi = async (messageData: Partial<Message>) => {
    setSendingMessage(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newMsg: Message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        receiverId: chatWith.id,
        content: messageData.content!,
        type: messageData.type || 'text',
        timestamp: new Date().toISOString(),
        isRead: false,
        isDelivered: true,
        bookingId
      };
      
      setMessages(prev => [...prev, newMsg]);
      return { success: true, data: newMsg };
    } catch (error) {
      toast.error('Failed to send message');
      return { success: false, error: 'Failed to send message' };
    } finally {
      setSendingMessage(false);
    }
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    await sendMessageApi({
      content: messageContent,
      type: 'text'
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // For demo, just show a placeholder message
    const messageType = file.type.startsWith('image/') ? 'image' : 'file';
    
    sendMessageApi({
      content: `📎 ${file.name}`,
      type: messageType
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwn = message.senderId === currentUser.id;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-primary text-white rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md'
            }`}
          >
            {message.type === 'text' && (
              <p className="break-words">{message.content}</p>
            )}
            
            {message.type === 'image' && (
              <div className="space-y-2">
                <div className="bg-white/20 rounded-lg p-2">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            )}
            
            {message.type === 'file' && (
              <div className="space-y-2">
                <div className="bg-white/20 rounded-lg p-2">
                  <Paperclip className="w-6 h-6" />
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            )}
          </div>
          
          <div className={`flex items-center mt-1 text-xs text-muted-foreground ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}>
            <span>{formatTime(message.timestamp)}</span>
            {isOwn && (
              <div className="ml-1">
                {message.isRead ? (
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                ) : message.isDelivered ? (
                  <CheckCheck className="w-3 h-3" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </div>
            )}
          </div>
        </div>
        
        {!isOwn && (
          <Avatar className="w-8 h-8 ml-2 order-1">
            <ImageWithFallback
              src={chatWith.avatar}
              alt={chatWith.name}
              className="w-full h-full object-cover"
            />
          </Avatar>
        )}
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-2xl border border-border z-50 flex flex-col overflow-hidden"
    >
      {/* Chat Header */}
      <CardHeader className="border-b border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <ImageWithFallback
                  src={chatWith.avatar}
                  alt={chatWith.name}
                  className="w-full h-full object-cover"
                />
              </Avatar>
              {chatWith.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{chatWith.name}</h3>
              <p className="text-xs text-muted-foreground">
                {chatWith.isOnline ? 'Online' : `Last seen ${chatWith.lastSeen}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onCall && (
              <Button variant="ghost" size="sm" onClick={onCall}>
                <Phone className="w-4 h-4" />
              </Button>
            )}
            {onVideoCall && (
              <Button variant="ghost" size="sm" onClick={onVideoCall}>
                <Video className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                Start a conversation about your booking
              </p>
            </div>
          )}
          
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {otherUserTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-muted-foreground text-sm"
            >
              <Avatar className="w-6 h-6">
                <ImageWithFallback
                  src={chatWith.avatar}
                  alt={chatWith.name}
                  className="w-full h-full object-cover"
                />
              </Avatar>
              <div className="flex space-x-1">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-muted-foreground rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-muted-foreground rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-muted-foreground rounded-full"
                />
              </div>
              <span>typing...</span>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={sendingMessage}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={sendingMessage}
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              disabled={sendingMessage}
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            size="sm"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {isTyping && (
          <p className="text-xs text-muted-foreground mt-1">
            You are typing...
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Chat List Component
interface ChatListItem {
  user: ChatUser;
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  bookingId: string;
}

interface ChatListProps {
  chats: ChatListItem[];
  onSelectChat: (chat: ChatListItem) => void;
  currentUser: ChatUser;
}

export function ChatList({ chats, onSelectChat, currentUser }: ChatListProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>Messages</span>
          {chats.some(chat => chat.unreadCount > 0) && (
            <Badge variant="destructive" className="text-xs">
              {chats.reduce((total, chat) => total + chat.unreadCount, 0)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {chats.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat, index) => (
                <motion.div
                  key={chat.user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSelectChat(chat)}
                  className="flex items-center space-x-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border last:border-0"
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <ImageWithFallback
                        src={chat.user.avatar}
                        alt={chat.user.name}
                        className="w-full h-full object-cover"
                      />
                    </Avatar>
                    {chat.user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground truncate">
                        {chat.user.name}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(chat.lastMessage.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage.content}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs min-w-[20px] h-5">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Chat Manager Component
export function ChatManager({ currentUser }: { currentUser: ChatUser }) {
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  // Mock chat data
  const mockChats: ChatListItem[] = [
    {
      user: {
        id: 'provider-1',
        name: 'Maharashtrian Tiffin Express',
        avatar: 'https://images.unsplash.com/photo-1718114243715-8252d5382319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwc2VydmljZXxlbnwxfHx8fDE3NTgwMDQ0NTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        isOnline: true,
        userType: 'provider'
      },
      lastMessage: {
        content: 'Your meal will be delivered by 12:30 PM today',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isRead: false
      },
      unreadCount: 2,
      bookingId: 'booking-1'
    }
  ];

  const handleChatSelect = (chat: ChatListItem) => {
    setSelectedChat(chat);
    setIsChatOpen(true);
    setIsListOpen(false);
  };

  return (
    <>
      {/* Chat List Toggle */}
      <Button
        onClick={() => setIsListOpen(!isListOpen)}
        className="fixed bottom-4 left-4 z-40 rounded-full w-12 h-12 p-0 shadow-lg"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
        {mockChats.some(chat => chat.unreadCount > 0) && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 text-xs min-w-[20px] h-5 rounded-full"
          >
            {mockChats.reduce((total, chat) => total + chat.unreadCount, 0)}
          </Badge>
        )}
      </Button>

      {/* Chat List */}
      <AnimatePresence>
        {isListOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed bottom-20 left-4 z-50"
          >
            <ChatList
              chats={mockChats}
              onSelectChat={handleChatSelect}
              currentUser={currentUser}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Chat */}
      <AnimatePresence>
        {selectedChat && (
          <RealTimeChat
            currentUser={currentUser}
            chatWith={selectedChat.user}
            bookingId={selectedChat.bookingId}
            isOpen={isChatOpen}
            onClose={() => {
              setIsChatOpen(false);
              setSelectedChat(null);
            }}
            onCall={() => toast.info('Voice call feature coming soon!')}
            onVideoCall={() => toast.info('Video call feature coming soon!')}
          />
        )}
      </AnimatePresence>
    </>
  );
}