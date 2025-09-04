import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Task, ChatMessage, Notification, WhatsAppMessage, Activity } from '../types';
import { mockUsers, mockTasks, mockChatMessages, mockNotifications, mockWhatsAppMessages, mockActivities } from '../data/mockData';

interface AppState {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  chatMessages: ChatMessage[];
  notifications: Notification[];
  whatsappMessages: WhatsAppMessage[];
  activities: Activity[];
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

type AppAction =
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: number }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'MARK_MESSAGES_READ'; payload: { senderId: number; receiverId: number } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: number }
  | { type: 'ADD_WHATSAPP_MESSAGE'; payload: WhatsAppMessage }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'LOAD_DATA' };

const initialState: AppState = {
  currentUser: null,
  users: [],
  tasks: [],
  chatMessages: [],
  notifications: [],
  whatsappMessages: [],
  activities: [],
  theme: 'light',
  sidebarOpen: true
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      const savedData = localStorage.getItem('taskManagementApp');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return { ...state, ...parsed };
      }
      return {
        ...state,
        users: mockUsers,
        tasks: mockTasks,
        chatMessages: mockChatMessages,
        notifications: mockNotifications,
        whatsappMessages: mockWhatsAppMessages,
        activities: mockActivities
      };

    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };

    case 'ADD_USER':
      const newUsers = [...state.users, action.payload];
      return { ...state, users: newUsers };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        )
      };

    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };

    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };

    case 'MARK_MESSAGES_READ':
      return {
        ...state,
        chatMessages: state.chatMessages.map(message =>
          message.senderId === action.payload.senderId && 
          message.receiverId === action.payload.receiverId
            ? { ...message, isRead: true }
            : message
        )
      };

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload 
            ? { ...notification, isRead: true }
            : notification
        )
      };

    case 'ADD_WHATSAPP_MESSAGE':
      return { ...state, whatsappMessages: [...state.whatsappMessages, action.payload] };

    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities] };

    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'LOAD_DATA' });
  }, []);

  useEffect(() => {
    const { currentUser, ...dataToSave } = state;
    if (state.users.length > 0) {
      localStorage.setItem('taskManagementApp', JSON.stringify(dataToSave));
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}