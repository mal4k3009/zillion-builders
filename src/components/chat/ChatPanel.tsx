import React from 'react';
import { X, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const { state } = useApp();

  const recentChats = state.chatMessages
    .filter(msg => msg.receiverId === state.currentUser?.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  if (!isOpen) return null;

  return (
    <div className="fixed right-2 sm:right-6 top-16 sm:top-20 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Messages</h3>
        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
        </button>
      </div>

      <div className="max-h-80 sm:max-h-96 overflow-y-auto">
        {recentChats.length > 0 ? (
          recentChats.map((msg) => {
            const sender = state.users.find(u => u.id === msg.senderId);
            return (
              <div key={msg.id} className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">
                      {sender?.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {sender?.name}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 sm:p-8 text-center">
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No recent messages</p>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={onClose}
          className="w-full text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All Messages
        </button>
      </div>
    </div>
  );
}