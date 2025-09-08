import React, { useState } from 'react';
import { Bell, MessageSquare, Sun, Moon, User, LogOut, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { ChatPanel } from '../chat/ChatPanel';

export function Header() {
  const { state, dispatch } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadNotifications = state.notifications.filter(n => 
    n.userId === state.currentUser?.id && !n.isRead
  ).length;

  const unreadMessages = state.chatMessages.filter(m =>
    m.receiverId === state.currentUser?.id && !m.isRead
  ).length;

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-pure-white dark:bg-soft-black border-b border-light-gray dark:border-deep-charcoal h-16 flex items-center justify-between px-6 relative z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="lg:hidden p-2 hover:bg-off-white dark:hover:bg-dark-gray rounded-lg transition-colors"
          >
            {state.sidebarOpen ? <X className="w-5 h-5 text-deep-charcoal dark:text-pure-white" /> : <Menu className="w-5 h-5 text-deep-charcoal dark:text-pure-white" />}
          </button>
          <h1 className="text-xl font-semibold text-deep-charcoal dark:text-pure-white">
            {state.currentUser?.role === 'master' ? 'Master Dashboard' : `${state.currentUser?.department} Dashboard`}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
            className="p-2 hover:bg-off-white dark:hover:bg-dark-gray rounded-lg transition-colors"
          >
            {state.theme === 'light' ? 
              <Moon className="w-5 h-5 text-medium-gray" /> : 
              <Sun className="w-5 h-5 text-medium-gray" />
            }
          </button>

          <div className="relative">
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 hover:bg-off-white dark:hover:bg-dark-gray rounded-lg transition-colors relative"
            >
              <MessageSquare className="w-5 h-5 text-medium-gray" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-pure-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-off-white dark:hover:bg-dark-gray rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5 text-medium-gray" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-pure-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-off-white dark:hover:bg-dark-gray rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-pure-white" />
              </div>
              <span className="text-sm font-medium text-deep-charcoal dark:text-pure-white hidden sm:block">
                {state.currentUser?.name}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-pure-white dark:bg-dark-gray rounded-lg shadow-lg border border-light-gray dark:border-soft-black py-2">
                <div className="px-4 py-2 border-b border-light-gray dark:border-soft-black">
                  <p className="text-sm font-medium text-deep-charcoal dark:text-pure-white">{state.currentUser?.name}</p>
                  <p className="text-xs text-medium-gray">{state.currentUser?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <ChatPanel 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />
    </>
  );
}