# Task Approval Workflow Implementation

## Overview

This document describes the implementation of a hierarchical task approval workflow system where tasks flow through a specific chain of responsibility from Master Admin → Director → Employee and back through approval levels.

## Workflow Process

### 1. Task Creation & Assignment

**Master Admin** creates tasks and assigns them to **Directors/Chairmen**:
- Task status: `pending` → `assigned_to_director`
- Task is assigned to a director who will manage it

**Director/Chairman** assigns tasks to **Employees**:
- Task status: `assigned_to_director` → `assigned_to_employee`
- Task is assigned to an employee who will execute it

### 2. Task Execution

**Employee** works on the task and marks it as complete:
- Task status: `assigned_to_employee` → `pending_director_approval`
- Creates an approval entry in the approval chain for the director
- Director receives notification about pending approval

### 3. Director Approval

**Director/Chairman** reviews the completed task:

**If Approved:**
- Task status: `pending_director_approval` → `pending_admin_approval`
- Creates an approval entry for the master admin
- Admin receives notification about pending approval

**If Rejected:**
- Task status: `pending_director_approval` → `rejected`
- Includes rejection reason
- Employee can see the rejection reason and rework the task

### 4. Admin Final Approval

**Master Admin** gives final approval:

**If Approved:**
- Task status: `pending_admin_approval` → `completed`
- Task is fully completed and closed

**If Rejected:**
- Task status: `pending_admin_approval` → `rejected`
- Includes rejection reason
- Task goes back to employee for rework

## User Roles

### Master Admin (`master`)
- Creates and assigns tasks to directors
- Gives final approval for completed tasks
- Can see all tasks and approval statuses
- Receives notifications for pending admin approvals

### Director/Chairman (`director`)
- Receives tasks from master admin
- Assigns tasks to employees under their supervision
- Reviews and approves/rejects employee-completed tasks
- Receives notifications for pending director approvals
- Reports to master admin

### Employee (`employee`)
- Receives tasks from directors
- Executes tasks and marks them as complete
- Can see approval status and rejection reasons
- Reports to a specific director (via `reportsTo` field)

## Data Model Changes

### User Interface
```typescript
interface User {
  id: number;
  role: 'master' | 'director' | 'employee';
  reportsTo?: number; // ID of the person they report to
  // ... other fields
}
```

### Task Interface
```typescript
interface Task {
  id: string;
  status: 'pending' | 'assigned_to_director' | 'assigned_to_employee' | 
          'pending_director_approval' | 'pending_admin_approval' | 
          'completed' | 'rejected' | 'paused';
  assignedDirector?: number; // Director assigned by master admin
  assignedEmployee?: number; // Employee assigned by director
  approvalChain: TaskApproval[]; // Chain of approvals
  currentApprovalLevel: 'none' | 'director' | 'admin'; // Who needs to approve next
  rejectionReason?: string; // Reason for rejection
  // ... other fields
}
```

### TaskApproval Interface
```typescript
interface TaskApproval {
  id: string;
  taskId: string;
  approverUserId: number;
  approverRole: 'director' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}
```

## Backend Services

### New Firebase Service Methods

1. **`assignToDirector(taskId, directorId)`** - Master admin assigns task to director
2. **`assignToEmployee(taskId, employeeId)`** - Director assigns task to employee
3. **`markAsCompletedByEmployee(taskId)`** - Employee marks task as complete
4. **`approveByDirector(taskId, approved, rejectionReason?)`** - Director approves/rejects
5. **`approveByAdmin(taskId, approved, rejectionReason?)`** - Admin approves/rejects
6. **`getTasksAwaitingApproval(userId, role)`** - Get pending approvals for user

## Frontend Components

### TaskCard Component
- Shows appropriate action buttons based on user role and task status
- Displays approval status and rejection reasons
- Provides assignment dropdowns for directors and employees
- Shows "Mark Complete", "Approve", and "Reject" buttons contextually

### ApprovalSection Component
- Role-specific approval dashboards
- Shows pending approvals for directors and admins
- Allows bulk approval actions
- Real-time updates of approval status

## Status Flow Diagram

```
Master Admin Creates Task
         ↓
    [pending]
         ↓ (assigns to director)
[assigned_to_director]
         ↓ (director assigns to employee)
[assigned_to_employee]
         ↓ (employee marks complete)
[pending_director_approval]
         ↓ (director approves)
[pending_admin_approval]
         ↓ (admin approves)
    [completed]

Note: At any approval stage, rejection sends task to [rejected] status
```

## Real-time Updates

- All status changes are synchronized across devices via Firebase
- Notifications are sent to relevant users when approvals are needed
- Activity logs track all approval actions
- Users can see live updates of task progress and approval status

## Benefits

1. **Clear Chain of Responsibility**: Tasks follow a defined hierarchy
2. **Accountability**: Every approval is tracked with timestamps and user IDs
3. **Quality Control**: Multiple approval levels ensure quality standards
4. **Transparency**: All users can see the current approval status
5. **Audit Trail**: Complete history of approvals and rejections
6. **Real-time Sync**: Status updates are immediate across all devices

## Testing

Use the test script at `scripts/test-approval-workflow.cjs` to verify the complete workflow:

```bash
node scripts/test-approval-workflow.cjs
```

This will test both the approval and rejection workflows to ensure everything works correctly.