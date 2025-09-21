import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';
import { User, Task, ChatMessage, Notification, WhatsAppMessage, Activity, Project, Category, UserCategory } from '../types';

// Utility function to remove undefined values from objects
const cleanUndefinedFields = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const cleaned: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      (cleaned as Record<string, unknown>)[key] = value;
    }
  }
  return cleaned;
};

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

  async getNextUserId(): Promise<number> {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const existingIds = querySnapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id));
    return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
  },

  async create(userData: Omit<User, 'id'>): Promise<number> {
    const nextId = await this.getNextUserId();
    const docRef = doc(db, 'users', nextId.toString());
    
    // Remove undefined fields to prevent Firestore errors
    const cleanUserData = Object.fromEntries(
      Object.entries(userData).filter(([, value]) => value !== undefined)
    );
    
    await setDoc(docRef, {
      ...cleanUserData,
      createdAt: serverTimestamp()
    });
    return nextId;
  },

  async createWithAuth(userData: Omit<User, 'id'>): Promise<number> {
    try {
      console.log('� Creating user in Firestore database...');
      
      // Create Firestore user
      const nextId = await this.getNextUserId();
      const docRef = doc(db, 'users', nextId.toString());
      
      // Remove undefined fields to prevent Firestore errors
      const cleanUserData = Object.fromEntries(
        Object.entries(userData).filter(([, value]) => value !== undefined)
      );
      
      await setDoc(docRef, {
        ...cleanUserData,
        createdAt: serverTimestamp()
      });
      
      console.log('✅ User created in Firestore with ID:', nextId);
      return nextId;
      
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  },

  async update(id: number, userData: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', id.toString());
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: number): Promise<void> {
    try {
      console.log('🗑️ Deleting user from Firestore:', id);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', id.toString()));
      
      console.log('✅ User deleted successfully from Firestore');
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
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
      id: doc.id, // Use string ID from Firebase
      ...doc.data() 
    } as Task));
  },

  async getById(id: string): Promise<Task | null> {
    const docRef = doc(db, 'tasks', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id, ...docSnap.data() } as Task : null;
  },

  async getByCategory(category: string): Promise<Task[]> {
    const q = query(
      collection(db, 'tasks'), 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, // Use string ID
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
      id: doc.id, // Use string ID
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
      id: doc.id, // Use string ID
      ...doc.data() 
    } as Task));
  },

  async create(taskData: Omit<Task, 'id'>): Promise<string> {
    const cleanedData = cleanUndefinedFields(taskData);
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, taskData: Partial<Task>): Promise<void> {
    const docRef = doc(db, 'tasks', id);
    const cleanedData = cleanUndefinedFields(taskData);
    await updateDoc(docRef, {
      ...cleanedData,
      updatedAt: serverTimestamp()
    });
  },

  async getPausedTasksForReactivation(): Promise<Task[]> {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('status', '==', 'paused'),
        orderBy('dueDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const tasks = querySnapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data() 
      } as Task));

      // Filter tasks that should be reactivated (10 days before due date)
      const currentTime = new Date();
      const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;

      return tasks.filter(task => {
        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        const reactivationTime = new Date(dueDate.getTime() - tenDaysInMs);
        
        return currentTime >= reactivationTime;
      });
    } catch (error) {
      console.error('Error getting paused tasks for reactivation:', error);
      return [];
    }
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'tasks', id));
  },

  // Real-time subscription
  onTasksSnapshot(callback: (tasks: Task[]) => void): () => void {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      try {
        const tasks = snapshot.docs.map(doc => ({ 
          id: doc.id,
          ...doc.data() 
        } as Task));
        callback(tasks);
      } catch (error) {
        console.error('Error in tasks snapshot:', error);
        callback([]); // Return empty array on error
      }
    }, (error) => {
      console.error('Error in tasks snapshot listener:', error);
      callback([]); // Return empty array on error
    });
  },

  // Approval workflow methods
  async assignToDirector(taskId: string, directorId: number): Promise<void> {
    const docRef = doc(db, 'tasks', taskId);
    await updateDoc(docRef, {
      assignedDirector: directorId,
      assignedTo: directorId,
      status: 'assigned_to_director',
      currentApprovalLevel: 'none',
      updatedAt: serverTimestamp()
    });
  },

  async assignToEmployee(taskId: string, employeeId: number): Promise<void> {
    const docRef = doc(db, 'tasks', taskId);
    await updateDoc(docRef, {
      assignedEmployee: employeeId,
      assignedTo: employeeId,
      status: 'assigned_to_employee',
      currentApprovalLevel: 'none',
      updatedAt: serverTimestamp()
    });
  },

  async markAsCompletedByEmployee(taskId: string): Promise<void> {
    const docRef = doc(db, 'tasks', taskId);
    const task = await this.getById(taskId);
    
    if (!task) throw new Error('Task not found');
    
    // Check if this task should go directly to chairman approval (skip director)
    if (task.directChairmanApproval || task.skipDirectorApproval) {
      // Find a chairman user to assign the approval to
      const users = await usersService.getAll();
      const chairmen = users.filter(u => u.role === 'chairman' || u.designation === 'chairman');
      const chairman = chairmen.length > 0 
        ? chairmen.sort((a, b) => b.id - a.id)[0] 
        : users.find(u => u.role === 'master');
      
      // Create approval entry for chairman (skip director)
      const chairmanApprovalEntry = {
        id: `${taskId}_chairman_${Date.now()}`,
        taskId,
        approverUserId: chairman?.id || task.createdBy,
        approverRole: 'chairman' as const,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };

      await updateDoc(docRef, {
        status: 'pending_chairman_approval',
        currentApprovalLevel: 'chairman',
        approvalChain: [chairmanApprovalEntry],
        updatedAt: serverTimestamp()
      });
    } else {
      // Normal workflow: create approval entry for director
      const approvalEntry = {
        id: `${taskId}_director_${Date.now()}`,
        taskId,
        approverUserId: task.assignedDirector || 0,
        approverRole: 'director' as const,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };

      await updateDoc(docRef, {
        status: 'pending_director_approval',
        currentApprovalLevel: 'director',
        approvalChain: [approvalEntry],
        updatedAt: serverTimestamp()
      });
    }
  },

  async approveByDirector(taskId: string, approved: boolean, rejectionReason?: string): Promise<void> {
    const docRef = doc(db, 'tasks', taskId);
    const task = await this.getById(taskId);
    
    if (!task) throw new Error('Task not found');
    
    if (approved) {
      // Find a chairman user to assign the approval to
      const users = await usersService.getAll();
      const chairmen = users.filter(u => u.role === 'chairman' || u.designation === 'chairman');
      
      // Sort by ID and take the highest ID (most recent chairman)
      const chairman = chairmen.length > 0 
        ? chairmen.sort((a, b) => b.id - a.id)[0] 
        : users.find(u => u.role === 'master');
      
      console.log('🔍 Found chairmen:', chairmen.map(c => `ID: ${c.id}, Name: ${c.name}, Role: ${c.role}, Designation: ${c.designation}`));
      console.log('✅ Selected chairman for approval:', chairman ? `ID: ${chairman.id}, Name: ${chairman.name}` : 'None');
      
      // Create approval entry for chairman
      const chairmanApprovalEntry = {
        id: `${taskId}_chairman_${Date.now()}`,
        taskId,
        approverUserId: chairman?.id || task.createdBy, // Fallback to task creator if no chairman found
        approverRole: 'chairman' as const,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };

      // Update director approval to approved
      const updatedApprovalChain = task.approvalChain.map(approval => 
        approval.approverRole === 'director' 
          ? { ...approval, status: 'approved' as const, approvedAt: new Date().toISOString() }
          : approval
      );

      await updateDoc(docRef, {
        status: 'pending_chairman_approval',
        currentApprovalLevel: 'chairman',
        approvalChain: [...updatedApprovalChain, chairmanApprovalEntry],
        updatedAt: serverTimestamp()
      });
    } else {
      // Reject and send back to employee
      const updatedApprovalChain = task.approvalChain.map(approval => 
        approval.approverRole === 'director' 
          ? { 
              ...approval, 
              status: 'rejected' as const, 
              approvedAt: new Date().toISOString(),
              rejectionReason 
            }
          : approval
      );

      await updateDoc(docRef, {
        status: 'rejected',
        currentApprovalLevel: 'none',
        rejectionReason,
        approvalChain: updatedApprovalChain,
        updatedAt: serverTimestamp()
      });
    }
  },

  async approveByChairman(taskId: string, approved: boolean, rejectionReason?: string): Promise<void> {
    const docRef = doc(db, 'tasks', taskId);
    const task = await this.getById(taskId);
    
    if (!task) throw new Error('Task not found');
    
    if (approved) {
      // Update chairman approval to approved and mark task as completed
      const updatedApprovalChain = task.approvalChain.map(approval => 
        approval.approverRole === 'chairman' 
          ? { ...approval, status: 'approved' as const, approvedAt: new Date().toISOString() }
          : approval
      );

      await updateDoc(docRef, {
        status: 'completed',
        currentApprovalLevel: 'none',
        approvalChain: updatedApprovalChain,
        updatedAt: serverTimestamp()
      });
    } else {
      // Reject and send back to employee
      const updatedApprovalChain = task.approvalChain.map(approval => 
        approval.approverRole === 'chairman' 
          ? { 
              ...approval, 
              status: 'rejected' as const, 
              approvedAt: new Date().toISOString(),
              rejectionReason 
            }
          : approval
      );

      await updateDoc(docRef, {
        status: 'rejected',
        currentApprovalLevel: 'none',
        rejectionReason,
        approvalChain: updatedApprovalChain,
        updatedAt: serverTimestamp()
      });
    }
  },

  // Keep the old method for backward compatibility
  async approveByAdmin(taskId: string, approved: boolean, rejectionReason?: string): Promise<void> {
    return this.approveByChairman(taskId, approved, rejectionReason);
  },

  async getTasksAwaitingApproval(userId: number, role: 'director' | 'master' | 'chairman'): Promise<Task[]> {
    let approvalLevel: string;
    let statusToQuery: string;
    
    if (role === 'chairman') {
      approvalLevel = 'chairman';
      statusToQuery = 'pending_chairman_approval';
    } else if (role === 'master') {
      approvalLevel = 'admin';
      statusToQuery = 'pending_admin_approval';
    } else {
      approvalLevel = 'director';
      statusToQuery = 'pending_director_approval';
    }
    
    const q = query(
      collection(db, 'tasks'),
      where('currentApprovalLevel', '==', approvalLevel),
      where('status', '==', statusToQuery),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map(doc => ({ 
      id: doc.id,
      ...doc.data() 
    } as Task));

    // Additional filtering based on assigned approver
    return tasks.filter(task => {
      const pendingApproval = task.approvalChain.find(
        approval => approval.approverRole === approvalLevel && approval.status === 'pending'
      );
      return pendingApproval?.approverUserId === userId;
    });
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
    console.log(`🔥 Setting up real-time listener for conversation: User ${userId1} ↔ User ${userId2}`);
    
    // Use a broader query to get all messages and then filter client-side
    // This avoids complex Firestore index requirements
    const q = query(
      collection(db, 'chatMessages'),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      try {
        console.log(`📨 Real-time update received! ${querySnapshot.docs.length} total messages found`);
        
        // Filter messages for this specific conversation
        const conversationMessages = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Handle both string and number IDs for compatibility
            const senderId = typeof data.senderId === 'string' ? parseInt(data.senderId) : data.senderId;
            const receiverId = typeof data.receiverId === 'string' ? parseInt(data.receiverId) : data.receiverId;
            
            return { 
              id: doc.id, 
              ...data,
              senderId,
              receiverId,
              timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
            } as ChatMessage;
          })
          .filter(msg => {
            // Check if this message belongs to the conversation between userId1 and userId2
            const isConversationMessage = 
              (msg.senderId === userId1 && msg.receiverId === userId2) ||
              (msg.senderId === userId2 && msg.receiverId === userId1);
            
            if (isConversationMessage) {
              console.log(`📨 Found conversation message: ${msg.senderId} → ${msg.receiverId}: ${msg.content?.substring(0, 50)}...`);
            }
            
            return isConversationMessage;
          })
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        console.log(`📋 Filtered conversation messages: ${conversationMessages.length} for users ${userId1} ↔ ${userId2}`);
        callback(conversationMessages);
      } catch (error) {
        console.error('Error processing conversation messages:', error);
        callback([]); // Return empty array on error
      }
    }, (error) => {
      console.error('❌ Error in real-time listener:', error);
      callback([]); // Return empty array on error
    });
  },

  // Real-time listener for all user's conversations
  onUserConversationsSnapshot(userId: number, callback: (messages: ChatMessage[]) => void) {
    // Use a simpler query without complex indexing requirements
    const q = query(
      collection(db, 'chatMessages'),
      where('senderId', '==', userId)
    );
    
    const q2 = query(
      collection(db, 'chatMessages'),
      where('receiverId', '==', userId)
    );
    
    // We'll need to combine results from both queries
    let allMessages: ChatMessage[] = [];
    let completedSubscriptions = 0;
    
    const combineAndCallback = () => {
      try {
        completedSubscriptions++;
        if (completedSubscriptions === 2) {
          // Remove duplicates and sort
          const uniqueMessages = allMessages
            .filter((msg, index, self) => index === self.findIndex(m => m.id === msg.id))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 100);
          
          callback(uniqueMessages);
          completedSubscriptions = 0; // Reset for next update
        }
      } catch (error) {
        console.error('Error combining conversation messages:', error);
        callback([]); // Return empty array on error
      }
    };
    
    const unsubscribe1 = onSnapshot(q, (querySnapshot) => {
      try {
        const messages = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
          } as ChatMessage;
        });
        allMessages = [...allMessages.filter(m => m.senderId !== userId), ...messages];
        combineAndCallback();
      } catch (error) {
        console.error('Error in sender messages snapshot:', error);
        combineAndCallback();
      }
    }, (error) => {
      console.error('Error in sender messages listener:', error);
      combineAndCallback();
    });
    
    const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
      try {
        const messages = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp
          } as ChatMessage;
        });
        allMessages = [...allMessages.filter(m => m.receiverId !== userId), ...messages];
        combineAndCallback();
      } catch (error) {
        console.error('Error in receiver messages snapshot:', error);
        combineAndCallback();
      }
    }, (error) => {
      console.error('Error in receiver messages listener:', error);
      combineAndCallback();
    });
    
    // Return a function that unsubscribes from both listeners
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  },

  async send(messageData: Omit<ChatMessage, 'id'>): Promise<string> {
    console.log(`💾 Storing chat message:`, {
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      content: messageData.content?.substring(0, 50),
      type: messageData.type
    });
    
    const participants = [
      `${messageData.senderId}_${messageData.receiverId}`,
      `${messageData.receiverId}_${messageData.senderId}`
    ];
    
    // Ensure IDs are stored as numbers for consistency
    const cleanMessageData = {
      ...messageData,
      senderId: Number(messageData.senderId),
      receiverId: Number(messageData.receiverId),
      participants,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'chatMessages'), cleanMessageData);
    console.log(`✅ Chat message stored with ID: ${docRef.id}`);
    return docRef.id;
  },

  async deleteMessage(messageId: string): Promise<void> {
    const docRef = doc(db, 'chatMessages', messageId);
    await deleteDoc(docRef);
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
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      } as Notification;
    });
  },

  async getByUser(userId: number): Promise<Notification[]> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      } as Notification;
    });
  },

  // Real-time listener for user notifications
  onUserNotificationsSnapshot(userId: number, callback: (notifications: Notification[]) => void) {
    console.log(`🔔 Setting up notification listener for User ${userId}`);
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      try {
        console.log(`📨 Notification update received! ${querySnapshot.docs.length} notifications found`);
        
        const notifications = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
          } as Notification;
        });
        
        callback(notifications);
      } catch (error) {
        console.error('Error processing notifications:', error);
        callback([]); // Return empty array on error
      }
    }, (error) => {
      console.error('❌ Error in notification listener:', error);
      callback([]); // Return empty array on error
    });
  },

  async create(notificationData: Omit<Notification, 'id'>): Promise<string> {
    console.log('🔔 Creating notification:', notificationData);
    
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: serverTimestamp()
    });
    
    console.log('✅ Notification created with ID:', docRef.id);
    return docRef.id;
  },

  async markAsRead(id: string): Promise<void> {
    const docRef = doc(db, 'notifications', id);
    await updateDoc(docRef, { isRead: true });
  },

  async markAllAsRead(userId: number): Promise<void> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
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
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'notifications', id));
  },

  // Automatic notification creators
  async createMessageNotification(senderId: number, receiverId: number, senderName: string, messageContent: string): Promise<string> {
    const notification: Omit<Notification, 'id'> = {
      userId: receiverId,
      title: 'New Message',
      message: `${senderName} sent you a message: "${messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent}"`,
      type: 'message_received',
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedUserId: senderId,
      relatedUserName: senderName,
      actionUrl: '/chat',
      priority: 'medium'
    };
    
    return await this.create(notification);
  },

  async createTaskAssignmentNotification(taskId: string, assignedUserId: number, assignedByUserId: number, assignedByName: string, taskTitle: string): Promise<string> {
    const notification: Omit<Notification, 'id'> = {
      userId: assignedUserId,
      title: 'New Task Assigned',
      message: `${assignedByName} assigned you a new task: "${taskTitle}"`,
      type: 'task_assigned',
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedUserId: assignedByUserId,
      relatedUserName: assignedByName,
      taskId: taskId,
      actionUrl: '/tasks',
      priority: 'high'
    };
    
    return await this.create(notification);
  },

  async createTaskUpdateNotification(taskId: string, updatedByUserId: number, updatedByName: string, adminUserId: number, taskTitle: string, newStatus: string): Promise<string> {
    const notification: Omit<Notification, 'id'> = {
      userId: adminUserId,
      title: 'Task Status Updated',
      message: `${updatedByName} updated task "${taskTitle}" to ${newStatus}`,
      type: 'task_updated',
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedUserId: updatedByUserId,
      relatedUserName: updatedByName,
      taskId: taskId,
      actionUrl: '/tasks',
      priority: newStatus === 'completed' ? 'high' : 'medium'
    };
    
    return await this.create(notification);
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
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const overdueTasks = tasks.filter(task => 
      new Date(task.dueDate) < new Date() && task.status !== 'completed'
    ).length;

    const categoryStats: Record<string, number> = {};
    tasks.forEach(task => {
      categoryStats[task.category] = (categoryStats[task.category] || 0) + 1;
    });

    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      categoryStats,
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
      { id: 'in_progress', name: 'In Progress', color: '#F59E0B' },
      { id: 'completed', name: 'Completed', color: '#10B981' }
    ];
  }
};

// Projects Service
export const projectsService = {
  async getAll(): Promise<Project[]> {
    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    const projects: Project[] = [];
    
    for (const projectDoc of projectsSnapshot.docs) {
      const projectData = projectDoc.data();
      
      // Get categories for this project
      const categoriesSnapshot = await getDocs(
        query(collection(db, 'categories'), where('projectId', '==', parseInt(projectDoc.id)))
      );
      
      const categories = categoriesSnapshot.docs.map(categoryDoc => ({
        id: parseInt(categoryDoc.id),
        ...categoryDoc.data()
      } as Category));
      
      projects.push({
        id: parseInt(projectDoc.id),
        ...projectData,
        categories
      } as Project);
    }
    
    return projects;
  },

  async getById(id: number): Promise<Project | null> {
    const docRef = doc(db, 'projects', id.toString());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    // Get categories for this project
    const categoriesSnapshot = await getDocs(
      query(collection(db, 'categories'), where('projectId', '==', id))
    );
    
    const categories = categoriesSnapshot.docs.map(categoryDoc => ({
      id: parseInt(categoryDoc.id),
      ...categoryDoc.data()
    } as Category));
    
    return {
      id,
      ...docSnap.data(),
      categories
    } as Project;
  },

  async create(projectData: Omit<Project, 'id' | 'categories'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: number, projectData: Partial<Project>): Promise<void> {
    const docRef = doc(db, 'projects', id.toString());
    await updateDoc(docRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: number): Promise<void> {
    // First delete all categories associated with this project
    const categoriesSnapshot = await getDocs(
      query(collection(db, 'categories'), where('projectId', '==', id))
    );
    
    const deletePromises = categoriesSnapshot.docs.map(categoryDoc => 
      deleteDoc(doc(db, 'categories', categoryDoc.id))
    );
    
    await Promise.all(deletePromises);
    
    // Then delete the project
    const docRef = doc(db, 'projects', id.toString());
    await deleteDoc(docRef);
  }
};

// Categories Service
export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    return querySnapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as Category));
  },

  async getByProjectId(projectId: number): Promise<Category[]> {
    const q = query(collection(db, 'categories'), where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as Category));
  },

  async create(categoryData: Omit<Category, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...categoryData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: number, categoryData: Partial<Category>): Promise<void> {
    const docRef = doc(db, 'categories', id.toString());
    await updateDoc(docRef, categoryData);
  },

  async delete(id: number): Promise<void> {
    const docRef = doc(db, 'categories', id.toString());
    await deleteDoc(docRef);
  },

  // Get all categories for dropdown/selection purposes
  async getAllForSelection(): Promise<Array<{id: number, name: string, color?: string, projectName: string}>> {
    const projects = await projectsService.getAll();
    const allCategories: Array<{id: number, name: string, color?: string, projectName: string}> = [];
    
    projects.forEach(project => {
      project.categories.forEach(category => {
        allCategories.push({
          id: category.id,
          name: category.name,
          color: category.color,
          projectName: project.name
        });
      });
    });
    
    return allCategories;
  }
};

// User Categories Service
export const userCategoriesService = {
  async getAll(): Promise<UserCategory[]> {
    const querySnapshot = await getDocs(collection(db, 'userCategories'));
    return querySnapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as UserCategory));
  },

  async create(categoryData: Omit<UserCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'userCategories'), {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: number, categoryData: Partial<UserCategory>): Promise<void> {
    const docRef = doc(db, 'userCategories', id.toString());
    await updateDoc(docRef, {
      ...categoryData,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: number): Promise<void> {
    const docRef = doc(db, 'userCategories', id.toString());
    await deleteDoc(docRef);
  },

  async getByUserId(userId: number): Promise<UserCategory[]> {
    const q = query(collection(db, 'userCategories'), where('assignedUsers', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    } as UserCategory));
  }
};
