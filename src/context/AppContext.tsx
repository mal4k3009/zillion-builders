import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Task, ChatMessage, Notification, WhatsAppMessage, Activity } from '../types';
import { 
  usersService, 
  tasksService, 
  chatService, 
  notificationsService, 
  whatsappService, 
  activitiesService 
} from '../firebase/services';
import { taskMonitoringService } from '../services/taskMonitoringService';

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
  loading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: number }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_CHAT_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'MARK_MESSAGES_READ'; payload: { senderId: number; receiverId: number } }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: number }
  | { type: 'SET_WHATSAPP_MESSAGES'; payload: WhatsAppMessage[] }
  | { type: 'ADD_WHATSAPP_MESSAGE'; payload: WhatsAppMessage }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR' };

const initialState: AppState = {
  currentUser: null,
  users: [],
  tasks: [],
  chatMessages: [],
  notifications: [],
  whatsappMessages: [],
  activities: [],
  theme: 'light',
  sidebarOpen: true,
  loading: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };

    case 'SET_USERS':
      return { ...state, users: action.payload };

    case 'ADD_USER': {
      const newUsers = [...state.users, action.payload];
      return { ...state, users: newUsers };
    }

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

    case 'SET_TASKS':
      return { ...state, tasks: action.payload };

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

    case 'SET_CHAT_MESSAGES':
      return { ...state, chatMessages: action.payload };

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

    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };

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

    case 'SET_WHATSAPP_MESSAGES':
      return { ...state, whatsappMessages: action.payload };

    case 'ADD_WHATSAPP_MESSAGE':
      return { ...state, whatsappMessages: [...state.whatsappMessages, action.payload] };

    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };

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

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Firebase service methods
  loadAllData: () => Promise<void>;
  createTask: (taskData: Omit<Task, 'id'>) => Promise<string>;
  updateTask: (id: number, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  createUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: number, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  sendChatMessage: (messageData: Omit<ChatMessage, 'id'>) => Promise<void>;
  createNotification: (notificationData: Omit<Notification, 'id'>) => Promise<void>;
  markNotificationAsRead: (id: number) => Promise<void>;
  createActivity: (activityData: Omit<Activity, 'id'>) => Promise<void>;
  setCurrentUser: (user: User, fcmToken?: string) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load all data from Firebase
  const loadAllData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [users, tasks, chatMessages, notifications, whatsappMessages, activities] = await Promise.all([
        usersService.getAll(),
        tasksService.getAll(),
        chatService.getAll(),
        notificationsService.getAll(),
        whatsappService.getAll(),
        activitiesService.getAll()
      ]);

      dispatch({ type: 'SET_USERS', payload: users });
      dispatch({ type: 'SET_TASKS', payload: tasks });
      dispatch({ type: 'SET_CHAT_MESSAGES', payload: chatMessages });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      dispatch({ type: 'SET_WHATSAPP_MESSAGES', payload: whatsappMessages });
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });

      // Initialize task monitoring service with users data
      taskMonitoringService.initialize(users);
      
      // Restore user session after users are loaded
      setTimeout(() => restoreUserSession(), 100);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Task operations
  const createTask = async (taskData: Omit<Task, 'id'>): Promise<string> => {
    try {
      const taskId = await tasksService.create(taskData);
      await loadAllData(); // Reload to get the updated data
      return taskId;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (id: number, taskData: Partial<Task>) => {
    try {
      await tasksService.update(id, taskData);
      await loadAllData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await tasksService.delete(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
      // Reload data to ensure sync
      await loadAllData();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error; // Re-throw to let UI handle error
    }
  };

  // User operations
  const createUser = async (userData: Omit<User, 'id'>) => {
    try {
      await usersService.create(userData);
      await loadAllData();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      await usersService.update(id, userData);
      await loadAllData();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await usersService.delete(id);
      dispatch({ type: 'DELETE_USER', payload: id });
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Chat operations
  const sendChatMessage = async (messageData: Omit<ChatMessage, 'id'>) => {
    try {
      await chatService.send(messageData);
      await loadAllData();
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  // Notification operations
  const createNotification = async (notificationData: Omit<Notification, 'id'>) => {
    try {
      await notificationsService.create(notificationData);
      await loadAllData();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markNotificationAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Activity operations
  const createActivity = async (activityData: Omit<Activity, 'id'>) => {
    try {
      await activitiesService.create(activityData);
      await loadAllData();
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  // User login and FCM token management
  const setCurrentUser = async (user: User, fcmToken?: string) => {
    try {
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      
      // Save session to localStorage (expires in 30 days)
      const sessionData = {
        userId: user.id,
        expiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
      };
      localStorage.setItem('zillion_user_session', JSON.stringify(sessionData));
      console.log('💾 User session saved for:', user.name);
      
      // If FCM token is provided, store it in the user's document
      if (fcmToken) {
        await usersService.updateFCMToken(user.id, fcmToken);
        console.log('🔔 FCM token stored for user:', user.name);
      }
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    localStorage.removeItem('zillion_user_session');
    console.log('👋 User logged out');
  };

  // Load data and check for existing session on component mount
  useEffect(() => {
    const initializeApp = async () => {
      await loadAllData();
    };
    initializeApp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore user session after users are loaded
  useEffect(() => {
    if (state.users.length > 0 && !state.currentUser) {
      restoreUserSession();
    }
  }, [state.users]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore user session from localStorage
  const restoreUserSession = () => {
    try {
      const savedSession = localStorage.getItem('zillion_user_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        
        // Check if session is still valid
        if (sessionData.expiry > Date.now()) {
          const user = state.users.find(u => u.id === sessionData.userId);
          if (user) {
            console.log('🔄 Restoring user session for:', user.name);
            dispatch({ type: 'SET_CURRENT_USER', payload: user });
            
            // Re-initialize FCM token for this user
            initializeFCMForUser(user);
          } else {
            console.log('⚠️ User not found, clearing session');
            localStorage.removeItem('zillion_user_session');
          }
        } else {
          console.log('⏰ Session expired, clearing session');
          localStorage.removeItem('zillion_user_session');
        }
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      localStorage.removeItem('zillion_user_session');
    }
  };

  // Initialize FCM token for logged in user
  const initializeFCMForUser = async (user: User) => {
    try {
      const { requestNotificationPermission } = await import('../firebase/messaging');
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        await usersService.updateFCMToken(user.id, fcmToken);
        console.log('🔔 FCM token updated for user:', user.name);
      }
    } catch (error) {
      console.error('Error initializing FCM for user:', error);
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    loadAllData,
    createTask,
    updateTask,
    deleteTask,
    createUser,
    updateUser,
    deleteUser,
    sendChatMessage,
    createNotification,
    markNotificationAsRead,
    createActivity,
    setCurrentUser,
    logout
  };

  return (
    <AppContext.Provider value={contextValue}>
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