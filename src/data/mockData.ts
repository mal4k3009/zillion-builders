import { User, Task, ChatMessage, Notification, WhatsAppMessage, Activity } from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'masteradmin',
    password: 'admin123',
    role: 'master',
    designation: 'admin',
    name: 'Master Administrator',
    email: 'admin@company.com',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'sales_admin',
    password: 'sales123',
    role: 'director',
    designation: 'director',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    status: 'active',
    lastLogin: '2024-12-15T10:30:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    reportsTo: 1
  },
  {
    id: 3,
    username: 'pr_admin',
    password: 'pr123',
    role: 'employee',
    designation: 'staff',
    name: 'Michael Chen',
    email: 'michael@company.com',
    status: 'active',
    lastLogin: '2024-12-15T09:45:00Z',
    createdAt: '2024-01-20T00:00:00Z',
    reportsTo: 2
  },
  {
    id: 4,
    username: 'marketing_admin',
    password: 'marketing123',
    role: 'director',
    designation: 'chairman',
    name: 'Emily Rodriguez',
    email: 'emily@company.com',
    status: 'active',
    lastLogin: '2024-12-15T11:15:00Z',
    createdAt: '2024-02-01T00:00:00Z',
    reportsTo: 1
  },
  {
    id: 5,
    username: 'design_admin',
    password: 'design123',
    role: 'employee',
    designation: 'designer',
    name: 'David Kumar',
    email: 'david@company.com',
    status: 'active',
    lastLogin: '2024-12-15T08:20:00Z',
    createdAt: '2024-02-15T00:00:00Z',
    reportsTo: 4
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create a modern, responsive landing page for the company website',
    category: 'Design',
    assignedTo: 2,
    priority: 'high',
    status: 'assigned_to_director',
    dueDate: '2024-12-25T00:00:00Z',
    createdAt: '2024-12-10T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z',
    createdBy: 1,
    projectId: 1,
    categoryId: 1,
    comments: [],
    attachments: [],
    assignedDirector: 2,
    approvalChain: [],
    currentApprovalLevel: 'none'
  },
  {
    id: '2',
    title: 'Update marketing materials',
    description: 'Refresh all marketing materials with new branding',
    category: 'Marketing',
    assignedTo: 3,
    priority: 'medium',
    status: 'assigned_to_employee',
    dueDate: '2024-12-30T00:00:00Z',
    createdAt: '2024-12-12T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z',
    createdBy: 1,
    projectId: 2,
    categoryId: 2,
    comments: [],
    attachments: [],
    assignedDirector: 2,
    assignedEmployee: 3,
    approvalChain: [],
    currentApprovalLevel: 'none'
  },
  {
    id: '3',
    title: 'Database optimization',
    description: 'Optimize database queries for better performance',
    category: 'Development',
    assignedTo: 3,
    priority: 'high',
    status: 'pending_director_approval',
    dueDate: '2024-12-20T00:00:00Z',
    createdAt: '2024-12-08T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z',
    createdBy: 1,
    projectId: 3,
    categoryId: 3,
    comments: [],
    attachments: [],
    assignedDirector: 2,
    assignedEmployee: 3,
    approvalChain: [{
      id: '3_director_1734234000000',
      taskId: '3',
      approverUserId: 2,
      approverRole: 'director',
      status: 'pending',
      createdAt: '2024-12-15T10:00:00Z'
    }],
    currentApprovalLevel: 'director'
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 1,
    senderId: 1,
    receiverId: 2,
    content: 'Hi Sarah, how is the Q4 presentation coming along?',
    timestamp: '2024-12-14T10:00:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: 2,
    senderId: 2,
    receiverId: 1,
    content: 'Good morning! I\'m about 70% done. Working on the financial analysis section now.',
    timestamp: '2024-12-14T10:05:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: 3,
    senderId: 1,
    receiverId: 2,
    content: 'Great! Let me know if you need any additional data from finance.',
    timestamp: '2024-12-14T10:07:00Z',
    type: 'text',
    isRead: false
  },
  {
    id: 4,
    senderId: 1,
    receiverId: 4,
    content: 'Emily, please prioritize the social media campaign. It\'s urgent for the holiday season.',
    timestamp: '2024-12-14T11:30:00Z',
    type: 'text',
    isRead: false
  },
  {
    id: 5,
    senderId: 3,
    receiverId: 1,
    content: 'Press release is completed and ready for final review!',
    timestamp: '2024-12-15T16:45:00Z',
    type: 'text',
    isRead: false
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: 2,
    title: 'New Task Assigned',
    message: 'You have been assigned: Prepare Q4 Sales Presentation',
    type: 'task',
    isRead: false,
    createdAt: '2024-12-14T09:00:00Z',
    actionUrl: '/tasks/1'
  },
  {
    id: 2,
    userId: 4,
    title: 'Urgent Task',
    message: 'High priority task assigned: Social Media Campaign Launch',
    type: 'task',
    isRead: false,
    createdAt: '2024-12-14T11:30:00Z',
    actionUrl: '/tasks/2'
  },
  {
    id: 3,
    userId: 1,
    title: 'Task Completed',
    message: 'Michael Chen completed: Press Release Draft',
    type: 'task',
    isRead: true,
    createdAt: '2024-12-15T16:45:00Z',
    actionUrl: '/tasks/3'
  }
];

export const mockWhatsAppMessages: WhatsAppMessage[] = [
  {
    id: 1,
    to: '+1234567890',
    message: '📋 New Task Assigned\n\nHi Sarah,\n\nYou have been assigned a new HIGH priority task:\n\n"Prepare Q4 Sales Presentation"\n\nDue: Dec 20, 2024\n\nPlease check your dashboard for details.',
    type: 'task_assigned',
    sentAt: '2024-12-14T09:01:00Z',
    status: 'delivered'
  },
  {
    id: 2,
    to: '+1234567891',
    message: '✅ Task Update\n\nHi Admin,\n\nMichael Chen has completed the task:\n\n"Press Release Draft"\n\nCompleted on: Dec 15, 2024\n\nCheck the dashboard for details.',
    type: 'task_completed',
    sentAt: '2024-12-15T16:46:00Z',
    status: 'read'
  },
  {
    id: 3,
    to: '+1234567892',
    message: '⏰ Daily Summary\n\nGood morning Emily!\n\nYour pending tasks for today:\n\n1. Social Media Campaign Launch (URGENT)\n2. Market Research Analysis (HIGH)\n\nTotal: 2 pending tasks\n\nHave a productive day!',
    type: 'daily_summary',
    sentAt: '2024-12-15T08:00:00Z',
    status: 'delivered'
  }
];

export const mockActivities: Activity[] = [
  {
    id: 1,
    type: 'task_created',
    description: 'Created new task "Prepare Q4 Sales Presentation" for Sales department',
    userId: 1,
    timestamp: '2024-12-14T09:00:00Z'
  },
  {
    id: 2,
    type: 'task_updated',
    description: 'Updated task "Press Release Draft" status to completed',
    userId: 3,
    timestamp: '2024-12-15T16:45:00Z'
  },
  {
    id: 3,
    type: 'message_sent',
    description: 'Sent message to Sarah Johnson',
    userId: 1,
    timestamp: '2024-12-14T10:00:00Z'
  },
  {
    id: 4,
    type: 'user_created',
    description: 'Created new sub admin account for Marketing department',
    userId: 1,
    timestamp: '2024-12-13T15:30:00Z'
  }
];

export const departments = [
  { id: 'sales', name: 'Sales', color: '#10B981' },
  { id: 'pr', name: 'Public Relations', color: '#8B5CF6' },
  { id: 'marketing', name: 'Marketing', color: '#F59E0B' },
  { id: 'operations', name: 'Operations', color: '#3B82F6' }
];

export const priorityLevels = [
  { id: 'low', name: 'Low', color: '#6B7280' },
  { id: 'medium', name: 'Medium', color: '#F59E0B' },
  { id: 'high', name: 'High', color: '#EF4444' },
  { id: 'urgent', name: 'Urgent', color: '#DC2626' }
];

export const taskStatuses = [
  { id: 'pending', name: 'Pending', color: '#6B7280' },
  { id: 'assigned_to_director', name: 'Assigned to Director', color: '#3B82F6' },
  { id: 'assigned_to_chairman', name: 'Assigned to Chairman', color: '#7C3AED' },
  { id: 'assigned_to_employee', name: 'Assigned to Employee', color: '#06B6D4' },
  { id: 'in_progress', name: 'In Progress', color: '#F59E0B' },
  { id: 'completed_by_employee', name: 'Completed by Employee', color: '#84CC16' },
  { id: 'pending_director_approval', name: 'Pending Director Approval', color: '#F97316' },
  { id: 'pending_admin_approval', name: 'Pending Admin Approval', color: '#EF4444' },
  { id: 'pending_chairman_approval', name: 'Pending Chairman Approval', color: '#DC2626' },
  { id: 'completed', name: 'Completed', color: '#10B981' },
  { id: 'rejected', name: 'Rejected', color: '#DC2626' },
  { id: 'paused', name: 'Paused', color: '#8B5CF6' }
];