import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Image as ImageIcon,
  File,
} from "lucide-react";

type UserRole = 'visitor' | 'user' | 'provider' | 'admin';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'provider' | 'admin';
}

interface MessagesPageProps {
  user: User;
  userRole: UserRole;
}

interface Conversation {
  id: string;
  participant: {
    name: string;
    role: string;
    avatar?: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  sender: 'me' | 'them';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
}

export function MessagesPage({ user, userRole }: MessagesPageProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('conv-1');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock conversations data
  const conversations: Conversation[] = userRole === 'provider' 
    ? [
        {
          id: 'conv-1',
          participant: { name: 'Priya Sharma', role: 'Customer', avatar: undefined },
          lastMessage: 'Can you deliver by 7 PM today?',
          timestamp: '5 min ago',
          unread: 2,
          online: true,
        },
        {
          id: 'conv-2',
          participant: { name: 'Rajesh Patil', role: 'Customer', avatar: undefined },
          lastMessage: 'Thanks for the quick service!',
          timestamp: '2 hours ago',
          unread: 0,
          online: false,
        },
        {
          id: 'conv-3',
          participant: { name: 'Anita Desai', role: 'Customer', avatar: undefined },
          lastMessage: 'Can I change my subscription plan?',
          timestamp: '1 day ago',
          unread: 1,
          online: false,
        },
      ]
    : [
        {
          id: 'conv-1',
          participant: { name: 'Maharashtrian Tiffin Express', role: 'Provider', avatar: undefined },
          lastMessage: 'Yes, we can deliver by 7 PM. Your order is being prepared.',
          timestamp: '2 min ago',
          unread: 1,
          online: true,
        },
        {
          id: 'conv-2',
          participant: { name: 'QuickFix Plumbing', role: 'Provider', avatar: undefined },
          lastMessage: 'I\'ll be there tomorrow at 10 AM.',
          timestamp: '1 hour ago',
          unread: 0,
          online: true,
        },
        {
          id: 'conv-3',
          participant: { name: 'Nanded Heritage Tours', role: 'Provider', avatar: undefined },
          lastMessage: 'Your booking is confirmed for Saturday.',
          timestamp: '2 days ago',
          unread: 0,
          online: false,
        },
      ];

  // Mock messages data
  const mockMessages: { [key: string]: Message[] } = {
    'conv-1': [
      {
        id: 'msg-1',
        sender: 'them',
        content: 'Hi! I\'d like to order a tiffin for today.',
        timestamp: '10:30 AM',
        type: 'text',
      },
      {
        id: 'msg-2',
        sender: 'me',
        content: 'Sure! What would you like to have?',
        timestamp: '10:32 AM',
        type: 'text',
      },
      {
        id: 'msg-3',
        sender: 'them',
        content: 'Maharashtrian Thali would be great.',
        timestamp: '10:33 AM',
        type: 'text',
      },
      {
        id: 'msg-4',
        sender: 'me',
        content: 'Perfect! Your order is confirmed. It will be delivered by 7 PM.',
        timestamp: '10:35 AM',
        type: 'text',
      },
      {
        id: 'msg-5',
        sender: 'them',
        content: 'Can you deliver by 7 PM today?',
        timestamp: '10:40 AM',
        type: 'text',
      },
    ],
  };

  const currentMessages = selectedConversation ? mockMessages[selectedConversation] || [] : [];
  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // Handle message sending logic here
    setMessageText('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1>Messages</h1>
          <p className="text-muted-foreground mt-2">
            Communicate with your {userRole === 'provider' ? 'customers' : 'service providers'}
          </p>
        </div>

        <Card className="h-[calc(100vh-240px)]">
          <div className="grid md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="border-r border-border">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-73px)]">
                <div className="p-2 space-y-1">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-3 rounded-lg transition-colors text-left hover:bg-muted ${
                        selectedConversation === conv.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback>
                              {conv.participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {conv.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium truncate">{conv.participant.name}</h4>
                            <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                            {conv.unread > 0 && (
                              <Badge className="ml-2 bg-primary text-primary-foreground">{conv.unread}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col">
              {selectedConversation && currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {currentConversation.participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{currentConversation.participant.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {currentConversation.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {currentMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender === 'me'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-end gap-2">
                      <Button variant="ghost" size="sm" className="mb-1">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="mb-1">
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Textarea
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-[44px] max-h-32 resize-none"
                        rows={1}
                      />
                      <Button onClick={handleSendMessage} className="mb-1">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Select a conversation to start messaging
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
