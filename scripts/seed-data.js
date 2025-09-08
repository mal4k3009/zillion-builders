import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccountkey.json'), 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'zillion-builders-group'
});

const db = admin.firestore();

// Mock data to seed
const mockUsers = [
  {
    id: '1',
    username: 'masteradmin',
    password: 'admin123',
    role: 'master',
    department: 'admin',
    name: 'Master Administrator',
    email: 'admin@company.com',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'sales_admin',
    password: 'sales123',
    role: 'sub',
    department: 'sales',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    status: 'active',
    lastLogin: '2024-12-15T10:30:00Z',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    username: 'pr_admin',
    password: 'pr123',
    role: 'sub',
    department: 'pr',
    name: 'Michael Chen',
    email: 'michael@company.com',
    status: 'active',
    lastLogin: '2024-12-15T09:45:00Z',
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '4',
    username: 'marketing_admin',
    password: 'marketing123',
    role: 'sub',
    department: 'marketing',
    name: 'Emily Rodriguez',
    email: 'emily@company.com',
    status: 'active',
    lastLogin: '2024-12-15T11:15:00Z',
    createdAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '5',
    username: 'ops_admin',
    password: 'ops123',
    role: 'sub',
    department: 'operations',
    name: 'David Kumar',
    email: 'david@company.com',
    status: 'active',
    lastLogin: '2024-12-15T08:20:00Z',
    createdAt: '2024-02-10T00:00:00Z'
  }
];

const mockTasks = [
  {
    id: '1',
    title: 'Prepare Q4 Sales Presentation',
    description: 'Create comprehensive presentation covering Q4 performance, targets, and strategic initiatives for the upcoming board meeting.',
    department: 'sales',
    assignedTo: 2,
    priority: 'high',
    status: 'in-progress',
    dueDate: '2024-12-20T17:00:00Z',
    createdAt: '2024-12-10T09:00:00Z',
    updatedAt: '2024-12-14T15:30:00Z',
    createdBy: 1,
    comments: [
      {
        id: 1,
        taskId: 1,
        userId: 2,
        content: 'Working on the financial analysis section. Will have the first draft ready by tomorrow.',
        createdAt: '2024-12-14T15:30:00Z'
      }
    ],
    attachments: []
  },
  {
    id: '2',
    title: 'Social Media Campaign Launch',
    description: 'Execute the holiday season social media campaign across all platforms with coordinated content and engagement strategies.',
    department: 'marketing',
    assignedTo: 4,
    priority: 'urgent',
    status: 'pending',
    dueDate: '2024-12-18T12:00:00Z',
    createdAt: '2024-12-12T10:30:00Z',
    updatedAt: '2024-12-12T10:30:00Z',
    createdBy: 1,
    comments: [],
    attachments: []
  },
  {
    id: '3',
    title: 'Press Release Draft',
    description: 'Draft press release for the new product launch announcement. Include key features, market positioning, and executive quotes.',
    department: 'pr',
    assignedTo: 3,
    priority: 'medium',
    status: 'completed',
    dueDate: '2024-12-16T17:00:00Z',
    createdAt: '2024-12-08T14:00:00Z',
    updatedAt: '2024-12-15T16:45:00Z',
    createdBy: 1,
    comments: [
      {
        id: 2,
        taskId: 3,
        userId: 3,
        content: 'First draft completed and sent for review. Incorporated feedback from product team.',
        createdAt: '2024-12-15T16:45:00Z'
      }
    ],
    attachments: []
  },
  {
    id: '4',
    title: 'Vendor Contract Review',
    description: 'Review and analyze vendor contracts for cost optimization opportunities. Prepare recommendations for contract renewals.',
    department: 'operations',
    assignedTo: 5,
    priority: 'medium',
    status: 'in-progress',
    dueDate: '2024-12-22T17:00:00Z',
    createdAt: '2024-12-11T11:00:00Z',
    updatedAt: '2024-12-13T14:20:00Z',
    createdBy: 1,
    comments: [],
    attachments: []
  },
  {
    id: '5',
    title: 'Customer Follow-up Campaign',
    description: 'Reach out to key customers for feedback and potential upselling opportunities. Focus on accounts with high engagement.',
    department: 'sales',
    assignedTo: 2,
    priority: 'low',
    status: 'pending',
    dueDate: '2024-12-25T17:00:00Z',
    createdAt: '2024-12-13T09:15:00Z',
    updatedAt: '2024-12-13T09:15:00Z',
    createdBy: 1,
    comments: [],
    attachments: []
  },
  {
    id: '6',
    title: 'Market Research Analysis',
    description: 'Conduct comprehensive market research for the new product vertical. Analyze competitor strategies and market opportunities.',
    department: 'marketing',
    assignedTo: 4,
    priority: 'high',
    status: 'pending',
    dueDate: '2024-12-19T17:00:00Z',
    createdAt: '2024-12-14T08:45:00Z',
    updatedAt: '2024-12-14T08:45:00Z',
    createdBy: 1,
    comments: [],
    attachments: []
  }
];

const mockChatMessages = [
  {
    id: '1',
    senderId: 1,
    receiverId: 2,
    content: 'Hi Sarah, how is the Q4 presentation coming along?',
    timestamp: '2024-12-14T10:00:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: '2',
    senderId: 2,
    receiverId: 1,
    content: 'Good morning! I\'m about 70% done. Working on the financial analysis section now.',
    timestamp: '2024-12-14T10:05:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: '3',
    senderId: 1,
    receiverId: 2,
    content: 'Great! Let me know if you need any additional data from finance.',
    timestamp: '2024-12-14T10:07:00Z',
    type: 'text',
    isRead: false
  },
  {
    id: '4',
    senderId: 1,
    receiverId: 4,
    content: 'Emily, please prioritize the social media campaign. It\'s urgent for the holiday season.',
    timestamp: '2024-12-14T11:30:00Z',
    type: 'text',
    isRead: false
  },
  {
    id: '5',
    senderId: 3,
    receiverId: 1,
    content: 'Press release is completed and ready for final review!',
    timestamp: '2024-12-15T16:45:00Z',
    type: 'text',
    isRead: false
  }
];

const mockNotifications = [
  {
    id: '1',
    userId: 2,
    title: 'New Task Assigned',
    message: 'You have been assigned: Prepare Q4 Sales Presentation',
    type: 'task',
    isRead: false,
    createdAt: '2024-12-14T09:00:00Z',
    actionUrl: '/tasks/1'
  },
  {
    id: '2',
    userId: 4,
    title: 'Urgent Task',
    message: 'High priority task assigned: Social Media Campaign Launch',
    type: 'task',
    isRead: false,
    createdAt: '2024-12-14T11:30:00Z',
    actionUrl: '/tasks/2'
  },
  {
    id: '3',
    userId: 1,
    title: 'Task Completed',
    message: 'Michael Chen completed: Press Release Draft',
    type: 'task',
    isRead: true,
    createdAt: '2024-12-15T16:45:00Z',
    actionUrl: '/tasks/3'
  }
];

const mockWhatsAppMessages = [
  {
    id: '1',
    to: '+1234567890',
    message: '📋 New Task Assigned\n\nHi Sarah,\n\nYou have been assigned a new HIGH priority task:\n\n"Prepare Q4 Sales Presentation"\n\nDue: Dec 20, 2024\n\nPlease check your dashboard for details.',
    type: 'task_assigned',
    sentAt: '2024-12-14T09:01:00Z',
    status: 'delivered'
  },
  {
    id: '2',
    to: '+1234567891',
    message: '✅ Task Update\n\nHi Admin,\n\nMichael Chen has completed the task:\n\n"Press Release Draft"\n\nCompleted on: Dec 15, 2024\n\nCheck the dashboard for details.',
    type: 'task_completed',
    sentAt: '2024-12-15T16:46:00Z',
    status: 'read'
  },
  {
    id: '3',
    to: '+1234567892',
    message: '⏰ Daily Summary\n\nGood morning Emily!\n\nYour pending tasks for today:\n\n1. Social Media Campaign Launch (URGENT)\n2. Market Research Analysis (HIGH)\n\nTotal: 2 pending tasks\n\nHave a productive day!',
    type: 'daily_summary',
    sentAt: '2024-12-15T08:00:00Z',
    status: 'delivered'
  }
];

const mockActivities = [
  {
    id: '1',
    type: 'task_created',
    description: 'Created new task "Prepare Q4 Sales Presentation" for Sales department',
    userId: 1,
    timestamp: '2024-12-14T09:00:00Z'
  },
  {
    id: '2',
    type: 'task_updated',
    description: 'Updated task "Press Release Draft" status to completed',
    userId: 3,
    timestamp: '2024-12-15T16:45:00Z'
  },
  {
    id: '3',
    type: 'message_sent',
    description: 'Sent message to Sarah Johnson',
    userId: 1,
    timestamp: '2024-12-14T10:00:00Z'
  },
  {
    id: '4',
    type: 'user_created',
    description: 'Created new sub admin account for Marketing department',
    userId: 1,
    timestamp: '2024-12-13T15:30:00Z'
  }
];

async function seedData() {
  console.log('🌱 Starting data seeding...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    
    const collections = ['users', 'tasks', 'chatMessages', 'notifications', 'whatsappMessages', 'activities'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Cleared ${collectionName} collection`);
    }

    // Seed users
    console.log('👥 Seeding users...');
    for (const user of mockUsers) {
      await db.collection('users').doc(user.id).set(user);
    }
    console.log(`✅ Seeded ${mockUsers.length} users`);

    // Seed tasks
    console.log('📝 Seeding tasks...');
    for (const task of mockTasks) {
      await db.collection('tasks').doc(task.id).set(task);
    }
    console.log(`✅ Seeded ${mockTasks.length} tasks`);

    // Seed chat messages
    console.log('💬 Seeding chat messages...');
    for (const message of mockChatMessages) {
      await db.collection('chatMessages').doc(message.id).set(message);
    }
    console.log(`✅ Seeded ${mockChatMessages.length} chat messages`);

    // Seed notifications
    console.log('🔔 Seeding notifications...');
    for (const notification of mockNotifications) {
      await db.collection('notifications').doc(notification.id).set(notification);
    }
    console.log(`✅ Seeded ${mockNotifications.length} notifications`);

    // Seed WhatsApp messages
    console.log('📱 Seeding WhatsApp messages...');
    for (const message of mockWhatsAppMessages) {
      await db.collection('whatsappMessages').doc(message.id).set(message);
    }
    console.log(`✅ Seeded ${mockWhatsAppMessages.length} WhatsApp messages`);

    // Seed activities
    console.log('📊 Seeding activities...');
    for (const activity of mockActivities) {
      await db.collection('activities').doc(activity.id).set(activity);
    }
    console.log(`✅ Seeded ${mockActivities.length} activities`);

    console.log('🎉 Data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${mockUsers.length}`);
    console.log(`   - Tasks: ${mockTasks.length}`);
    console.log(`   - Chat Messages: ${mockChatMessages.length}`);
    console.log(`   - Notifications: ${mockNotifications.length}`);
    console.log(`   - WhatsApp Messages: ${mockWhatsAppMessages.length}`);
    console.log(`   - Activities: ${mockActivities.length}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the seeding script
seedData();
