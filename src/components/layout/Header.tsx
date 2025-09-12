import React, { useState } from 'react';
import { Bell, MessageSquare, Sun, Moon, User, LogOut, Menu, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { ChatPanel } from '../chat/ChatPanel';
// import { NotificationStatus } from '../notifications/NotificationPermissionBanner'; // REMOVED

export function Header() {
  const { state, dispatch, logout } = useApp();
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
    logout(); // Use the proper logout function that clears localStorage
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="bg-pure-white dark:bg-soft-black border-b border-light-gray dark:border-deep-charcoal h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 md:px-6 relative z-30">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="lg:hidden p-1.5 sm:p-2 hover:bg-off-white dark:hover:bg-dark-gray rounded-lg transition-colors"
          >
            {state.sidebarOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-deep-charcoal dark:text-pure-white" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-deep-charcoal dark:text-pure-white" />}
          </button>
          <h1 className="text-base sm:text-lg md:text-xl font-semibold text-deep-charcoal dark:text-pure-white truncate">
            <span className="hidden xs:inline">
              {state.currentUser?.role === 'master' ? 'Master Dashboard' : `${state.currentUser?.department} Dashboard`}
            </span>
            <span className="xs:hidden">
              {state.currentUser?.role === 'master' ? 'Master' : state.currentUser?.department}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {/* <NotificationStatus /> */}
          
          <button
            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
            className="p-1.5 sm:p-2 hover:bg-off-white dark:hover:bg-dark-gray rounded-lg transition-colors"
          >
            {state.theme === 'light' ? 
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-medium-gray" /> : 
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-medium-gray" />
            }
          </button>

          <div className="relative">
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-1.5 sm:p-2 hover:bg-off-white dark:hover:bg-dark-gray rounded-lg transition-colors relative"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-medium-gray" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-pure-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 sm:p-2 hover:bg-off-white dark:hover:bg-dark-gray rounded-lg transition-colors relative"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-medium-gray" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-pure-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 hover:bg-off-white dark:hover:bg-dark-gray rounded-lg transition-colors"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-gold rounded-full flex items-center justify-center">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-pure-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white hidden sm:block">
                {state.currentUser?.name}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-pure-white dark:bg-dark-gray rounded-lg shadow-lg border border-light-gray dark:border-soft-black py-2 z-50">
                <div className="px-3 sm:px-4 py-2 border-b border-light-gray dark:border-soft-black">
                  <p className="text-xs sm:text-sm font-medium text-deep-charcoal dark:text-pure-white truncate">{state.currentUser?.name}</p>
                  <p className="text-xs text-medium-gray truncate">{state.currentUser?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
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