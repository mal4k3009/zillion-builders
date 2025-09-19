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
  | { type: 'DELETE_PROJECT'; payload: number }
  | { type: 'SET_USER_CATEGORIES'; payload: UserCategory[] }
  | { type: 'ADD_USER_CATEGORY'; payload: UserCategory }
  | { type: 'UPDATE_USER_CATEGORY'; payload: UserCategory }
  | { type: 'DELETE_USER_CATEGORY'; payload: number }
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
  projects: [],
  userCategories: [],
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
  updateProject: (id: number, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  createCategory: (categoryData: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: number, categoryData: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  // User category management functions
  createUserCategory: (categoryData: Omit<UserCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUserCategory: (id: number, categoryData: Partial<UserCategory>) => Promise<void>;
  deleteUserCategory: (id: number) => Promise<void>;
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

  // Load all data from Firebase
  const loadAllData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [users, chatMessages, notifications, whatsappMessages, activities, projects, userCategories] = await Promise.all([
        usersService.getAll(),
        chatService.getAll(),
        notificationsService.getAll(),
        whatsappService.getAll(),
        activitiesService.getAll(),
        projectsService.getAll(),
        userCategoriesService.getAll()
      ]);

      dispatch({ type: 'SET_USERS', payload: users });
      // Tasks will be loaded via real-time subscription
      subscribeToTasks();
      dispatch({ type: 'SET_CHAT_MESSAGES', payload: chatMessages });
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      dispatch({ type: 'SET_WHATSAPP_MESSAGES', payload: whatsappMessages });
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });
      dispatch({ type: 'SET_PROJECTS', payload: projects });
      dispatch({ type: 'SET_USER_CATEGORIES', payload: userCategories });

      // Initialize task monitoring service with users data
      taskMonitoringService.initialize(users);
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
      
      // Create notification for task assignment if assignedTo is specified
      if (taskData.assignedTo && state.currentUser) {
        await notificationsService.createTaskAssignmentNotification(
          taskId,
          taskData.assignedTo,
          state.currentUser.id,
          state.currentUser.name,
          taskData.title
        );
      }
      
      await loadAllData(); // Reload to get the updated data
      return taskId;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      // Get the original task to check for assignee changes
      const originalTask = state.tasks.find(task => task.id === id);
      
      if (!originalTask) {
        console.error('Task not found for update:', id);
        return;
      }

      // Create updated task object for immediate UI update
      const updatedTask = { ...originalTask, ...taskData };
      
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
        }
      }
      
      // Reload data to ensure sync with backend
      await loadAllData();
    } catch (error) {
      console.error('Error updating task:', error);
      // If the update failed, reload data to revert to the correct state
      await loadAllData();
    }
  };

  const deleteTask = async (id: string) => {
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
      const newUserId = await usersService.create(userData);
      console.log('✅ User created with ID:', newUserId);
      await loadAllData();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Re-throw to let the UI handle the error
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
      await notificationsService.create(notificationData);
      await loadAllData();
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

  // Real-time notification subscription
  const subscribeToUserNotifications = (userId: number) => {
    const unsubscribe = notificationsService.onUserNotificationsSnapshot(
      userId,
      (notifications) => {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      }
    );
    return unsubscribe;
  };

  // Real-time task subscription
  const subscribeToTasks = () => {
    const unsubscribe = tasksService.onTasksSnapshot(
      (tasks) => {
        dispatch({ type: 'SET_TASKS', payload: tasks });
      }
    );
    return unsubscribe;
  };

  // Activity operations
  const createActivity = async (activityData: Omit<Activity, 'id'>) => {
    try {
      // Optimistic update: Add activity to local state immediately
      const tempActivity: Activity = {
        ...activityData,
        id: Date.now(), // Temporary ID for optimistic update
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
      await authService.signOut();
      console.log('👋 User manually logged out:', currentUserName);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Initialize app and Firebase Auth on component mount
  useEffect(() => {
    const initializeApp = async () => {
      // Load all data first
      await loadAllData();
      
      // Initialize Firebase Auth and set up auth state listener
      console.log('🔥 Initializing Firebase Auth...');
      authService.onAuthStateChange((user) => {
        console.log('🔥 Auth state changed in context:', user ? user.name : 'No user');
        dispatch({ type: 'SET_CURRENT_USER', payload: user });
        
        if (user) {
          // Initialize FCM for logged in user
          initializeFCMForUser(user);
        }
      });
      
      // Initialize auth service (this will restore any existing auth state)
      await authService.init();
      
      // Start the automatic task status service
      taskAutoStatusService.start();
    };
    
    initializeApp();
    
    // Cleanup function to stop the service when component unmounts
    return () => {
      taskAutoStatusService.stop();
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
        id: parseInt(projectId),
        categories: []
      };
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
    } catch (error) {
      console.error('Error creating project:', error);
      // If error, reload data to sync with server
      await loadAllData();
    }
  };

  const updateProject = async (id: number, projectData: Partial<Project>) => {
    try {
      await projectsService.update(id, projectData);
      
      // Optimistic update: Update project in state immediately
      const currentProject = state.projects.find(p => p.id === id);
      if (currentProject) {
        const updatedProject = { ...currentProject, ...projectData };
        dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      // If error, reload data to sync with server
      await loadAllData();
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await projectsService.delete(id);
      dispatch({ type: 'DELETE_PROJECT', payload: id });
    } catch (error) {
      console.error('Error deleting project:', error);
      // If error, reload data to sync with server
      await loadAllData();
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

  const updateCategory = async (id: number, categoryData: Partial<Category>) => {
    try {
      await categoriesService.update(id, categoryData);
      
      // Reload projects to get updated categories
      const updatedProjects = await projectsService.getAll();
      dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (id: number) => {
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
        id: parseInt(categoryId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dispatch({ type: 'ADD_USER_CATEGORY', payload: newCategory });
    } catch (error) {
      console.error('Error creating user category:', error);
      // If error, reload data to sync with server
      const updatedCategories = await userCategoriesService.getAll();
      dispatch({ type: 'SET_USER_CATEGORIES', payload: updatedCategories });
    }
  };

  const updateUserCategory = async (id: number, categoryData: Partial<UserCategory>) => {
    try {
      await userCategoriesService.update(id, categoryData);
      
      // Optimistic update: Update category in state immediately
      const currentCategory = state.userCategories.find(c => c.id === id);
      if (currentCategory) {
        const updatedCategory = { ...currentCategory, ...categoryData };
        dispatch({ type: 'UPDATE_USER_CATEGORY', payload: updatedCategory });
      }
    } catch (error) {
      console.error('Error updating user category:', error);
      // If error, reload data to sync with server
      const updatedCategories = await userCategoriesService.getAll();
      dispatch({ type: 'SET_USER_CATEGORIES', payload: updatedCategories });
    }
  };

  const deleteUserCategory = async (id: number) => {
    try {
      await userCategoriesService.delete(id);
      dispatch({ type: 'DELETE_USER_CATEGORY', payload: id });
    } catch (error) {
      console.error('Error deleting user category:', error);
      // If error, reload data to sync with server
      const updatedCategories = await userCategoriesService.getAll();
      dispatch({ type: 'SET_USER_CATEGORIES', payload: updatedCategories });
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