import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from './config';
import { User, Task, ChatMessage, Notification, WhatsAppMessage, Activity } from '../types';

// Users Service
export const usersService = {
  async getAll(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as User));
  },

  async getById(id: number): Promise<User | null> {
    const docRef = doc(db, 'users', id.toString());
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id, ...docSnap.data() } as User : null;
  },

  async getByDepartment(department: string): Promise<User[]> {
    const q = query(collection(db, 'users'), where('department', '==', department));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as User));
  },

  async create(userData: Omit<User, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: number, userData: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', id.toString());
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: number): Promise<void> {
    await deleteDoc(doc(db, 'users', id.toString()));
  },

  async updateFCMToken(userId: number, fcmToken: string): Promise<void> {
    const docRef = doc(db, 'users', userId.toString());
    await updateDoc(docRef, { 
      fcmToken: fcmToken,
      lastTokenUpdate: serverTimestamp()
    });
  }
};

// Tasks Service
export const tasksService = {
  async getAll(): Promise<Task[]> {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as Task));
  },

  async getById(id: number): Promise<Task | null> {
    const docRef = doc(db, 'tasks', id.toString());
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id, ...docSnap.data() } as Task : null;
  },

  async getByDepartment(department: string): Promise<Task[]> {
    const q = query(
      collection(db, 'tasks'), 
      where('department', '==', department),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as Task));
  },

  async getByAssignee(userId: number): Promise<Task[]> {
    const q = query(
      collection(db, 'tasks'), 
      where('assignedTo', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as Task));
  },

  async getByStatus(status: string): Promise<Task[]> {
    const q = query(
      collection(db, 'tasks'), 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as Task));
  },

  async create(taskData: Omit<Task, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: number, taskData: Partial<Task>): Promise<void> {
    const docRef = doc(db, 'tasks', id.toString());
    await updateDoc(docRef, {
      ...taskData,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: number): Promise<void> {
    await deleteDoc(doc(db, 'tasks', id.toString()));
  }
};

// Chat Messages Service
export const chatService = {
  async getAll(): Promise<ChatMessage[]> {
    const q = query(collection(db, 'chatMessages'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
      } as ChatMessage;
    });
  },

  async getConversation(userId1: number, userId2: number): Promise<ChatMessage[]> {
    const q = query(
      collection(db, 'chatMessages'),
      where('participants', 'array-contains-any', [`${userId1}_${userId2}`, `${userId2}_${userId1}`]),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
      } as ChatMessage;
    });
  },

  // Real-time listener for conversations
  onConversationSnapshot(userId1: number, userId2: number, callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, 'chatMessages'),
      where('participants', 'array-contains-any', [`${userId1}_${userId2}`, `${userId2}_${userId1}`]),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
        } as ChatMessage;
      });
      callback(messages);
    });
  },

  // Real-time listener for all user's conversations
  onUserConversationsSnapshot(userId: number, callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, 'chatMessages'),
      where('participants', 'array-contains', userId.toString()),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
        } as ChatMessage;
      });
      callback(messages);
    });
  },

  async send(messageData: Omit<ChatMessage, 'id'>): Promise<string> {
    const participants = [
      `${messageData.senderId}_${messageData.receiverId}`,
      `${messageData.receiverId}_${messageData.senderId}`
    ];
    
    const docRef = await addDoc(collection(db, 'chatMessages'), {
      ...messageData,
      participants,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async markAsRead(messageIds: string[]): Promise<void> {
    const batch: Promise<void>[] = [];
    for (const messageId of messageIds) {
      const docRef = doc(db, 'chatMessages', messageId);
      batch.push(updateDoc(docRef, { isRead: true }));
    }
    await Promise.all(batch);
  },

  async markConversationAsRead(userId1: number, userId2: number): Promise<void> {
    const q = query(
      collection(db, 'chatMessages'),
      where('senderId', '==', userId2),
      where('receiverId', '==', userId1),
      where('isRead', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const batch: Promise<void>[] = [];
    
    querySnapshot.docs.forEach((doc) => {
      batch.push(updateDoc(doc.ref, { isRead: true }));
    });
    
    if (batch.length > 0) {
      await Promise.all(batch);
    }
  }
};

// Notifications Service
export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as Notification));
  },

  async getByUser(userId: number): Promise<Notification[]> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as Notification));
  },

  async create(notificationData: Omit<Notification, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async markAsRead(id: number): Promise<void> {
    const docRef = doc(db, 'notifications', id.toString());
    await updateDoc(docRef, { isRead: true });
  },

  async delete(id: number): Promise<void> {
    await deleteDoc(doc(db, 'notifications', id.toString()));
  }
};

// WhatsApp Messages Service
export const whatsappService = {
  async getAll(): Promise<WhatsAppMessage[]> {
    const q = query(collection(db, 'whatsappMessages'), orderBy('sentAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as WhatsAppMessage));
  },

  async create(messageData: Omit<WhatsAppMessage, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'whatsappMessages'), {
      ...messageData,
      sentAt: serverTimestamp()
    });
    return docRef.id;
  },

  async updateStatus(id: number, status: string): Promise<void> {
    const docRef = doc(db, 'whatsappMessages', id.toString());
    await updateDoc(docRef, { status });
  }
};

// Activities Service
export const activitiesService = {
  async getAll(): Promise<Activity[]> {
    const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as Activity));
  },

  async getRecent(limit: number = 10): Promise<Activity[]> {
    const q = query(
      collection(db, 'activities'), 
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.slice(0, limit).map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    } as Activity));
  },

  async create(activityData: Omit<Activity, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'activities'), {
      ...activityData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  }
};

// Dashboard Stats Service
export const dashboardService = {
  async getStats() {
    const tasks = await tasksService.getAll();
    const activities = await activitiesService.getRecent(5);

    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const overdueTasks = tasks.filter(task => 
      new Date(task.dueDate) < new Date() && task.status !== 'completed'
    ).length;

    const departmentStats: Record<string, number> = {};
    tasks.forEach(task => {
      departmentStats[task.department] = (departmentStats[task.department] || 0) + 1;
    });

    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      departmentStats,
      recentActivity: activities
    };
  }
};

// Reference data
export const referenceDataService = {
  async getDepartments() {
    return [
      { id: 'sales', name: 'Sales', color: '#10B981' },
      { id: 'pr', name: 'Public Relations', color: '#8B5CF6' },
      { id: 'marketing', name: 'Marketing', color: '#F59E0B' },
      { id: 'operations', name: 'Operations', color: '#3B82F6' }
    ];
  },

  async getPriorityLevels() {
    return [
      { id: 'low', name: 'Low', color: '#6B7280' },
      { id: 'medium', name: 'Medium', color: '#F59E0B' },
      { id: 'high', name: 'High', color: '#EF4444' },
      { id: 'urgent', name: 'Urgent', color: '#DC2626' }
    ];
  },

  async getTaskStatuses() {
    return [
      { id: 'pending', name: 'Pending', color: '#6B7280' },
      { id: 'in-progress', name: 'In Progress', color: '#F59E0B' },
      { id: 'completed', name: 'Completed', color: '#10B981' }
    ];
  }
};
