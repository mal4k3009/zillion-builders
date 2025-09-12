import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Search, Trash2, MoreVertical } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';

export function ChatPage() {
  const { 
    state, 
    sendChatMessage, 
    deleteChatMessage,
    createActivity, 
    subscribeToUserConversations,
    subscribeToConversation,
    markConversationAsRead
  } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversationMessages, setConversationMessages] = useState<ChatMessage[]>([]);
  const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const users = state.users.filter(u => u.id !== state.currentUser?.id);
  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = users.find(u => u.id === selectedUserId);

  // Subscribe to user's all conversations for unread counts and recent messages
  useEffect(() => {
    if (state.currentUser) {
      const unsubscribe = subscribeToUserConversations(state.currentUser.id);
      return () => unsubscribe();
    }
  }, [state.currentUser, subscribeToUserConversations]);

  // Subscribe to specific conversation when user is selected
  useEffect(() => {
    if (selectedUserId && state.currentUser) {
      // Unsubscribe from previous conversation
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Subscribe to new conversation with direct state update
      unsubscribeRef.current = subscribeToConversation(
        state.currentUser.id, 
        selectedUserId,
        (messages) => {
          console.log(`🔄 ChatPage received ${messages.length} messages for conversation ${state.currentUser?.id} ↔ ${selectedUserId}`);
          // Directly update conversation messages when Firebase sends updates
          setConversationMessages(messages);
        }
      );
      
      // Mark conversation as read
      markConversationAsRead(state.currentUser.id, selectedUserId);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [selectedUserId, state.currentUser, subscribeToConversation, markConversationAsRead]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);

  // Mark messages as read when conversation changes
  useEffect(() => {
    if (selectedUserId && state.currentUser) {
      markConversationAsRead(state.currentUser.id, selectedUserId);
    }
  }, [selectedUserId, state.currentUser, markConversationAsRead]);

  // Close delete menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDeleteMenu(null);
    };

    if (showDeleteMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDeleteMenu]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedUserId || !state.currentUser) return;

    console.log(`📤 Sending message from User ${state.currentUser.id} to User ${selectedUserId}: "${message.trim()}"`);

    const newMessage = {
      senderId: state.currentUser.id,
      receiverId: selectedUserId,
      content: message.trim(),
      timestamp: new Date().toISOString(),
      type: 'text' as const,
      isRead: false
    };

    await sendChatMessage(newMessage);
    
    // Add activity
    await createActivity({
      type: 'message_sent',
      description: `Sent message to ${selectedUser?.name}`,
      userId: state.currentUser.id,
      timestamp: new Date().toISOString()
    });

    setMessage('');
    console.log('✅ Message sent successfully');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUserId || !state.currentUser) return;

    const newMessage = {
      senderId: state.currentUser.id,
      receiverId: selectedUserId,
      content: `📎 Shared a file: ${file.name}`,
      timestamp: new Date().toISOString(),
      type: 'file' as const,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      isRead: false
    };

    await sendChatMessage(newMessage);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteChatMessage(messageId);
      setShowDeleteMenu(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUnreadCount = (userId: number) => {
    return state.chatMessages.filter(msg =>
      msg.senderId === userId && 
      msg.receiverId === state.currentUser?.id && 
      !msg.isRead
    ).length;
  };

  return (
    <div className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] flex flex-col lg:flex-row bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Users List */}
      <div className="w-full lg:w-80 border-r-0 lg:border-r border-b lg:border-b-0 border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((user) => {
            const unreadCount = getUnreadCount(user.id);
            const lastMessage = state.chatMessages
              .filter(msg => 
                (msg.senderId === user.id && msg.receiverId === state.currentUser?.id) ||
                (msg.senderId === state.currentUser?.id && msg.receiverId === user.id)
              )
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

            return (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full p-3 sm:p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 transition-colors ${
                  selectedUserId === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs sm:text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {user.status === 'active' && (
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-[16px] sm:min-w-[20px] text-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.department}
                    </p>
                    {lastMessage && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-xs">
                    {selectedUser?.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                    {selectedUser?.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                    {selectedUser?.department} Department
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {conversationMessages.map((msg: ChatMessage) => {
                const isOwnMessage = msg.senderId === state.currentUser?.id;

                return (
                  <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative group max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      {/* Delete button - only show for own messages */}
                      {isOwnMessage && (
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="relative">
                            <button
                              onClick={() => setShowDeleteMenu(showDeleteMenu === msg.id ? null : msg.id)}
                              className="p-1 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg transition-colors"
                            >
                              <MoreVertical className="w-2 h-2 sm:w-3 sm:h-3" />
                            </button>
                            {showDeleteMenu === msg.id && (
                              <div className="absolute right-0 top-6 sm:top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                                >
                                  <Trash2 className="w-2 h-2 sm:w-3 sm:h-3" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {msg.type === 'file' && (
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          <Paperclip className="w-2 h-2 sm:w-3 sm:h-3" />
                          <span className="text-xs opacity-75 truncate">{msg.fileName}</span>
                        </div>
                      )}
                      <p className="text-xs sm:text-sm break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 sm:gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-yellow-500 transition-colors"
                  >
                    <Smile className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 p-4">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Select a conversation</h3>
              <p className="text-xs sm:text-sm">Choose a user from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}