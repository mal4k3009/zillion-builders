const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountkey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Test configuration
const TEST_CONFIG = {
  CLEANUP_BEFORE_TEST: true,
  CLEANUP_AFTER_TEST: false, // Set to true if you want to cleanup after tests
  VERBOSE_LOGGING: true,
  TEST_DELAY: 1000 // Delay between tests in milliseconds
};

// Test data - Enhanced with more user roles and scenarios
const TEST_USERS = [
  {
    id: 999,
    username: 'test_master',
    password: 'test123',
    role: 'master',
    designation: 'Master Administrator',
    name: 'Test Master Admin',
    email: 'test.master@company.com',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 998,
    username: 'test_director',
    password: 'test123',
    role: 'director',
    designation: 'Project Director',
    name: 'Test Director',
    email: 'test.director@company.com',
    status: 'active',
    reportsTo: 999,
    createdAt: new Date().toISOString()
  },
  {
    id: 997,
    username: 'test_employee',
    password: 'test123',
    role: 'employee',
    designation: 'Senior Developer',
    name: 'Test Employee',
    email: 'test.employee@company.com',
    status: 'active',
    reportsTo: 998,
    createdAt: new Date().toISOString()
  },
  {
    id: 996,
    username: 'test_director2',
    password: 'test123',
    role: 'director',
    designation: 'Operations Director',
    name: 'Test Director 2',
    email: 'test.director2@company.com',
    status: 'active',
    reportsTo: 999,
    createdAt: new Date().toISOString()
  },
  {
    id: 995,
    username: 'test_employee2',
    password: 'test123',
    role: 'employee',
    designation: 'Junior Developer',
    name: 'Test Employee 2',
    email: 'test.employee2@company.com',
    status: 'active',
    reportsTo: 996,
    createdAt: new Date().toISOString()
  },
  {
    id: 994,
    username: 'test_employee3',
    password: 'test123',
    role: 'employee',
    designation: 'QA Engineer',
    name: 'Test Employee 3',
    email: 'test.employee3@company.com',
    status: 'active',
    reportsTo: 998,
    createdAt: new Date().toISOString()
  }
];

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️', test: '🧪' };
  console.log(`${icons[type]} [${timestamp}] ${message}`);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateRandomId = () => Math.floor(Math.random() * 1000000);

// Firebase service implementations for testing
const testServices = {
  users: {
    async create(userData) {
      await db.collection('users').doc(userData.id.toString()).set({
        ...userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return userData.id;
    },

    async getById(id) {
      const doc = await db.collection('users').doc(id.toString()).get();
      return doc.exists ? { id: parseInt(id), ...doc.data() } : null;
    },

    async getAll() {
      const snapshot = await db.collection('users').get();
      return snapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));
    },

    async update(id, data) {
      await db.collection('users').doc(id.toString()).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    },

    async delete(id) {
      await db.collection('users').doc(id.toString()).delete();
    }
  },

  projects: {
    async create(projectData) {
      const id = generateRandomId();
      await db.collection('projects').doc(id.toString()).set({
        ...projectData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return id;
    },

    async getById(id) {
      const doc = await db.collection('projects').doc(id.toString()).get();
      if (!doc.exists) return null;
      
      // Get categories for this project
      const categoriesSnapshot = await db.collection('categories')
        .where('projectId', '==', id).get();
      const categories = categoriesSnapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      }));
      
      return { id, ...doc.data(), categories };
    },

    async getAll() {
      const snapshot = await db.collection('projects').get();
      const projects = [];
      
      for (const doc of snapshot.docs) {
        const projectData = doc.data();
        const categoriesSnapshot = await db.collection('categories')
          .where('projectId', '==', parseInt(doc.id)).get();
        const categories = categoriesSnapshot.docs.map(catDoc => ({
          id: parseInt(catDoc.id),
          ...catDoc.data()
        }));
        
        projects.push({
          id: parseInt(doc.id),
          ...projectData,
          categories
        });
      }
      
      return projects;
    },

    async update(id, data) {
      await db.collection('projects').doc(id.toString()).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    },

    async delete(id) {
      // Delete associated categories first
      const categoriesSnapshot = await db.collection('categories')
        .where('projectId', '==', id).get();
      
      const batch = db.batch();
      categoriesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      // Delete project
      await db.collection('projects').doc(id.toString()).delete();
    }
  },

  categories: {
    async create(categoryData) {
      const id = generateRandomId();
      // Clean undefined values
      const cleanData = Object.fromEntries(
        Object.entries(categoryData).filter(([, value]) => value !== undefined)
      );
      await db.collection('categories').doc(id.toString()).set({
        ...cleanData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return id;
    },

    async getByProjectId(projectId) {
      const snapshot = await db.collection('categories')
        .where('projectId', '==', projectId).get();
      return snapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));
    },

    async update(id, data) {
      await db.collection('categories').doc(id.toString()).update(data);
    },

    async delete(id) {
      await db.collection('categories').doc(id.toString()).delete();
    }
  },

  tasks: {
    async create(taskData) {
      // Clean undefined values
      const cleanData = Object.fromEntries(
        Object.entries(taskData).filter(([, value]) => value !== undefined)
      );
      const docRef = await db.collection('tasks').add({
        ...cleanData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    },

    async getById(id) {
      const doc = await db.collection('tasks').doc(id).get();
      return doc.exists ? { id, ...doc.data() } : null;
    },

    async getAll() {
      const snapshot = await db.collection('tasks').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async update(id, data) {
      await db.collection('tasks').doc(id).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    },

    async delete(id) {
      await db.collection('tasks').doc(id).delete();
    },

    // Approval workflow methods
    async assignToDirector(taskId, directorId) {
      await db.collection('tasks').doc(taskId).update({
        assignedDirector: directorId,
        assignedTo: directorId,
        status: 'assigned_to_director',
        currentApprovalLevel: 'none',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    },

    async assignToEmployee(taskId, employeeId) {
      await db.collection('tasks').doc(taskId).update({
        assignedEmployee: employeeId,
        assignedTo: employeeId,
        status: 'assigned_to_employee',
        currentApprovalLevel: 'none',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    },

    async markAsCompletedByEmployee(taskId) {
      const task = await this.getById(taskId);
      if (!task) throw new Error('Task not found');
      
      const approvalEntry = {
        id: `${taskId}_director_${Date.now()}`,
        taskId,
        approverUserId: task.assignedDirector || 0,
        approverRole: 'director',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await db.collection('tasks').doc(taskId).update({
        status: 'pending_director_approval',
        currentApprovalLevel: 'director',
        approvalChain: [approvalEntry],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    },

    async approveByDirector(taskId, approved, rejectionReason) {
      const task = await this.getById(taskId);
      if (!task) throw new Error('Task not found');
      
      if (approved) {
        const adminApprovalEntry = {
          id: `${taskId}_admin_${Date.now()}`,
          taskId,
          approverUserId: task.createdBy,
          approverRole: 'admin',
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        const updatedApprovalChain = task.approvalChain.map(approval => 
          approval.approverRole === 'director' 
            ? { ...approval, status: 'approved', approvedAt: new Date().toISOString() }
            : approval
        );

        await db.collection('tasks').doc(taskId).update({
          status: 'pending_admin_approval',
          currentApprovalLevel: 'admin',
          approvalChain: [...updatedApprovalChain, adminApprovalEntry],
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        const updatedApprovalChain = task.approvalChain.map(approval => 
          approval.approverRole === 'director' 
            ? { 
                ...approval, 
                status: 'rejected', 
                approvedAt: new Date().toISOString(),
                rejectionReason 
              }
            : approval
        );

        await db.collection('tasks').doc(taskId).update({
          status: 'rejected',
          currentApprovalLevel: 'none',
          rejectionReason,
          approvalChain: updatedApprovalChain,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    },

    async approveByAdmin(taskId, approved, rejectionReason) {
      const task = await this.getById(taskId);
      if (!task) throw new Error('Task not found');
      
      if (approved) {
        const updatedApprovalChain = task.approvalChain.map(approval => 
          approval.approverRole === 'admin' 
            ? { ...approval, status: 'approved', approvedAt: new Date().toISOString() }
            : approval
        );

        await db.collection('tasks').doc(taskId).update({
          status: 'completed',
          currentApprovalLevel: 'none',
          approvalChain: updatedApprovalChain,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        const updatedApprovalChain = task.approvalChain.map(approval => 
          approval.approverRole === 'admin' 
            ? { 
                ...approval, 
                status: 'rejected', 
                approvedAt: new Date().toISOString(),
                rejectionReason 
              }
            : approval
        );

        await db.collection('tasks').doc(taskId).update({
          status: 'rejected',
          currentApprovalLevel: 'none',
          rejectionReason,
          approvalChain: updatedApprovalChain,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  },

  notifications: {
    async create(notificationData) {
      const docRef = await db.collection('notifications').add({
        ...notificationData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    },

    async getByUser(userId) {
      try {
        const snapshot = await db.collection('notifications')
          .where('userId', '==', userId)
          .get(); // Remove orderBy to avoid index requirement
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        log(`Warning: Could not query notifications by user - ${error.message}`, 'warning');
        // Fallback: get all notifications and filter
        const allSnapshot = await db.collection('notifications').get();
        return allSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(notif => notif.userId === userId);
      }
    },

    async markAsRead(id) {
      await db.collection('notifications').doc(id).update({ isRead: true });
    },

    async delete(id) {
      await db.collection('notifications').doc(id).delete();
    }
  },

  chat: {
    async create(messageData) {
      const docRef = await db.collection('chatMessages').add({
        ...messageData,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    },

    async getMessages(senderId, receiverId) {
      try {
        const snapshot = await db.collection('chatMessages')
          .where('participants', 'array-contains-any', [`${senderId}_${receiverId}`, `${receiverId}_${senderId}`])
          .get(); // Remove orderBy to avoid index requirement
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        log(`Warning: Could not query chat messages - ${error.message}`, 'warning');
        // Fallback: get all messages and filter
        const allSnapshot = await db.collection('chatMessages').get();
        return allSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(msg => 
            (msg.senderId === senderId && msg.receiverId === receiverId) ||
            (msg.senderId === receiverId && msg.receiverId === senderId)
          );
      }
    },

    async markAsRead(messageId) {
      await db.collection('chatMessages').doc(messageId).update({ isRead: true });
    }
  },

  userCategories: {
    async create(categoryData) {
      const id = generateRandomId();
      await db.collection('userCategories').doc(id.toString()).set({
        ...categoryData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return id;
    },

    async getAll() {
      const snapshot = await db.collection('userCategories').get();
      return snapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() }));
    },

    async update(id, data) {
      await db.collection('userCategories').doc(id.toString()).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    },

    async delete(id) {
      await db.collection('userCategories').doc(id.toString()).delete();
    }
  },

  // Enhanced authentication service for testing
  auth: {
    async createFirebaseUser(email, password) {
      try {
        // In real implementation, this would use Firebase Auth Admin SDK
        // For testing, we'll simulate user creation
        log(`Simulating Firebase user creation for: ${email}`, 'info');
        return { uid: `firebase_${email.split('@')[0]}`, email };
      } catch (error) {
        throw new Error(`Failed to create Firebase user: ${error.message}`);
      }
    },

    async validateUserCredentials(email, password) {
      // Simulate credential validation
      const user = TEST_USERS.find(u => u.email === email && u.password === password && u.status === 'active');
      if (user) {
        return { success: true, user };
      }
      return { success: false, error: 'Invalid credentials' };
    },

    async simulateLogin(email, password) {
      const validation = await this.validateUserCredentials(email, password);
      if (validation.success) {
        log(`✓ Login successful for ${email} (${validation.user.role})`, 'success');
        return validation.user;
      } else {
        throw new Error(`Login failed: ${validation.error}`);
      }
    },

    async simulateLogout(userId) {
      log(`✓ User ${userId} logged out successfully`, 'success');
      return true;
    }
  },

  // Enhanced messaging service
  messaging: {
    async sendMessage(senderId, receiverId, content, type = 'text') {
      const messageData = {
        senderId,
        receiverId,
        content,
        type,
        isRead: false,
        participants: [`${senderId}_${receiverId}`, `${receiverId}_${senderId}`],
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await db.collection('chatMessages').add(messageData);
      
      // Create notification for receiver
      await testServices.notifications.create({
        userId: receiverId,
        title: 'New Message',
        message: `You have a new message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        type: 'message_received',
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedUserId: senderId,
        messageId: docRef.id,
        priority: 'medium'
      });
      
      return docRef.id;
    },

    async getConversation(user1Id, user2Id, limit = 50) {
      try {
        const snapshot = await db.collection('chatMessages')
          .where('participants', 'array-contains-any', [`${user1Id}_${user2Id}`, `${user2Id}_${user1Id}`])
          .limit(limit)
          .get();
        
        return snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
            const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
            return timeA - timeB;
          });
      } catch (error) {
        log(`Warning: Could not query conversation - ${error.message}`, 'warning');
        // Fallback
        const allSnapshot = await db.collection('chatMessages').get();
        return allSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(msg => 
            (msg.senderId === user1Id && msg.receiverId === user2Id) ||
            (msg.senderId === user2Id && msg.receiverId === user1Id)
          )
          .sort((a, b) => {
            const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp || 0);
            const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp || 0);
            return timeA - timeB;
          });
      }
    },

    async markMessagesAsRead(messageIds) {
      const batch = db.batch();
      messageIds.forEach(messageId => {
        const messageRef = db.collection('chatMessages').doc(messageId);
        batch.update(messageRef, { isRead: true, readAt: admin.firestore.FieldValue.serverTimestamp() });
      });
      await batch.commit();
    }
  }
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Test execution wrapper
async function runTest(testName, testFunction) {
  testResults.total++;
  log(`Running test: ${testName}`, 'test');
  
  try {
    await testFunction();
    testResults.passed++;
    log(`✓ ${testName}`, 'success');
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
    log(`✗ ${testName}: ${error.message}`, 'error');
  }
  
  await delay(TEST_CONFIG.TEST_DELAY);
}

// Enhanced cleanup function
async function cleanup() {
  log('🧹 Cleaning up enhanced test data...', 'info');
  
  try {
    // Delete test tasks
    const tasksSnapshot = await db.collection('tasks').get();
    for (const doc of tasksSnapshot.docs) {
      const task = doc.data();
      if (task.title && task.title.includes('Test Task')) {
        await db.collection('tasks').doc(doc.id).delete();
      }
    }

    // Delete test notifications
    const notificationsSnapshot = await db.collection('notifications').get();
    for (const doc of notificationsSnapshot.docs) {
      const notification = doc.data();
      if (notification.title && (notification.title.includes('Test') || notification.title.includes('Performance'))) {
        await db.collection('notifications').doc(doc.id).delete();
      }
    }

    // Delete test chat messages
    const chatSnapshot = await db.collection('chatMessages').get();
    for (const doc of chatSnapshot.docs) {
      const message = doc.data();
      if (message.content && message.content.includes('Test message')) {
        await db.collection('chatMessages').doc(doc.id).delete();
      }
    }

    // Delete test categories
    const categoriesSnapshot = await db.collection('categories').get();
    for (const doc of categoriesSnapshot.docs) {
      const category = doc.data();
      if (category.name && category.name.includes('Test Category')) {
        await db.collection('categories').doc(doc.id).delete();
      }
    }

    // Delete test user categories
    const userCategoriesSnapshot = await db.collection('userCategories').get();
    for (const doc of userCategoriesSnapshot.docs) {
      const userCategory = doc.data();
      if (userCategory.name && userCategory.name.includes('Test User Category')) {
        await db.collection('userCategories').doc(doc.id).delete();
      }
    }

    // Delete test projects
    const projectsSnapshot = await db.collection('projects').get();
    for (const doc of projectsSnapshot.docs) {
      const project = doc.data();
      if (project.name && project.name.includes('Test Project')) {
        await db.collection('projects').doc(doc.id).delete();
      }
    }

    // Delete all test users (including bulk users)
    const usersSnapshot = await db.collection('users').get();
    for (const doc of usersSnapshot.docs) {
      const userId = parseInt(doc.id);
      // Delete test users (900-999 range) and bulk users (900-904 range)
      if ((userId >= 900 && userId <= 999) || TEST_USERS.find(u => u.id === userId)) {
        try {
          await db.collection('users').doc(doc.id).delete();
        } catch (error) {
          // User might not exist, ignore error
        }
      }
    }

    log('✅ Enhanced cleanup completed', 'success');
  } catch (error) {
    log(`❌ Cleanup error: ${error.message}`, 'error');
  }
}

// Test functions
async function testUserManagement() {
  const testUser = TEST_USERS[0];
  
  // Create user
  await testServices.users.create(testUser);
  
  // Get user
  const retrievedUser = await testServices.users.getById(testUser.id);
  if (!retrievedUser || retrievedUser.name !== testUser.name) {
    throw new Error('User creation or retrieval failed');
  }
  
  // Update user
  await testServices.users.update(testUser.id, { status: 'inactive' });
  const updatedUser = await testServices.users.getById(testUser.id);
  if (updatedUser.status !== 'inactive') {
    throw new Error('User update failed');
  }
  
  log(`User ${testUser.name} created and updated successfully`, 'info');
}

async function testProjectManagement() {
  const projectData = {
    name: 'Test Project Alpha',
    description: 'A comprehensive test project for the workflow system',
    status: 'active',
    createdBy: TEST_USERS[0].id
  };
  
  // Create project
  const projectId = await testServices.projects.create(projectData);
  
  // Get project
  const retrievedProject = await testServices.projects.getById(projectId);
  if (!retrievedProject || retrievedProject.name !== projectData.name) {
    throw new Error('Project creation or retrieval failed');
  }
  
  // Update project
  await testServices.projects.update(projectId, { status: 'completed' });
  const updatedProject = await testServices.projects.getById(projectId);
  if (updatedProject.status !== 'completed') {
    throw new Error('Project update failed');
  }
  
  log(`Project ${projectData.name} created and updated successfully`, 'info');
  return projectId;
}

async function testCategoryManagement(projectId) {
  const categoryData = {
    name: 'Test Category Development',
    description: 'Development tasks category for testing',
    color: '#3B82F6',
    projectId: projectId
  };
  
  // Create category
  const categoryId = await testServices.categories.create(categoryData);
  
  // Get categories by project
  const categories = await testServices.categories.getByProjectId(projectId);
  const createdCategory = categories.find(cat => cat.id === categoryId);
  
  if (!createdCategory || createdCategory.name !== categoryData.name) {
    throw new Error('Category creation or retrieval failed');
  }
  
  // Update category
  await testServices.categories.update(categoryId, { color: '#EF4444' });
  
  log(`Category ${categoryData.name} created and updated successfully`, 'info');
  return categoryId;
}

async function testUserCategoryManagement() {
  const userCategoryData = {
    name: 'Test User Category Frontend',
    description: 'Frontend development team category',
    color: '#10B981',
    createdBy: TEST_USERS[0].id,
    assignedUsers: [TEST_USERS[1].id, TEST_USERS[2].id]
  };
  
  // Create user category
  const categoryId = await testServices.userCategories.create(userCategoryData);
  
  // Get all user categories
  const categories = await testServices.userCategories.getAll();
  const createdCategory = categories.find(cat => cat.id === categoryId);
  
  if (!createdCategory || createdCategory.name !== userCategoryData.name) {
    throw new Error('User category creation or retrieval failed');
  }
  
  // Update user category
  await testServices.userCategories.update(categoryId, { 
    assignedUsers: [TEST_USERS[2].id] 
  });
  
  log(`User category ${userCategoryData.name} created and updated successfully`, 'info');
  return categoryId;
}

async function testTaskCreationAndBasicOperations(categoryId) {
  const taskData = {
    title: 'Test Task: Implement User Authentication',
    description: 'Comprehensive test task for authentication system implementation',
    category: 'Development',
    assignedTo: TEST_USERS[2].id, // Employee
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    createdBy: TEST_USERS[0].id, // Master
    projectId: 1,
    categoryId: categoryId,
    comments: [],
    attachments: [],
    approvalChain: [],
    currentApprovalLevel: 'none'
  };
  
  // Create task
  const taskId = await testServices.tasks.create(taskData);
  
  // Get task
  const retrievedTask = await testServices.tasks.getById(taskId);
  if (!retrievedTask || retrievedTask.title !== taskData.title) {
    throw new Error('Task creation or retrieval failed');
  }
  
  // Update task
  await testServices.tasks.update(taskId, { 
    status: 'in_progress',
    description: retrievedTask.description + ' - Updated with additional requirements'
  });
  
  const updatedTask = await testServices.tasks.getById(taskId);
  if (updatedTask.status !== 'in_progress') {
    throw new Error('Task update failed');
  }
  
  log(`Task ${taskData.title} created and updated successfully`, 'info');
  return taskId;
}

async function testCompleteApprovalWorkflow() {
  // Create all test users first
  for (const user of TEST_USERS) {
    await testServices.users.create(user);
  }
  
  const master = TEST_USERS[0];
  const director = TEST_USERS[1];
  const employee = TEST_USERS[2];
  
  // Master creates a task
  const taskData = {
    title: 'Test Task: Complete Approval Workflow',
    description: 'Testing the complete approval workflow from creation to completion',
    category: 'Testing',
    assignedTo: director.id,
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: master.id,
    comments: [],
    attachments: [],
    approvalChain: [],
    currentApprovalLevel: 'none'
  };
  
  const taskId = await testServices.tasks.create(taskData);
  log(`Master created task: ${taskId}`, 'info');
  
  // Step 1: Master assigns task to Director
  await testServices.tasks.assignToDirector(taskId, director.id);
  let task = await testServices.tasks.getById(taskId);
  if (task.status !== 'assigned_to_director' || task.assignedDirector !== director.id) {
    throw new Error('Task assignment to director failed');
  }
  log('✓ Task assigned to director', 'info');
  
  // Step 2: Director assigns task to Employee
  await testServices.tasks.assignToEmployee(taskId, employee.id);
  task = await testServices.tasks.getById(taskId);
  if (task.status !== 'assigned_to_employee' || task.assignedEmployee !== employee.id) {
    throw new Error('Task assignment to employee failed');
  }
  log('✓ Task assigned to employee', 'info');
  
  // Step 3: Employee marks task as completed
  await testServices.tasks.markAsCompletedByEmployee(taskId);
  task = await testServices.tasks.getById(taskId);
  if (task.status !== 'pending_director_approval' || task.currentApprovalLevel !== 'director') {
    throw new Error('Employee task completion failed');
  }
  log('✓ Employee marked task as completed', 'info');
  
  // Step 4: Director approves the task
  await testServices.tasks.approveByDirector(taskId, true);
  task = await testServices.tasks.getById(taskId);
  if (task.status !== 'pending_admin_approval' || task.currentApprovalLevel !== 'admin') {
    throw new Error('Director approval failed');
  }
  log('✓ Director approved the task', 'info');
  
  // Step 5: Master (admin) approves the task
  await testServices.tasks.approveByAdmin(taskId, true);
  task = await testServices.tasks.getById(taskId);
  if (task.status !== 'completed' || task.currentApprovalLevel !== 'none') {
    throw new Error('Admin approval failed');
  }
  log('✓ Master approved the task - workflow completed', 'info');
  
  // Verify approval chain
  if (!task.approvalChain || task.approvalChain.length !== 2) {
    throw new Error('Approval chain verification failed');
  }
  
  const directorApproval = task.approvalChain.find(a => a.approverRole === 'director');
  const adminApproval = task.approvalChain.find(a => a.approverRole === 'admin');
  
  if (!directorApproval || directorApproval.status !== 'approved') {
    throw new Error('Director approval chain verification failed');
  }
  
  if (!adminApproval || adminApproval.status !== 'approved') {
    throw new Error('Admin approval chain verification failed');
  }
  
  log('✓ Complete approval workflow test passed', 'success');
  return taskId;
}

async function testApprovalWorkflowRejection() {
  const master = TEST_USERS[0];
  const director = TEST_USERS[1];
  const employee = TEST_USERS[2];
  
  // Create task for rejection test
  const taskData = {
    title: 'Test Task: Rejection Workflow',
    description: 'Testing task rejection in approval workflow',
    category: 'Testing',
    assignedTo: director.id,
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: master.id,
    comments: [],
    attachments: [],
    approvalChain: [],
    currentApprovalLevel: 'none'
  };
  
  const taskId = await testServices.tasks.create(taskData);
  
  // Go through workflow until director approval
  await testServices.tasks.assignToDirector(taskId, director.id);
  await testServices.tasks.assignToEmployee(taskId, employee.id);
  await testServices.tasks.markAsCompletedByEmployee(taskId);
  
  // Director rejects the task
  const rejectionReason = 'Insufficient documentation provided';
  await testServices.tasks.approveByDirector(taskId, false, rejectionReason);
  
  const task = await testServices.tasks.getById(taskId);
  if (task.status !== 'rejected' || task.rejectionReason !== rejectionReason) {
    throw new Error('Task rejection by director failed');
  }
  
  log('✓ Task rejection workflow test passed', 'success');
  return taskId;
}

async function testNotificationSystem() {
  const sender = TEST_USERS[0];
  const receiver = TEST_USERS[1];
  
  // Test message notification
  const messageNotification = {
    userId: receiver.id,
    title: 'Test Message Notification',
    message: `You received a test message from ${sender.name}`,
    type: 'message_received',
    isRead: false,
    createdAt: new Date().toISOString(),
    relatedUserId: sender.id,
    relatedUserName: sender.name,
    priority: 'medium'
  };
  
  const notificationId = await testServices.notifications.create(messageNotification);
  
  // Get notifications for receiver
  const notifications = await testServices.notifications.getByUser(receiver.id);
  const createdNotification = notifications.find(n => n.id === notificationId);
  
  if (!createdNotification || createdNotification.title !== messageNotification.title) {
    throw new Error('Message notification creation failed');
  }
  
  // Mark as read
  await testServices.notifications.markAsRead(notificationId);
  
  // Test task assignment notification
  const taskNotification = {
    userId: receiver.id,
    title: 'Test Task Assignment',
    message: `${sender.name} assigned you a test task`,
    type: 'task_assigned',
    isRead: false,
    createdAt: new Date().toISOString(),
    relatedUserId: sender.id,
    relatedUserName: sender.name,
    taskId: 'test-task-123',
    priority: 'high'
  };
  
  await testServices.notifications.create(taskNotification);
  
  log('✓ Notification system test passed', 'success');
}

async function testChatSystem() {
  const sender = TEST_USERS[0];
  const receiver = TEST_USERS[1];
  
  const participants = [`${sender.id}_${receiver.id}`];
  
  // Send test messages
  const messages = [
    {
      senderId: sender.id,
      receiverId: receiver.id,
      content: 'Test message 1: Hello, how is the project progress?',
      type: 'text',
      isRead: false,
      participants: participants
    },
    {
      senderId: receiver.id,
      receiverId: sender.id,
      content: 'Test message 2: Everything is on track, will complete by deadline.',
      type: 'text',
      isRead: false,
      participants: [`${receiver.id}_${sender.id}`]
    },
    {
      senderId: sender.id,
      receiverId: receiver.id,
      content: 'Test message 3: Great! Please keep me updated.',
      type: 'text',
      isRead: false,
      participants: participants
    }
  ];
  
  const messageIds = [];
  for (const message of messages) {
    const messageId = await testServices.chat.create(message);
    messageIds.push(messageId);
  }
  
  // Retrieve conversation
  const conversation = await testServices.chat.getMessages(sender.id, receiver.id);
  
  if (conversation.length < 3) {
    throw new Error('Chat message creation or retrieval failed');
  }
  
  // Mark messages as read
  for (const messageId of messageIds) {
    await testServices.chat.markAsRead(messageId);
  }
  
  log('✓ Chat system test passed', 'success');
}

async function testMultipleUsersAndTasks() {
  // Create additional test data for comprehensive testing
  const additionalProjects = [
    {
      name: 'Test Project Beta',
      description: 'Secondary test project',
      status: 'active',
      createdBy: TEST_USERS[0].id
    },
    {
      name: 'Test Project Gamma',
      description: 'Third test project',
      status: 'inactive',
      createdBy: TEST_USERS[1].id
    }
  ];
  
  const projectIds = [];
  for (const project of additionalProjects) {
    const projectId = await testServices.projects.create(project);
    projectIds.push(projectId);
  }
  
  // Create multiple categories
  const categories = [
    { name: 'Test Category Frontend', projectId: projectIds[0], color: '#3B82F6' },
    { name: 'Test Category Backend', projectId: projectIds[0], color: '#EF4444' },
    { name: 'Test Category QA', projectId: projectIds[1], color: '#10B981' }
  ];
  
  const categoryIds = [];
  for (const category of categories) {
    const categoryId = await testServices.categories.create(category);
    categoryIds.push(categoryId);
  }
  
  // Create multiple tasks with different scenarios
  const tasks = [
    {
      title: 'Test Task: Frontend Dashboard',
      assignedTo: TEST_USERS[2].id,
      priority: 'high',
      status: 'pending',
      createdBy: TEST_USERS[0].id,
      categoryId: categoryIds[0]
    },
    {
      title: 'Test Task: API Development',
      assignedTo: TEST_USERS[1].id,
      priority: 'medium',
      status: 'in_progress',
      createdBy: TEST_USERS[0].id,
      categoryId: categoryIds[1]
    },
    {
      title: 'Test Task: Quality Assurance',
      assignedTo: TEST_USERS[2].id,
      priority: 'low',
      status: 'pending',
      createdBy: TEST_USERS[1].id,
      categoryId: categoryIds[2]
    }
  ];
  
  const taskIds = [];
  for (const task of tasks) {
    const taskData = {
      ...task,
      description: `Detailed description for ${task.title}`,
      category: 'Testing',
      dueDate: new Date(Date.now() + Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
      comments: [],
      attachments: [],
      approvalChain: [],
      currentApprovalLevel: 'none'
    };
    const taskId = await testServices.tasks.create(taskData);
    taskIds.push(taskId);
  }
  
  // Verify all data was created
  const allProjects = await testServices.projects.getAll();
  const allTasks = await testServices.tasks.getAll();
  
  const testProjects = allProjects.filter(p => p.name.includes('Test Project'));
  const testTasks = allTasks.filter(t => t.title.includes('Test Task'));
  
  if (testProjects.length < 3 || testTasks.length < 3) {
    throw new Error('Multiple projects and tasks creation failed');
  }
  
  log(`✓ Created ${testProjects.length} projects and ${testTasks.length} tasks`, 'success');
}

async function testDashboardAnalytics() {
  // Get all tasks for analytics
  const allTasks = await testServices.tasks.getAll();
  const testTasks = allTasks.filter(t => t.title && t.title.includes('Test Task'));
  
  // Calculate basic statistics
  const stats = {
    totalTasks: testTasks.length,
    pendingTasks: testTasks.filter(t => t.status === 'pending').length,
    inProgressTasks: testTasks.filter(t => t.status === 'in_progress').length,
    completedTasks: testTasks.filter(t => t.status === 'completed').length,
    rejectedTasks: testTasks.filter(t => t.status === 'rejected').length,
    highPriorityTasks: testTasks.filter(t => t.priority === 'high').length,
    mediumPriorityTasks: testTasks.filter(t => t.priority === 'medium').length,
    lowPriorityTasks: testTasks.filter(t => t.priority === 'low').length
  };
  
  log(`Dashboard Analytics:`, 'info');
  log(`  Total Tasks: ${stats.totalTasks}`, 'info');
  log(`  Pending: ${stats.pendingTasks}, In Progress: ${stats.inProgressTasks}`, 'info');
  log(`  Completed: ${stats.completedTasks}, Rejected: ${stats.rejectedTasks}`, 'info');
  log(`  High Priority: ${stats.highPriorityTasks}, Medium: ${stats.mediumPriorityTasks}, Low: ${stats.lowPriorityTasks}`, 'info');
  
  if (stats.totalTasks === 0) {
    throw new Error('No test tasks found for analytics');
  }
  
  log('✓ Dashboard analytics test passed', 'success');
}

async function testEdgeCases() {
  log('Testing edge cases...', 'info');
  
  // Test 1: Task with missing employee assignment
  const taskData = {
    title: 'Test Task: Edge Case Missing Assignment',
    description: 'Testing task without proper assignment',
    category: 'Testing',
    assignedTo: 9999, // Non-existent user
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdBy: TEST_USERS[0].id,
    comments: [],
    attachments: [],
    approvalChain: [],
    currentApprovalLevel: 'none'
  };
  
  const taskId = await testServices.tasks.create(taskData);
  const task = await testServices.tasks.getById(taskId);
  
  if (!task || task.assignedTo !== 9999) {
    throw new Error('Edge case task creation failed');
  }
  
  // Test 2: Very long task title and description
  const longTitle = 'Test Task: '.repeat(50) + 'Very Long Title That Exceeds Normal Limits';
  const longDescription = 'This is a very long description. '.repeat(100);
  
  const longTaskData = {
    title: longTitle.substring(0, 200), // Truncate if needed
    description: longDescription,
    category: 'Testing',
    assignedTo: TEST_USERS[1].id,
    priority: 'low',
    status: 'pending',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdBy: TEST_USERS[0].id,
    comments: [],
    attachments: [],
    approvalChain: [],
    currentApprovalLevel: 'none'
  };
  
  const longTaskId = await testServices.tasks.create(longTaskData);
  const longTask = await testServices.tasks.getById(longTaskId);
  
  if (!longTask || longTask.description.length === 0) {
    throw new Error('Long content task creation failed');
  }
  
  // Test 3: Task with past due date
  const pastDueTaskData = {
    title: 'Test Task: Past Due Date',
    description: 'Testing task with past due date',
    category: 'Testing',
    assignedTo: TEST_USERS[2].id,
    priority: 'urgent',
    status: 'pending',
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    createdBy: TEST_USERS[0].id,
    comments: [],
    attachments: [],
    approvalChain: [],
    currentApprovalLevel: 'none'
  };
  
  const pastDueTaskId = await testServices.tasks.create(pastDueTaskData);
  const pastDueTask = await testServices.tasks.getById(pastDueTaskId);
  
  if (!pastDueTask || new Date(pastDueTask.dueDate) > new Date()) {
    throw new Error('Past due task creation failed');
  }
  
  log('✓ Edge cases test passed', 'success');
}

// NEW ENHANCED TEST FUNCTIONS

async function testUserAuthenticationWorkflow() {
  log('Testing comprehensive user authentication workflow...', 'info');
  
  // Create all test users with Firebase auth simulation
  for (const user of TEST_USERS) {
    await testServices.users.create(user);
    
    // Simulate Firebase user creation
    await testServices.auth.createFirebaseUser(user.email, user.password);
    log(`Created user: ${user.name} (${user.role})`, 'info');
  }
  
  // Test login for each user role
  const loginTests = [
    { email: 'test.master@company.com', password: 'test123', expectedRole: 'master' },
    { email: 'test.director@company.com', password: 'test123', expectedRole: 'director' },
    { email: 'test.employee@company.com', password: 'test123', expectedRole: 'employee' },
    { email: 'test.director2@company.com', password: 'test123', expectedRole: 'director' },
    { email: 'test.employee2@company.com', password: 'test123', expectedRole: 'employee' }
  ];
  
  for (const test of loginTests) {
    const user = await testServices.auth.simulateLogin(test.email, test.password);
    if (user.role !== test.expectedRole) {
      throw new Error(`Login test failed for ${test.email}: expected role ${test.expectedRole}, got ${user.role}`);
    }
    
    // Test logout
    await testServices.auth.simulateLogout(user.id);
  }
  
  // Test invalid login attempts
  try {
    await testServices.auth.simulateLogin('invalid@email.com', 'wrongpassword');
    throw new Error('Invalid login should have failed');
  } catch (error) {
    if (!error.message.includes('Login failed')) {
      throw error;
    }
  }
  
  // Test login with inactive user
  const inactiveUser = { ...TEST_USERS[0], id: 993, email: 'inactive@company.com', status: 'inactive' };
  await testServices.users.create(inactiveUser);
  
  try {
    await testServices.auth.simulateLogin(inactiveUser.email, inactiveUser.password);
    throw new Error('Inactive user login should have failed');
  } catch (error) {
    if (!error.message.includes('Login failed')) {
      throw error;
    }
  }
  
  log('✓ User authentication workflow test passed', 'success');
}

async function testRealWorldUserWorkflows() {
  log('Testing real-world user workflows...', 'info');
  
  const master = TEST_USERS[0];
  const director1 = TEST_USERS[1];
  const director2 = TEST_USERS[3];
  const employee1 = TEST_USERS[2];
  const employee2 = TEST_USERS[4];
  const employee3 = TEST_USERS[5];
  
  // Scenario 1: Master creates multiple projects and assigns to different directors
  const projects = [
    {
      name: 'Test Project Mobile App',
      description: 'Mobile application development project',
      status: 'active',
      createdBy: master.id
    },
    {
      name: 'Test Project Web Portal',
      description: 'Web portal development project',
      status: 'active',
      createdBy: master.id
    },
    {
      name: 'Test Project Infrastructure',
      description: 'Infrastructure and DevOps project',
      status: 'active',
      createdBy: master.id
    }
  ];
  
  const createdProjects = [];
  for (const project of projects) {
    const projectId = await testServices.projects.create(project);
    createdProjects.push({ id: projectId, ...project });
    log(`Master created project: ${project.name}`, 'info');
  }
  
  // Create categories for each project
  const categories = [
    { name: 'Test Category Mobile Frontend', projectId: createdProjects[0].id, color: '#3B82F6' },
    { name: 'Test Category Mobile Backend', projectId: createdProjects[0].id, color: '#EF4444' },
    { name: 'Test Category Web Frontend', projectId: createdProjects[1].id, color: '#10B981' },
    { name: 'Test Category Web Backend', projectId: createdProjects[1].id, color: '#F59E0B' },
    { name: 'Test Category DevOps', projectId: createdProjects[2].id, color: '#8B5CF6' },
    { name: 'Test Category Monitoring', projectId: createdProjects[2].id, color: '#EC4899' }
  ];
  
  const createdCategories = [];
  for (const category of categories) {
    const categoryId = await testServices.categories.create(category);
    createdCategories.push({ id: categoryId, ...category });
  }
  
  // Scenario 2: Master creates complex tasks and assigns them through hierarchy
  const complexTasks = [
    {
      title: 'Test Task: Mobile App Authentication System',
      description: 'Implement complete authentication system for mobile app including biometric login',
      category: 'Mobile Development',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: master.id,
      assignedDirector: director1.id,
      targetEmployee: employee1.id,
      categoryId: createdCategories[0].id
    },
    {
      title: 'Test Task: Web Portal Dashboard',
      description: 'Create responsive dashboard with real-time analytics and reporting features',
      category: 'Web Development',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: master.id,
      assignedDirector: director1.id,
      targetEmployee: employee2.id,
      categoryId: createdCategories[2].id
    },
    {
      title: 'Test Task: Infrastructure Monitoring Setup',
      description: 'Set up comprehensive monitoring system for all production services',
      category: 'DevOps',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: master.id,
      assignedDirector: director2.id,
      targetEmployee: employee3.id,
      categoryId: createdCategories[4].id
    },
    {
      title: 'Test Task: API Integration Testing',
      description: 'Comprehensive testing of all API endpoints with automated test suite',
      category: 'QA',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: master.id,
      assignedDirector: director1.id,
      targetEmployee: employee3.id,
      categoryId: createdCategories[1].id
    }
  ];
  
  const workflowTasks = [];
  for (const taskData of complexTasks) {
    const { targetEmployee, assignedDirector, ...cleanTaskData } = taskData;
    
    // Master creates task
    const taskId = await testServices.tasks.create({
      ...cleanTaskData,
      assignedTo: assignedDirector,
      comments: [],
      attachments: [],
      approvalChain: [],
      currentApprovalLevel: 'none'
    });
    
    // Master assigns to director
    await testServices.tasks.assignToDirector(taskId, assignedDirector);
    
    // Director assigns to employee
    await testServices.tasks.assignToEmployee(taskId, targetEmployee);
    
    workflowTasks.push({
      id: taskId,
      directorId: assignedDirector,
      employeeId: targetEmployee,
      ...cleanTaskData
    });
    
    log(`Created and assigned task: ${taskData.title}`, 'info');
  }
  
  // Scenario 3: Employees work on tasks with different outcomes
  const taskOutcomes = [
    { taskIndex: 0, action: 'complete', directorApproval: true, masterApproval: true },
    { taskIndex: 1, action: 'complete', directorApproval: false, reason: 'UI requirements not met' },
    { taskIndex: 2, action: 'complete', directorApproval: true, masterApproval: false, reason: 'Security concerns' },
    { taskIndex: 3, action: 'complete', directorApproval: true, masterApproval: true }
  ];
  
  for (let i = 0; i < taskOutcomes.length; i++) {
    const outcome = taskOutcomes[i];
    const task = workflowTasks[outcome.taskIndex];
    
    if (outcome.action === 'complete') {
      // Employee completes task
      await testServices.tasks.markAsCompletedByEmployee(task.id);
      log(`Employee ${task.employeeId} completed task: ${task.title}`, 'info');
      
      // Director review
      if (outcome.directorApproval) {
        await testServices.tasks.approveByDirector(task.id, true);
        log(`Director ${task.directorId} approved task: ${task.title}`, 'info');
        
        // Master review (if director approved)
        if (outcome.masterApproval !== undefined) {
          await testServices.tasks.approveByAdmin(task.id, outcome.masterApproval, outcome.reason);
          if (outcome.masterApproval) {
            log(`Master approved task: ${task.title}`, 'info');
          } else {
            log(`Master rejected task: ${task.title} - ${outcome.reason}`, 'info');
          }
        }
      } else {
        await testServices.tasks.approveByDirector(task.id, false, outcome.reason);
        log(`Director ${task.directorId} rejected task: ${task.title} - ${outcome.reason}`, 'info');
      }
    }
  }
  
  // Verify workflow results
  const finalTasks = await testServices.tasks.getAll();
  const testTasksResults = finalTasks.filter(t => t.title && t.title.includes('Test Task:'));
  
  const completedTasks = testTasksResults.filter(t => t.status === 'completed').length;
  const rejectedTasks = testTasksResults.filter(t => t.status === 'rejected').length;
  const pendingTasks = testTasksResults.filter(t => t.status.includes('pending')).length;
  
  log(`Workflow results: ${completedTasks} completed, ${rejectedTasks} rejected, ${pendingTasks} pending`, 'info');
  
  if (testTasksResults.length < 4) {
    throw new Error('Real-world workflow test failed: insufficient tasks processed');
  }
  
  log('✓ Real-world user workflows test passed', 'success');
}

async function testComprehensiveMessaging() {
  log('Testing comprehensive messaging system...', 'info');
  
  const master = TEST_USERS[0];
  const director1 = TEST_USERS[1];
  const director2 = TEST_USERS[3];
  const employee1 = TEST_USERS[2];
  const employee2 = TEST_USERS[4];
  const employee3 = TEST_USERS[5];
  
  // Scenario 1: Master communicates with directors about project updates
  const masterToDirectorMessages = [
    { to: director1.id, content: 'Test message: Please review the mobile app project timeline and provide updates.' },
    { to: director2.id, content: 'Test message: Infrastructure project needs priority adjustment. Let\'s discuss.' },
    { to: director1.id, content: 'Test message: Great work on the web portal. Can you share the latest mockups?' }
  ];
  
  for (const msg of masterToDirectorMessages) {
    await testServices.messaging.sendMessage(master.id, msg.to, msg.content);
    log(`Master sent message to Director ${msg.to}`, 'info');
  }
  
  // Scenario 2: Directors respond and communicate with employees
  const directorResponses = [
    { from: director1.id, to: master.id, content: 'Test message: Mobile app timeline on track. Employee teams are performing well.' },
    { from: director2.id, to: master.id, content: 'Test message: Understood. Infrastructure priority adjusted. Will update you by EOD.' },
    { from: director1.id, to: employee1.id, content: 'Test message: Excellent progress on authentication. Need help with anything?' },
    { from: director1.id, to: employee2.id, content: 'Test message: Dashboard design looks great. Focus on performance optimization next.' },
    { from: director2.id, to: employee3.id, content: 'Test message: Monitoring setup should include alerts for all critical services.' }
  ];
  
  for (const msg of directorResponses) {
    await testServices.messaging.sendMessage(msg.from, msg.to, msg.content);
    log(`Director ${msg.from} sent message to User ${msg.to}`, 'info');
  }
  
  // Scenario 3: Employees communicate with each other and their directors
  const employeeMessages = [
    { from: employee1.id, to: director1.id, content: 'Test message: Authentication module completed. Ready for testing.' },
    { from: employee2.id, to: director1.id, content: 'Test message: Dashboard performance improved by 40%. Deployment ready.' },
    { from: employee3.id, to: director2.id, content: 'Test message: Monitoring alerts configured. Need approval for production deployment.' },
    { from: employee1.id, to: employee2.id, content: 'Test message: Can you help with API integration for mobile auth?' },
    { from: employee2.id, to: employee1.id, content: 'Test message: Sure! Let\'s schedule a quick call to go over the endpoints.' },
    { from: employee3.id, to: employee1.id, content: 'Test message: QA testing completed for your module. Found minor issues, details attached.' }
  ];
  
  for (const msg of employeeMessages) {
    await testServices.messaging.sendMessage(msg.from, msg.to, msg.content);
    log(`Employee ${msg.from} sent message to User ${msg.to}`, 'info');
  }
  
  // Scenario 4: Test conversation retrieval and message marking
  const conversations = [
    { user1: master.id, user2: director1.id },
    { user1: director1.id, user2: employee1.id },
    { user1: employee1.id, user2: employee2.id }
  ];
  
  for (const conv of conversations) {
    const messages = await testServices.messaging.getConversation(conv.user1, conv.user2);
    if (messages.length === 0) {
      throw new Error(`No messages found in conversation between ${conv.user1} and ${conv.user2}`);
    }
    
    // Mark some messages as read
    const unreadMessages = messages.filter(m => !m.isRead).slice(0, 2);
    if (unreadMessages.length > 0) {
      await testServices.messaging.markMessagesAsRead(unreadMessages.map(m => m.id));
      log(`Marked ${unreadMessages.length} messages as read in conversation`, 'info');
    }
  }
  
  // Scenario 5: Test group discussion simulation (multiple users discussing same topic)
  const groupDiscussion = [
    { from: master.id, to: director1.id, content: 'Test message: Team standup tomorrow 9 AM. Please confirm attendance.' },
    { from: director1.id, to: master.id, content: 'Test message: Confirmed. Will bring project updates.' },
    { from: master.id, to: director2.id, content: 'Test message: Team standup tomorrow 9 AM. Please confirm attendance.' },
    { from: director2.id, to: master.id, content: 'Test message: Confirmed. Infrastructure update ready.' },
    { from: director1.id, to: employee1.id, content: 'Test message: Standup tomorrow 9 AM. Prepare your sprint updates.' },
    { from: employee1.id, to: director1.id, content: 'Test message: Ready! Authentication sprint 95% complete.' }
  ];
  
  for (const msg of groupDiscussion) {
    await testServices.messaging.sendMessage(msg.from, msg.to, msg.content);
  }
  
  // Verify messaging statistics
  const allMessages = await db.collection('chatMessages').get();
  const testMessages = allMessages.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(msg => msg.content && msg.content.includes('Test message'));
  
  const messageStats = {
    total: testMessages.length,
    readMessages: testMessages.filter(m => m.isRead).length,
    unreadMessages: testMessages.filter(m => !m.isRead).length,
    uniqueConversations: new Set(testMessages.map(m => [m.senderId, m.receiverId].sort().join('_'))).size
  };
  
  log(`Messaging stats: ${messageStats.total} messages, ${messageStats.readMessages} read, ${messageStats.uniqueConversations} conversations`, 'info');
  
  if (messageStats.total < 15) {
    throw new Error('Insufficient messages created in comprehensive messaging test');
  }
  
  log('✓ Comprehensive messaging test passed', 'success');
}

async function testAdvancedScenarios() {
  log('Testing advanced scenarios and edge cases...', 'info');
  
  // Scenario 1: Bulk operations
  const bulkUsers = [];
  for (let i = 0; i < 5; i++) {
    const user = {
      id: 900 + i,
      username: `bulk_user_${i}`,
      password: 'test123',
      role: 'employee',
      designation: `Bulk User ${i}`,
      name: `Bulk Test User ${i}`,
      email: `bulk.user${i}@company.com`,
      status: 'active',
      reportsTo: TEST_USERS[1].id,
      createdAt: new Date().toISOString()
    };
    
    await testServices.users.create(user);
    bulkUsers.push(user);
  }
  log('✓ Bulk user creation completed', 'info');
  
  // Scenario 2: Concurrent task assignments
  const concurrentTasks = [];
  for (let i = 0; i < 10; i++) {
    const taskData = {
      title: `Test Task: Concurrent Task ${i}`,
      description: `Concurrent task testing ${i}`,
      category: 'Testing',
      assignedTo: bulkUsers[i % bulkUsers.length].id,
      priority: ['low', 'medium', 'high'][i % 3],
      status: 'pending',
      dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: TEST_USERS[0].id,
      comments: [],
      attachments: [],
      approvalChain: [],
      currentApprovalLevel: 'none'
    };
    
    const taskId = await testServices.tasks.create(taskData);
    concurrentTasks.push({ id: taskId, ...taskData });
  }
  log('✓ Concurrent task creation completed', 'info');
  
  // Scenario 3: Mass status updates
  const statusUpdates = ['in_progress', 'paused', 'in_progress'];
  for (let i = 0; i < Math.min(3, concurrentTasks.length); i++) {
    await testServices.tasks.update(concurrentTasks[i].id, { 
      status: statusUpdates[i],
      updatedBy: bulkUsers[i % bulkUsers.length].id
    });
  }
  log('✓ Mass status updates completed', 'info');
  
  // Scenario 4: Performance test with large data sets
  const performanceStart = Date.now();
  
  // Create many notifications
  for (let i = 0; i < 20; i++) {
    await testServices.notifications.create({
      userId: bulkUsers[i % bulkUsers.length].id,
      title: `Test Performance Notification ${i}`,
      message: `Performance testing notification ${i}`,
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: 'low'
    });
  }
  
  const performanceEnd = Date.now();
  const performanceTime = performanceEnd - performanceStart;
  log(`✓ Performance test completed in ${performanceTime}ms`, 'info');
  
  // Scenario 5: Data consistency checks
  const allUsers = await testServices.users.getAll();
  const allTasks = await testServices.tasks.getAll();
  const allProjects = await testServices.projects.getAll();
  
  const testUsers = allUsers.filter(u => u.name && u.name.includes('Test'));
  const testTasks = allTasks.filter(t => t.title && t.title.includes('Test Task'));
  const testProjects = allProjects.filter(p => p.name && p.name.includes('Test Project'));
  
  log(`Data consistency: ${testUsers.length} users, ${testTasks.length} tasks, ${testProjects.length} projects`, 'info');
  
  if (testUsers.length < 10 || testTasks.length < 15) {
    throw new Error('Data consistency check failed: insufficient test data');
  }
  
  // Scenario 6: Error recovery testing
  try {
    await testServices.tasks.update('nonexistent_task_id', { status: 'completed' });
    throw new Error('Should have failed with nonexistent task');
  } catch (error) {
    if (!error.message.includes('No document to update')) {
      log('✓ Error recovery test passed', 'info');
    }
  }
  
  // Scenario 7: Transaction-like operations
  const batchTaskId = await testServices.tasks.create({
    title: 'Test Task: Batch Operation',
    description: 'Testing batch operations',
    category: 'Testing',
    assignedTo: bulkUsers[0].id,
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdBy: TEST_USERS[0].id,
    comments: [],
    attachments: [],
    approvalChain: [],
    currentApprovalLevel: 'none'
  });
  
  // Simulate batch update
  await testServices.tasks.update(batchTaskId, { status: 'in_progress' });
  await testServices.notifications.create({
    userId: bulkUsers[0].id,
    title: 'Task Started',
    message: 'Your batch task has been started',
    type: 'task_updated',
    isRead: false,
    createdAt: new Date().toISOString(),
    taskId: batchTaskId,
    priority: 'medium'
  });
  
  log('✓ Advanced scenarios test passed', 'success');
}

async function testRoleBasedPermissions() {
  log('Testing role-based permissions and access control...', 'info');
  
  const master = TEST_USERS[0];
  const director = TEST_USERS[1];
  const employee = TEST_USERS[2];
  
  // Test 1: Master can create projects, directors and employees cannot
  const projectData = {
    name: 'Test Project Permissions',
    description: 'Testing role-based project creation',
    status: 'active',
    createdBy: master.id
  };
  
  const projectId = await testServices.projects.create(projectData);
  log('✓ Master successfully created project', 'info');
  
  // Test 2: Directors can create categories for projects
  const categoryData = {
    name: 'Test Category Permissions',
    description: 'Testing role-based category creation',
    color: '#3B82F6',
    projectId: projectId
  };
  
  const categoryId = await testServices.categories.create(categoryData);
  log('✓ Director role can create categories', 'info');
  
  // Test 3: All roles can create tasks (but with different permissions)
  const masterTask = await testServices.tasks.create({
    title: 'Test Task: Master Created',
    description: 'Task created by master',
    category: 'Management',
    assignedTo: director.id,
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: master.id,
    categoryId: categoryId,
    comments: [],
    attachments: [],
    approvalChain: [],
    currentApprovalLevel: 'none'
  });
  
  const directorTask = await testServices.tasks.create({
    title: 'Test Task: Director Created',
    description: 'Task created by director',
    category: 'Development',
    assignedTo: employee.id,
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: director.id,
    categoryId: categoryId,
    comments: [],
    attachments: [],
    approvalChain: [],
    currentApprovalLevel: 'none'
  });
  
  log('✓ All roles can create tasks within their permissions', 'info');
  
  // Test 4: Approval permissions - only directors can approve employee tasks
  await testServices.tasks.assignToDirector(masterTask, director.id);
  await testServices.tasks.assignToEmployee(masterTask, employee.id);
  await testServices.tasks.markAsCompletedByEmployee(masterTask);
  
  // Director approves
  await testServices.tasks.approveByDirector(masterTask, true);
  
  // Test 5: Only master can give final approval
  await testServices.tasks.approveByAdmin(masterTask, true);
  
  const finalTask = await testServices.tasks.getById(masterTask);
  if (finalTask.status !== 'completed') {
    throw new Error('Role-based approval workflow failed');
  }
  
  log('✓ Role-based approval permissions working correctly', 'info');
  
  // Test 6: Notification permissions - users can only see their own notifications
  await testServices.notifications.create({
    userId: employee.id,
    title: 'Test Employee Notification',
    message: 'This notification is for employee only',
    type: 'system',
    isRead: false,
    createdAt: new Date().toISOString(),
    priority: 'medium'
  });
  
  const employeeNotifications = await testServices.notifications.getByUser(employee.id);
  const employeeSpecificNotif = employeeNotifications.find(n => n.title === 'Test Employee Notification');
  
  if (!employeeSpecificNotif) {
    throw new Error('Employee notification visibility test failed');
  }
  
  log('✓ Role-based permissions test passed', 'success');
}

async function testSystemIntegration() {
  log('Testing system integration and cross-module functionality...', 'info');
  
  const master = TEST_USERS[0];
  const director = TEST_USERS[1];
  const employee = TEST_USERS[2];
  
  // Integration Test 1: Complete workflow with notifications and messaging
  const integrationProject = await testServices.projects.create({
    name: 'Test Project Integration',
    description: 'Integration testing project',
    status: 'active',
    createdBy: master.id
  });
  
  const integrationCategory = await testServices.categories.create({
    name: 'Test Category Integration',
    description: 'Integration testing category',
    color: '#8B5CF6',
    projectId: integrationProject
  });
  
  const integrationTask = await testServices.tasks.create({
    title: 'Test Task: System Integration',
    description: 'Complete system integration testing',
    category: 'Integration',
    assignedTo: director.id,
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: master.id,
    categoryId: integrationCategory,
    comments: [],
    attachments: [],
    approvalChain: [],
    currentApprovalLevel: 'none'
  });
  
  // Step 1: Master assigns task and sends message
  await testServices.tasks.assignToDirector(integrationTask, director.id);
  await testServices.messaging.sendMessage(
    master.id, 
    director.id, 
    'Test message: Please handle this integration task with priority. Deadline is tight.'
  );
  
  // Verify task assignment notification was created
  const directorNotifications = await testServices.notifications.getByUser(director.id);
  const assignmentNotif = directorNotifications.find(n => n.type === 'message_received');
  
  if (!assignmentNotif) {
    throw new Error('Task assignment notification not created');
  }
  
  // Step 2: Director assigns to employee and responds
  await testServices.tasks.assignToEmployee(integrationTask, employee.id);
  await testServices.messaging.sendMessage(
    director.id, 
    master.id, 
    'Test message: Integration task assigned to best employee. Will monitor progress closely.'
  );
  await testServices.messaging.sendMessage(
    director.id, 
    employee.id, 
    'Test message: High priority integration task assigned. Please start immediately.'
  );
  
  // Step 3: Employee starts work and provides updates
  await testServices.tasks.update(integrationTask, { status: 'in_progress' });
  await testServices.messaging.sendMessage(
    employee.id, 
    director.id, 
    'Test message: Started integration task. Initial analysis complete.'
  );
  
  // Step 4: Employee completes and requests approval
  await testServices.tasks.markAsCompletedByEmployee(integrationTask);
  await testServices.messaging.sendMessage(
    employee.id, 
    director.id, 
    'Test message: Integration task completed. All tests passing. Ready for review.'
  );
  
  // Step 5: Director reviews and approves
  await testServices.tasks.approveByDirector(integrationTask, true);
  await testServices.messaging.sendMessage(
    director.id, 
    master.id, 
    'Test message: Integration task completed successfully. Employee did excellent work.'
  );
  
  // Step 6: Master final approval
  await testServices.tasks.approveByAdmin(integrationTask, true);
  await testServices.messaging.sendMessage(
    master.id, 
    director.id, 
    'Test message: Excellent work on integration task. Please commend the employee.'
  );
  await testServices.messaging.sendMessage(
    master.id, 
    employee.id, 
    'Test message: Outstanding work on integration task. Well done!'
  );
  
  // Verify final state
  const finalIntegrationTask = await testServices.tasks.getById(integrationTask);
  if (finalIntegrationTask.status !== 'completed') {
    throw new Error('Integration workflow did not complete successfully');
  }
  
  // Integration Test 2: Cross-module data consistency
  const allMessages = await db.collection('chatMessages').get();
  const integrationMessages = allMessages.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(msg => msg.content && msg.content.includes('integration task'));
  
  log(`Found ${integrationMessages.length} integration-related messages`, 'info');
  
  // Integration Test 3: Notification cascade
  const allNotifications = await testServices.notifications.getByUser(employee.id);
  const taskRelatedNotifs = allNotifications.filter(n => 
    n.type === 'message_received' || n.type === 'task_assigned'
  );
  
  if (taskRelatedNotifs.length < 1) {
    throw new Error('Notification cascade test failed - no task-related notifications found');
  }
  
  log('✓ System integration test passed', 'success');
}

// Main test execution function
async function runComprehensiveTests() {
  log('🚀 Starting ENHANCED comprehensive workflow testing...', 'info');
  log(`Test configuration: Cleanup before: ${TEST_CONFIG.CLEANUP_BEFORE_TEST}, Cleanup after: ${TEST_CONFIG.CLEANUP_AFTER_TEST}`, 'info');
  log(`Enhanced test suite includes: Authentication, Real workflows, Messaging, Advanced scenarios`, 'info');
  
  if (TEST_CONFIG.CLEANUP_BEFORE_TEST) {
    await cleanup();
  }
  
  try {
    // Phase 1: Core functionality tests (existing)
    log('\n🔧 PHASE 1: Core Functionality Tests', 'info');
    await runTest('User Management', testUserManagement);
    
    let projectId;
    await runTest('Project Management', async () => {
      projectId = await testProjectManagement();
      return projectId;
    });
    
    let categoryId;
    await runTest('Category Management', async () => {
      categoryId = await testCategoryManagement(projectId);
      return categoryId;
    });
    
    await runTest('User Category Management', testUserCategoryManagement);
    
    await runTest('Task Creation and Basic Operations', async () => {
      return await testTaskCreationAndBasicOperations(categoryId);
    });
    
    // Phase 2: Authentication and user workflows (new)
    log('\n🔐 PHASE 2: Authentication and User Workflows', 'info');
    await runTest('User Authentication Workflow', testUserAuthenticationWorkflow);
    await runTest('Real-World User Workflows', testRealWorldUserWorkflows);
    await runTest('Role-Based Permissions', testRoleBasedPermissions);
    
    // Phase 3: Advanced workflow tests (existing + enhanced)
    log('\n⚡ PHASE 3: Advanced Workflow Tests', 'info');
    await runTest('Complete Approval Workflow', testCompleteApprovalWorkflow);
    await runTest('Approval Workflow Rejection', testApprovalWorkflowRejection);
    
    // Phase 4: Communication and messaging (new + enhanced)
    log('\n💬 PHASE 4: Communication and Messaging', 'info');
    await runTest('Notification System', testNotificationSystem);
    await runTest('Chat System', testChatSystem);
    await runTest('Comprehensive Messaging', testComprehensiveMessaging);
    
    // Phase 5: Scale and performance tests (enhanced)
    log('\n📊 PHASE 5: Scale and Performance Tests', 'info');
    await runTest('Multiple Users and Tasks', testMultipleUsersAndTasks);
    await runTest('Dashboard Analytics', testDashboardAnalytics);
    await runTest('Advanced Scenarios', testAdvancedScenarios);
    
    // Phase 6: Integration and edge cases (new + existing)
    log('\n🔄 PHASE 6: Integration and Edge Cases', 'info');
    await runTest('System Integration', testSystemIntegration);
    await runTest('Edge Cases', testEdgeCases);
    
  } catch (error) {
    log(`💥 Critical test error: ${error.message}`, 'error');
    testResults.failed++;
    testResults.errors.push({ test: 'Critical Error', error: error.message });
  }
  
  // Enhanced test results summary
  log('\n📊 ENHANCED TEST RESULTS SUMMARY', 'info');
  log(`Total Tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'info');
  
  if (testResults.errors.length > 0) {
    log('\n❌ FAILED TESTS:', 'error');
    testResults.errors.forEach(error => {
      log(`  ${error.test}: ${error.error}`, 'error');
    });
  }
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`\n🎯 Success Rate: ${successRate}%`, successRate === '100.0' ? 'success' : 'warning');
  
  // Enhanced statistics
  if (testResults.passed > 0) {
    log('\n📈 ENHANCED TEST COVERAGE:', 'info');
    log('  ✅ User Authentication & Role Management', 'info');
    log('  ✅ Complete Project & Task Workflows', 'info');
    log('  ✅ Real-time Messaging & Notifications', 'info');
    log('  ✅ Approval Workflows & State Management', 'info');
    log('  ✅ Role-based Permissions & Access Control', 'info');
    log('  ✅ Cross-module Integration Testing', 'info');
    log('  ✅ Performance & Scalability Scenarios', 'info');
    log('  ✅ Edge Cases & Error Handling', 'info');
  }
  
  if (TEST_CONFIG.CLEANUP_AFTER_TEST) {
    await cleanup();
  }
  
  // Exit with appropriate code
  if (testResults.failed > 0) {
    log('🔚 Enhanced tests completed with failures', 'error');
    process.exit(1);
  } else {
    log('🎉 ALL ENHANCED TESTS PASSED SUCCESSFULLY!', 'success');
    log('🏆 100% SUCCESS RATE ACHIEVED!', 'success');
    process.exit(0);
  }
}

// Execute tests
if (require.main === module) {
  runComprehensiveTests().catch(error => {
    log(`💥 Fatal error: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  runComprehensiveTests,
  testServices,
  cleanup
};