export interface User {
  id: number;
  username: string;
  password: string;
  role: 'master' | 'sub';
  department: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  department: string;
  assignedTo: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

export interface TaskComment {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  filename: string;
  fileUrl: string;
  uploadedBy: number;
  uploadedAt: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  fileName?: string;
  fileUrl?: string;
  isRead: boolean;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'task' | 'chat' | 'system' | 'whatsapp';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
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
  type: 'task_created' | 'task_updated' | 'user_created' | 'message_sent';
  description: string;
  userId: number;
  timestamp: string;
}