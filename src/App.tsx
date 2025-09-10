import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/notifications/ToastContainer';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoadingSpinner } from './components/layout/LoadingSpinner';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { TasksPage } from './components/tasks/TasksPage';
import { UsersPage } from './components/users/UsersPage';
import { ChatPage } from './components/chat/ChatPage';
import { NotificationsPage } from './components/notifications/NotificationsPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { WhatsAppPage } from './components/whatsapp/WhatsAppPage';
import { CalendarPage } from './components/calendar/CalendarPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { notificationService } from './services/notificationService';

function AppContent() {
  const { state, dispatch } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Apply theme to document
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Initialize notification service when user logs in
    if (state.currentUser && !notificationService.getFCMToken()) {
      notificationService.initialize();
    }
  }, [state.theme, state.currentUser]);

  // Show loading spinner while data is being loaded
  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (!state.currentUser) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'tasks':
        return <TasksPage />;
      case 'users':
        return state.currentUser?.role === 'master' ? <UsersPage /> : <DashboardPage />;
      case 'chat':
        return <ChatPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'analytics':
        return state.currentUser?.role === 'master' ? <AnalyticsPage /> : <DashboardPage />;
      case 'whatsapp':
        return state.currentUser?.role === 'master' ? <WhatsAppPage /> : <DashboardPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-off-white dark:bg-deep-charcoal transition-colors">
      {/* Overlay for mobile sidebar */}
      {state.sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        />
      )}
      
      <div className="flex">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;