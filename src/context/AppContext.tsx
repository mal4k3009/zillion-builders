import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Task, ChatMessage, Notification, WhatsAppMessage, Activity, Project, Category, UserCategory } from '../types';
import { 
  usersService, 
  tasksService, 
  chatService, 
  notificationsService, 
  whatsappService, 
  activitiesService,
  projectsService,
  categoriesService,
  userCategoriesService
} from '../firebase/services';
import { authService } from '../firebase/auth';
import { taskMonitoringService } from '../services/taskMonitoringService';
import { taskAutoStatusService } from '../services/taskAutoStatusService';
import { fcmService } from '../services/fcmService';
import { notificationService } from '../services/notificationService';
import { useToastNotifications } from '../hooks/useNotifications';
import { ToastContainer } from '../components/notifications/ToastNotifications';
import { sendMessageNotification, sendTaskNotification } from '../firebase/messaging';

interface AppState {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  chatMessages: ChatMessage[];
  notifications: Notification[];
  whatsappMessages: WhatsAppMessage[];
  activities: Activity[];
  projects: Project[];
  userCategories: UserCategory[];
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  loading: boolean;
  authLoading: boolean;
}

// Listener management for cleanup
interface ListenerManager {
  tasksListener?: () => void;
  notificationsListener?: () => void;
  conversationsListener?: () => void;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: number }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_CHAT_MESSAGES'; payload: ChatMessage[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'MARK_MESSAGES_READ'; payload: { senderId: number; receiverId: number } }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_WHATSAPP_MESSAGES'; payload: WhatsAppMessage[] }
  | { type: 'ADD_WHATSAPP_MESSAGE'; payload: WhatsAppMessage }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_USER_CATEGORIES'; payload: UserCategory[] }
  | { type: 'ADD_USER_CATEGORY'; payload: UserCategory }
  | { type: 'UPDATE_USER_CATEGORY'; payload: UserCategory }
  | { type: 'DELETE_USER_CATEGORY'; payload: string }
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR' };

// Initial state helper function for theme persistence
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('sentiment_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Check system preference if no saved theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

const initialState: AppState = {
  currentUser: null,
  users: [],
  tasks: [],
  chatMessages: [],
  notifications: [],
  whatsappMessages: [],
  activities: [],
  projects: [],
  userCategories: [],
  theme: getInitialTheme(),
  sidebarOpen: true,
  loading: false,
  authLoading: true
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };

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

    case 'UPDATE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };
    }

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

    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };

    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        )
      };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload)
      };

    case 'SET_USER_CATEGORIES':
      return { ...state, userCategories: action.payload };

    case 'ADD_USER_CATEGORY':
      return { ...state, userCategories: [...state.userCategories, action.payload] };

    case 'UPDATE_USER_CATEGORY':
      return {
        ...state,
        userCategories: state.userCategories.map(category =>
          category.id === action.payload.id ? action.payload : category
        )
      };

    case 'DELETE_USER_CATEGORY':
      return {
        ...state,
        userCategories: state.userCategories.filter(category => category.id !== action.payload)
      };

    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      // Persist theme to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sentiment_theme', newTheme);
      }
      return { ...state, theme: newTheme };
    }

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
  backgroundSync: () => Promise<void>;
  createTask: (taskData: Omit<Task, 'id'>) => Promise<string>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  createUser: (userData: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: number, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  sendChatMessage: (messageData: Omit<ChatMessage, 'id'>) => Promise<void>;
  deleteChatMessage: (messageId: string) => Promise<void>;
  createNotification: (notificationData: Omit<Notification, 'id'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: (userId: number) => Promise<void>;
  createActivity: (activityData: Omit<Activity, 'id'>) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // Project management functions
  createProject: (projectData: Omit<Project, 'id' | 'categories'>) => Promise<void>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createCategory: (categoryData: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, categoryData: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // User category management functions
  createUserCategory: (categoryData: Omit<UserCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUserCategory: (id: string, categoryData: Partial<UserCategory>) => Promise<void>;
  deleteUserCategory: (id: string) => Promise<void>;
  // Real-time chat functions
  subscribeToUserConversations: (userId: number) => () => void;
  subscribeToConversation: (userId1: number, userId2: number, callback?: (messages: ChatMessage[]) => void) => () => void;
  markConversationAsRead: (userId1: number, userId2: number) => Promise<void>;
  // Real-time notification functions
  subscribeToUserNotifications: (userId: number) => () => void;
  // Real-time task functions
  subscribeToTasks: () => () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toasts, removeToast } = useToastNotifications();
  
  // Listener management for proper cleanup
  const activeListenersRef = React.useRef<ListenerManager>({});
  
  // Cleanup function to unsubscribe from all active listeners
  const cleanupAllListeners = () => {
    const listeners = activeListenersRef.current;
    let cleanedCount = 0;
    
    if (listeners.tasksListener) {
      listeners.tasksListener();
      listeners.tasksListener = undefined;
      cleanedCount++;
    }
    if (listeners.notificationsListener) {
      listeners.notificationsListener();
      listeners.notificationsListener = undefined;
      cleanedCount++;
    }
    if (listeners.conversationsListener) {
      listeners.conversationsListener();
      listeners.conversationsListener = undefined;
      cleanedCount++;
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} active Firestore listeners`);
    }
  };

  // Load all data from Firebase with retry mechanism
  const loadAllData = async (retryCount = 0) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load data with individual error handling
      const [users, chatMessages, notifications, whatsappMessages, activities, projects, userCategories, tasks] = await Promise.allSettled([
        usersService.getAll(),
        chatService.getAll(),
        notificationsService.getAll(),
        whatsappService.getAll(),
        activitiesService.getAll(),
        projectsService.getAll(),
        userCategoriesService.getAll(),
        tasksService.getAll() // Load tasks directly first
      ]);

      // Handle results with fallback to retry if all fail
      const allFailed = [users, chatMessages, notifications, whatsappMessages, activities, projects, userCategories, tasks]
        .every(result => result.status === 'rejected');
      
      if (allFailed && retryCount < 2) {
        console.warn(`All data loading failed, retrying... (${retryCount + 1}/3)`);
        setTimeout(() => loadAllData(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      // Handle users result
      if (users.status === 'fulfilled') {
        dispatch({ type: 'SET_USERS', payload: users.value });
      } else {
        console.error('Error loading users:', users.reason);
        dispatch({ type: 'SET_USERS', payload: [] });
      }

      // Handle other results
      if (chatMessages.status === 'fulfilled') {
        dispatch({ type: 'SET_CHAT_MESSAGES', payload: chatMessages.value });
      } else {
        console.error('Error loading chat messages:', chatMessages.reason);
        dispatch({ type: 'SET_CHAT_MESSAGES', payload: [] });
      }

      if (notifications.status === 'fulfilled') {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications.value });
      } else {
        console.error('Error loading notifications:', notifications.reason);
        dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      }

      if (whatsappMessages.status === 'fulfilled') {
        dispatch({ type: 'SET_WHATSAPP_MESSAGES', payload: whatsappMessages.value });
      } else {
        console.error('Error loading WhatsApp messages:', whatsappMessages.reason);
        dispatch({ type: 'SET_WHATSAPP_MESSAGES', payload: [] });
      }

      if (activities.status === 'fulfilled') {
        dispatch({ type: 'SET_ACTIVITIES', payload: activities.value });
      } else {
        console.error('Error loading activities:', activities.reason);
        dispatch({ type: 'SET_ACTIVITIES', payload: [] });
      }

      if (projects.status === 'fulfilled') {
        dispatch({ type: 'SET_PROJECTS', payload: projects.value });
      } else {
        console.error('Error loading projects:', projects.reason);
        dispatch({ type: 'SET_PROJECTS', payload: [] });
      }

      if (userCategories.status === 'fulfilled') {
        dispatch({ type: 'SET_USER_CATEGORIES', payload: userCategories.value });
      } else {
        console.error('Error loading user categories:', userCategories.reason);
        dispatch({ type: 'SET_USER_CATEGORIES', payload: [] });
      }

      // Handle tasks result - load directly first
      if (tasks.status === 'fulfilled') {
        dispatch({ type: 'SET_TASKS', payload: tasks.value });
      } else {
        console.error('Error loading tasks:', tasks.reason);
        dispatch({ type: 'SET_TASKS', payload: [] });
      }

      // Clean up existing listeners before setting up new ones
      cleanupAllListeners();
      
      // Set up real-time subscription for tasks after initial load (with cleanup tracking)
      activeListenersRef.current.tasksListener = subscribeToTasks();

      // Initial load of chat messages (one-time read instead of real-time listener to save reads)
      if (state.currentUser?.id) {
        const chatMessages = await chatService.getUserConversations(state.currentUser.id);
        dispatch({ type: 'SET_CHAT_MESSAGES', payload: chatMessages });
      }

      // Initialize task monitoring service with users data
      const usersData = users.status === 'fulfilled' ? users.value : [];
      taskMonitoringService.initialize(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Background sync function that doesn't show loading states
  const backgroundSync = async () => {
    try {
      // Load data silently without setting loading state
      const currentUserId = state.currentUser?.id;
      const [users, chatMessages, notifications, whatsappMessages, activities, projects, userCategories] = await Promise.allSettled([
        usersService.getAll(),
        currentUserId ? chatService.getUserConversations(currentUserId) : chatService.getAll(),
        notificationsService.getAll(),
        whatsappService.getAll(),
        activitiesService.getAll(),
        projectsService.getAll(),
        userCategoriesService.getAll()
      ]);

      // Update state only if data has changed (optional optimization)
      if (users.status === 'fulfilled') {
        dispatch({ type: 'SET_USERS', payload: users.value });
      }
      if (chatMessages.status === 'fulfilled') {
        dispatch({ type: 'SET_CHAT_MESSAGES', payload: chatMessages.value });
      }
      if (notifications.status === 'fulfilled') {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications.value });
      }
      if (whatsappMessages.status === 'fulfilled') {
        dispatch({ type: 'SET_WHATSAPP_MESSAGES', payload: whatsappMessages.value });
      }
      if (activities.status === 'fulfilled') {
        dispatch({ type: 'SET_ACTIVITIES', payload: activities.value });
      }
      if (projects.status === 'fulfilled') {
        dispatch({ type: 'SET_PROJECTS', payload: projects.value });
      }
      if (userCategories.status === 'fulfilled') {
        dispatch({ type: 'SET_USER_CATEGORIES', payload: userCategories.value });
      }
    } catch (error) {
      console.error('Error in background sync:', error);
    }
  };

  // Task operations
  const createTask = async (taskData: Omit<Task, 'id'>): Promise<string> => {
    try {
      const taskId = await tasksService.create(taskData);
      
      // Create the task object for immediate UI update
      const newTask: Task = {
        id: taskId,
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Update UI immediately
      dispatch({ type: 'ADD_TASK', payload: newTask });
      
      // Create notification for task assignment if assignedTo is specified
      if (taskData.assignedTo && state.currentUser) {
        await notificationsService.createTaskAssignmentNotification(
          taskId,
          taskData.assignedTo,
          state.currentUser.id,
          state.currentUser.name,
          taskData.title
        );

        // Send FCM push notification for new task assignment
        await sendTaskNotification(
          taskData.assignedTo,
          taskData.title,
          taskData.description || 'New task assigned to you',
          taskId,
          'assigned'
        );
      }
      
      return taskId;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    let originalTask: Task | undefined;
    try {
      // Get the original task to check for assignee changes
      originalTask = state.tasks.find(task => task.id === id);
      
      if (!originalTask) {
        console.error('Task not found for update:', id);
        return;
      }

      // Create updated task object for immediate UI update
      const updatedTask = { 
        ...originalTask, 
        ...taskData,
        updatedAt: new Date().toISOString()
      };
      
      // Update UI immediately
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      
      // Update in Firebase
      await tasksService.update(id, taskData);
      
      // Create notification if task status changed or assignedTo changed
      if (state.currentUser) {
        // Check if status changed to completed, in-progress, etc.
        if (taskData.status && taskData.status !== originalTask.status) {
          const assignedUserId = taskData.assignedTo || originalTask.assignedTo;
          if (assignedUserId) {
            // Find admin users (role 'master') to notify
            const adminUsers = state.users.filter(user => user.role === 'master');
            for (const admin of adminUsers) {
              await notificationsService.createTaskUpdateNotification(
                id,
                assignedUserId,
                state.users.find(u => u.id === assignedUserId)?.name || 'User',
                admin.id,
                originalTask.title,
                taskData.status
              );
            }

            // Send FCM push notification for task status update
            if (taskData.status === 'completed') {
              // Notify admins about task completion
              for (const admin of adminUsers) {
                await sendTaskNotification(
                  admin.id,
                  originalTask.title,
                  `Task completed by ${state.users.find(u => u.id === assignedUserId)?.name || 'User'}`,
                  id,
                  'completed'
                );
              }
            } else {
              // Notify assigned user about status update
              await sendTaskNotification(
                assignedUserId,
                originalTask.title,
                `Task status updated to ${taskData.status}`,
                id,
                'updated'
              );
            }
          }
        }
        
        // Check if assignedTo changed
        if (taskData.assignedTo && taskData.assignedTo !== originalTask.assignedTo) {
          await notificationsService.createTaskAssignmentNotification(
            id,
            taskData.assignedTo,
            state.currentUser.id,
            state.currentUser.name,
            originalTask.title
          );

          // Send FCM push notification for task reassignment
          await sendTaskNotification(
            taskData.assignedTo,
            originalTask.title,
            `Task reassigned to you by ${state.currentUser.name}`,
            id,
            'assigned'
          );
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      // If the update failed, revert the UI change
      if (originalTask) {
        dispatch({ type: 'UPDATE_TASK', payload: originalTask });
      }
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    let taskToDelete: Task | undefined;
    try {
      // Store the task for potential rollback
      taskToDelete = state.tasks.find(task => task.id === id);
      
      // Update UI immediately
      dispatch({ type: 'DELETE_TASK', payload: id });
      
      // Delete from Firebase
      await tasksService.delete(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      // If deletion failed, restore the task
      if (taskToDelete) {
        dispatch({ type: 'ADD_TASK', payload: taskToDelete });
      }
      throw error; // Re-throw to let UI handle error
    }
  };

  // User operations
  const createUser = async (userData: Omit<User, 'id'>) => {
    try {
      // Use createWithAuth to create both Firebase Auth and Firestore user
      const newUserId = await usersService.createWithAuth(userData);
      console.log('✅ User created with Auth and Firestore, ID:', newUserId);
      
      // Create the user object for immediate UI update
      const newUser: User = {
        id: newUserId,
        ...userData,
        lastLogin: undefined,
        createdAt: new Date().toISOString()
      };
      
      // Update UI immediately
      dispatch({ type: 'ADD_USER', payload: newUser });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Re-throw to let the UI handle the error
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    let originalUser: User | undefined;
    try {
      // Get the original user for potential rollback
      originalUser = state.users.find(user => user.id === id);
      
      if (!originalUser) {
        console.error('User not found for update:', id);
        return;
      }

      // Create updated user object for immediate UI update
      const updatedUser = { 
        ...originalUser, 
        ...userData
      };
      
      // Update UI immediately
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      // Update in Firebase
      await usersService.update(id, userData);
    } catch (error) {
      console.error('Error updating user:', error);
      // If the update failed, revert the UI change
      if (originalUser) {
        dispatch({ type: 'UPDATE_USER', payload: originalUser });
      }
      throw error;
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
      // Send to Firebase - real-time listeners will handle UI updates
      await chatService.send(messageData);
      
      // Get sender's name for notification
      const senderUser = state.users.find(user => user.id === messageData.senderId);
      const senderName = senderUser?.name || 'Someone';
      
      // Create notification for the recipient
      await notificationsService.createMessageNotification(
        messageData.senderId,
        messageData.receiverId,
        senderName,
        messageData.content
      );

      // Send WhatsApp notification
      console.log('📱 Sending WhatsApp notification for new chat message');
      await notificationService.sendChatMessageNotification(senderName, messageData.content);

      // Send FCM push notification (keeping for compatibility)
      await sendMessageNotification(
        messageData.senderId,
        messageData.receiverId,
        senderName,
        messageData.content
      );
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  const deleteChatMessage = async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      // Real-time listener will handle removing from state
    } catch (error) {
      console.error('Error deleting chat message:', error);
    }
  };

  // Real-time chat functions
  const subscribeToUserConversations = (userId: number) => {
    return chatService.onUserConversationsSnapshot(userId, (messages) => {
      dispatch({ type: 'SET_CHAT_MESSAGES', payload: messages });
    });
  };

  const subscribeToConversation = (userId1: number, userId2: number, callback?: (messages: ChatMessage[]) => void) => {
    return chatService.onConversationSnapshot(userId1, userId2, (messages) => {
      if (callback) {
        // If callback is provided, use it (for local conversation state)
        callback(messages);
      } else {
        // Otherwise, update global state
        dispatch({ type: 'SET_CHAT_MESSAGES', payload: messages });
      }
    });
  };

  const markConversationAsRead = async (userId1: number, userId2: number) => {
    try {
      await chatService.markConversationAsRead(userId1, userId2);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  // Notification operations
  const createNotification = async (notificationData: Omit<Notification, 'id'>) => {
    try {
      const notificationId = await notificationsService.create(notificationData);
      
      // Create the notification object for immediate UI update
      const newNotification: Notification = {
        id: notificationId,
        ...notificationData,
        createdAt: new Date().toISOString()
      };
      
      // Update UI immediately
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async (userId: number) => {
    try {
      await notificationsService.markAllAsRead(userId);
      // Update all notifications in state to read
      const updatedNotifications = state.notifications.map(notification => 
        notification.userId === userId 
          ? { ...notification, isRead: true }
          : notification
      );
      dispatch({ type: 'SET_NOTIFICATIONS', payload: updatedNotifications });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Real-time notification subscription with duplicate prevention
  const subscribeToUserNotifications = (userId: number) => {
    // Clean up existing notifications listener if any
    if (activeListenersRef.current.notificationsListener) {
      activeListenersRef.current.notificationsListener();
    }
    
    const unsubscribe = notificationsService.onUserNotificationsSnapshot(
      userId,
      (notifications) => {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      }
    );
    
    // Store the listener for cleanup
    activeListenersRef.current.notificationsListener = unsubscribe;
    return unsubscribe;
  };

  // Real-time task subscription with duplicate prevention
  const subscribeToTasks = () => {
    // Clean up existing tasks listener if any
    if (activeListenersRef.current.tasksListener) {
      activeListenersRef.current.tasksListener();
    }
    
    const unsubscribe = tasksService.onTasksSnapshot(
      (tasks) => {
        dispatch({ type: 'SET_TASKS', payload: tasks });
      }
    );
    
    // Store the listener for cleanup
    activeListenersRef.current.tasksListener = unsubscribe;
    return unsubscribe;
  };

  // Activity operations
  const createActivity = async (activityData: Omit<Activity, 'id'>) => {
    try {
      // Optimistic update: Add activity to local state immediately
      const tempActivity: Activity = {
        ...activityData,
        id: Date.now().toString(), // Temporary ID for optimistic update
      };
      dispatch({ type: 'ADD_ACTIVITY', payload: tempActivity });

      // Send to Firebase
      await activitiesService.create(activityData);
      // Note: No need to reload data - the optimistic update handles UI
    } catch (error) {
      console.error('Error creating activity:', error);
      // Optionally remove the optimistic activity on error
    }
  };

  // User authentication using Firebase Auth
  const signInWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authService.signInWithEmail(email, password);
      if (result.success && result.user) {
        console.log('✅ Authentication successful for:', result.user.name);
        
        // Update last login time
        const updatedUser = { ...result.user, lastLogin: new Date().toISOString() };
        await usersService.update(updatedUser.id, updatedUser);
        
        // Initialize FCM for push notifications
        try {
          await fcmService.initializeForUser(result.user.id);
        } catch (fcmError) {
          console.error('FCM initialization failed:', fcmError);
        }
        
        return true;
      } else {
        console.log('❌ Authentication failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const currentUserName = state.currentUser?.name || 'Unknown user';
      
      // Clear authentication
      await authService.signOut();
      
      // Reset application state to initial values
      dispatch({ type: 'SET_CURRENT_USER', payload: null });
      dispatch({ type: 'SET_TASKS', payload: [] });
      dispatch({ type: 'SET_CHAT_MESSAGES', payload: [] });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      
      console.log('👋 User manually logged out and state cleared:', currentUserName);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Initialize app and Firebase Auth on component mount
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Starting app initialization...');
      dispatch({ type: 'SET_AUTH_LOADING', payload: true });
      
      try {
        // Wait for Firebase Auth state
        console.log('🔐 Checking authentication state...');
        
        // Check if user is logged in via Firebase Auth
        const currentUser = authService.getCurrentUser();
        
        if (currentUser) {
          // Find user in database
          const users = await usersService.getAll();
          const dbUser = users.find(u => u.email === currentUser.email);
          
          if (dbUser && dbUser.status === 'active') {
            dispatch({ type: 'SET_CURRENT_USER', payload: dbUser });
            // Load all data initially
            await loadAllData();
          } else {
            console.log('⚠️ User not found in database or inactive');
            await authService.signOut();
          }
        } else {
          console.log('👤 No authenticated user - showing login page');
        }
        
        // Start the automatic task status service
        taskAutoStatusService.start();
        
        // Set up periodic data refresh to catch any missed updates
        const refreshInterval = setInterval(async () => {
          if (state.currentUser && !state.loading) {
            await backgroundSync();
          }
        }, 30000); // Refresh every 30 seconds
        
        // Store interval reference for cleanup
        (globalThis as { __dataRefreshInterval?: NodeJS.Timeout }).__dataRefreshInterval = refreshInterval;
      } catch (error) {
        console.error('❌ Error during app initialization:', error);
      } finally {
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        console.log('✅ App initialization complete');
      }
    };
    
    initializeApp();
    
    // Cleanup function to stop the service when component unmounts
    return () => {
      // Cleanup all active Firestore listeners
      cleanupAllListeners();
      
      taskAutoStatusService.stop();
      // Clear the periodic refresh interval
      const refreshInterval = (globalThis as { __dataRefreshInterval?: NodeJS.Timeout }).__dataRefreshInterval;
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize FCM token for logged in user (DISABLED - n8n will handle notifications)
  const initializeFCMForUser = async (user: User) => {
    try {
      console.log('📴 FCM initialization disabled for user:', user.name, '- Using n8n automation instead');
      // const { requestNotificationPermission } = await import('../firebase/messaging');
      // const fcmToken = await requestNotificationPermission();
      
      // if (fcmToken) {
      //   await usersService.updateFCMToken(user.id, fcmToken);
      //   console.log('🔔 FCM token updated for user:', user.name);
      // }
    } catch (error) {
      console.error('Error in FCM initialization (disabled):', error);
    }
  };

  // Project operations
  const createProject = async (projectData: Omit<Project, 'id' | 'categories'>) => {
    try {
      const projectId = await projectsService.create(projectData);
      
      // Optimistic update: Add new project to state immediately
      const newProject: Project = {
        ...projectData,
        id: projectId, // Keep as string
        categories: []
      };
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    let originalProject: Project | undefined;
    try {
      // Get the original project for potential rollback
      originalProject = state.projects.find(p => p.id === id);
      
      if (!originalProject) {
        console.error('Project not found for update:', id);
        return;
      }

      // Create updated project object for immediate UI update
      const updatedProject = { ...originalProject, ...projectData };
      
      // Update UI immediately
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
      
      // Update in Firebase
      await projectsService.update(id, projectData);
    } catch (error) {
      console.error('Error updating project:', error);
      // If the update failed, revert the UI change
      if (originalProject) {
        dispatch({ type: 'UPDATE_PROJECT', payload: originalProject });
      }
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      // Delete from Firebase FIRST, before updating UI
      await projectsService.delete(id);
      
      // Only update UI after successful deletion
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  // Category operations
  const createCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      await categoriesService.create(categoryData);
      
      // For categories, we need to reload the projects to get updated categories
      // This is necessary because categories are nested within projects
      const updatedProjects = await projectsService.getAll();
      dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      await categoriesService.update(id, categoryData);
      
      // Reload projects to get updated categories
      const updatedProjects = await projectsService.getAll();
      dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoriesService.delete(id);
      
      // Reload projects to get updated categories
      const updatedProjects = await projectsService.getAll();
      dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // User Category operations
  const createUserCategory = async (categoryData: Omit<UserCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const categoryId = await userCategoriesService.create(categoryData);
      
      // Optimistic update: Add new category to state immediately
      const newCategory: UserCategory = {
        ...categoryData,
        id: categoryId, // Keep as string
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dispatch({ type: 'ADD_USER_CATEGORY', payload: newCategory });
    } catch (error) {
      console.error('Error creating user category:', error);
      throw error;
    }
  };

  const updateUserCategory = async (id: string, categoryData: Partial<UserCategory>) => {
    let originalCategory: UserCategory | undefined;
    try {
      // Get the original category for potential rollback
      originalCategory = state.userCategories.find(c => c.id === id);
      
      if (!originalCategory) {
        console.error('User category not found for update:', id);
        return;
      }

      // Create updated category object for immediate UI update
      const updatedCategory = { 
        ...originalCategory, 
        ...categoryData,
        updatedAt: new Date().toISOString()
      };
      
      // Update UI immediately
      dispatch({ type: 'UPDATE_USER_CATEGORY', payload: updatedCategory });
      
      // Update in Firebase
      await userCategoriesService.update(id, categoryData);
    } catch (error) {
      console.error('Error updating user category:', error);
      // If the update failed, revert the UI change
      if (originalCategory) {
        dispatch({ type: 'UPDATE_USER_CATEGORY', payload: originalCategory });
      }
      throw error;
    }
  };

  const deleteUserCategory = async (id: string) => {
    try {
      // Delete from Firebase FIRST, before updating UI
      await userCategoriesService.delete(id);
      
      // Only update UI after successful deletion
      dispatch({ type: 'DELETE_USER_CATEGORY', payload: id });
    } catch (error) {
      console.error('Error deleting user category:', error);
      throw error;
    }
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    loadAllData,
    backgroundSync,
    createTask,
    updateTask,
    deleteTask,
    createUser,
    updateUser,
    deleteUser,
    sendChatMessage,
    deleteChatMessage,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    createActivity,
    signInWithEmail,
    logout,
    createProject,
    updateProject,
    deleteProject,
    createCategory,
    updateCategory,
    deleteCategory,
    createUserCategory,
    updateUserCategory,
    deleteUserCategory,
    subscribeToUserConversations,
    subscribeToConversation,
    markConversationAsRead,
    subscribeToUserNotifications,
    subscribeToTasks
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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