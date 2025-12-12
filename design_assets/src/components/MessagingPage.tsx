import { useState } from 'react';
import { Search, MessageSquare, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { GlassEmptyState } from './ui/GlassEmptyState';

export default function MessagingPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Mock conversations
  const conversations = [
    {
      id: '1',
      name: 'Rajesh Home Tiffin Service',
      lastMessage: 'Thank you for booking!',
      time: '10:30 AM',
      unread: 2,
    },
  ];

  const messages = selectedConversation
    ? [
        {
          id: '1',
          sender: 'provider',
          text: 'Hello! Thank you for booking our tiffin service.',
          time: '10:25 AM',
        },
        {
          id: '2',
          sender: 'user',
          text: 'What time will the delivery be?',
          time: '10:28 AM',
        },
        {
          id: '3',
          sender: 'provider',
          text: 'We deliver between 12:00 PM and 12:30 PM daily.',
          time: '10:30 AM',
        },
      ]
    : [];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Chat with service providers</p>
        </div>

        <div className="glass rounded-xl overflow-hidden shadow-xl">
          <div className="grid md:grid-cols-3 h-[600px]">
            {/* Conversations List */}
            <div className="border-r border-white/30 overflow-y-auto">
              <div className="p-4 border-b border-white/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10 glass-strong"
                  />
                </div>
              </div>

              {conversations.length > 0 ? (
                <div>
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-4 text-left transition-all hover:bg-white/20 ${
                        selectedConversation === conversation.id
                          ? 'bg-white/30'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-gray-900 line-clamp-1">
                          {conversation.name}
                        </h3>
                        {conversation.unread > 0 && (
                          <span className="bg-[#ff6b35] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {conversation.lastMessage}
                      </p>
                      <span className="text-xs text-gray-500">
                        {conversation.time}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <GlassEmptyState
                    icon={<MessageSquare className="h-12 w-12" />}
                    message="No conversations yet"
                  />
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender === 'user'
                              ? 'bg-[#ff6b35] text-white'
                              : 'glass-strong text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-white/30">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setMessage('');
                      }}
                      className="flex gap-2"
                    >
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="glass-strong resize-none"
                        rows={1}
                      />
                      <Button
                        type="submit"
                        className="bg-[#ff6b35] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-200/50 active:scale-95 transition-all"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <GlassEmptyState
                    icon={<MessageSquare className="h-16 w-16" />}
                    message="Select a conversation to start chatting"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
