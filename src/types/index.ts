export interface User {
  id: number;
  uid?: string; // Firebase UID for new users
  firebaseUid?: string; // Firebase UID stored in Firestore
  username: string;
  password: string;
  role: 'master' | 'director' | 'employee' | 'chairman';
  designation: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  reportsTo?: number; // ID of the person they report to (employee reports to director)
}

export interface TaskApproval {
  id: string;
  taskId: string;
  approverUserId: number;
  approverRole: 'director' | 'admin' | 'chairman';
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectionReason?: string;
  reapprovalReason?: string;
  createdAt: string;
}

export interface Task {
  id: string; // Changed to string for Firebase document ID
  title: string;
  description?: string;
  category: string;
  assignedTo: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned_to_director' | 'assigned_to_chairman' | 'assigned_to_employee' | 'in_progress' | 'completed_by_employee' | 'pending_director_approval' | 'pending_admin_approval' | 'pending_chairman_approval' | 'completed' | 'paused' | 'rejected';
  approvalStatus?: 'pending_approval' | 'approved' | 'rejected';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  projectId?: number;
  categoryId?: number;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  pausedAt?: string; // Track when task was paused
  pausedBy?: number; // Track who paused the task
  // New approval workflow fields
  assignedDirector?: number; // Director assigned by master admin
  assignedEmployee?: number; // Employee assigned by director
  skipDirectorApproval?: boolean; // For chairman-to-employee direct assignments
  directChairmanApproval?: boolean; // Tasks that go directly to chairman for approval
  approvalChain: TaskApproval[]; // Chain of approvals
  currentApprovalLevel: 'none' | 'director' | 'admin' | 'chairman'; // Who needs to approve next
  rejectionReason?: string; // Reason for rejection
  reapprovalReason?: string; // Reason for reapproval submission
}

export interface TaskComment {
  id: number;
  taskId: string; // Changed to string to match Task.id
  userId: number;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: number;
  taskId: string; // Changed to string to match Task.id
  filename: string;
  fileUrl: string;
  uploadedBy: number;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  fileName?: string;
  fileUrl?: string;
  isRead: boolean;
  participants?: string[]; // For Firebase querying
}

export interface Notification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: 'task_assigned' | 'task_updated' | 'message_received' | 'system' | 'task_completed' | 'approval_required' | 'approval_approved' | 'approval_rejected' | 'task_assigned_to_director' | 'task_assigned_to_employee';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  // Additional fields for context
  relatedUserId?: number; // Who sent the message or assigned the task
  relatedUserName?: string; // Name of the related user
  taskId?: string; // For task-related notifications (changed to string)
  messageId?: string; // For message-related notifications
  priority?: 'low' | 'medium' | 'high'; // Notification priority
}

export interface WhatsAppMessage {
  id: number;
  to: string;
  message: string;
  type: 'task_assigned' | 'task_completed' | 'daily_summary' | 'overdue_alert';
  sentAt: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  departmentStats: Record<string, number>;
  recentActivity: Activity[];
}

export interface Activity {
  id: number;
  type: 'task_created' | 'task_updated' | 'user_created' | 'user_updated' | 'message_sent' | 'task_approved' | 'task_rejected' | 'approval_requested';
  description: string;
  userId: number;
  timestamp: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'completed';
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  projectId: number;
  createdAt: string;
}

export interface UserCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  assignedUsers: number[]; // Array of user IDs assigned to this category
}