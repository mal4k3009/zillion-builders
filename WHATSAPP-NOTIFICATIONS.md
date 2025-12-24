# WhatsApp Notification System Documentation

## Overview
The application has been configured to send all notifications via WhatsApp instead of local device notifications. All task updates, chat messages, approvals, and system events will be sent to designated WhatsApp numbers.

## API Configuration

### Provider
- **Service**: wpauto.jenilpatel.co.in
- **API Key**: BWYcB3LFk2FgXxbTeBtriXeyHYciV
- **Sender Number**: 917861945951

### API Endpoint
```
https://wpauto.jenilpatel.co.in/send-message?api_key={api}&sender={sender}&number={number}&message={msg}&footer={footer}
```

## Notification Recipients

The following contacts are configured to receive WhatsApp notifications:

1. **Manthan**
   - Number: +91 7284 045 643
   - Role: Admin
   - Status: ✅ Enabled

2. **Ketankumar**
   - Number: +91 92285 02050
   - Role: Manager
   - Status: ✅ Enabled

3. **Jigneshbhai**
   - Number: +91 9925823424
   - Role: Director
   - Status: ✅ Enabled

## Notification Types

### 1. Task Assigned
Sent when a new task is assigned to a user.

**Format:**
```
📋 *New Task Assigned*

*Task:* [Task Title]
*Assigned To:* [User Name]
*Assigned By:* [Manager Name]

Please check the task management system for details.
```

### 2. Task Completed
Sent when a user marks a task as completed.

**Format:**
```
✅ *Task Completed*

*Task:* [Task Title]
*Completed By:* [User Name]

Great job!
```

### 3. Task Overdue
Sent when a task passes its due date without being completed.

**Format:**
```
⚠️ *Task Overdue*

*Task:* [Task Title]
*Assigned To:* [User Name]
*Due Date:* [Date]

Please take immediate action!
```

### 4. Task Updated
Sent when task details are modified.

**Format:**
```
🔄 *Task Updated*

*Task:* [Task Title]
*Updated By:* [User Name]
*Changes:* [Change Description]

Check the system for latest updates.
```

### 5. Chat Message
Sent when a new chat message is received.

**Format:**
```
💬 *New Chat Message*

*From:* [Sender Name]
*Message:* [Message Content]

Open the chat to view full message.
```

### 6. Approval Request
Sent when a task requires approval.

**Format:**
```
🔔 *Approval Request*

*Task:* [Task Title]
*Requested By:* [User Name]

Please review and approve/reject this task.
```

### 7. Approval Decision
Sent when an approval is granted or rejected.

**Format:**
```
✅ *Task APPROVED*
or
❌ *Task REJECTED*

*Task:* [Task Title]
*Decision By:* [Approver Name]

The task has been [approved/rejected].
```

### 8. Project Update
Sent when project information changes.

**Format:**
```
📊 *Project Update*

*Project:* [Project Name]
*Update:* [Update Type]
*Updated By:* [User Name]
```

## Configuration

### Modify Recipients
To add or remove WhatsApp recipients, edit the configuration file:

**File:** `src/config/whatsappConfig.ts`

```typescript
contacts: [
  {
    name: 'Contact Name',
    number: '91XXXXXXXXXX', // Include country code, no + or spaces
    role: 'Role',
    enabled: true // Set to false to disable
  }
]
```

### Modify API Settings
To update API credentials, edit the same configuration file:

```typescript
apiKey: 'YOUR_API_KEY',
sender: 'YOUR_SENDER_NUMBER',
apiEndpoint: 'https://wpauto.jenilpatel.co.in/send-message'
```

### Enable/Disable Notification Types
In `whatsappConfig.ts`, you can control which types of notifications are sent:

```typescript
settings: {
  taskAssigned: true,
  taskCompleted: true,
  taskOverdue: true,
  taskUpdated: true,
  chatMessage: true,
  approvalRequest: true,
  approvalDecision: true,
  projectUpdate: true
}
```

## File Structure

### Core Files
1. **`src/services/whatsappService.ts`**
   - Main WhatsApp service implementation
   - Handles message sending and formatting
   - Manages contact list

2. **`src/config/whatsappConfig.ts`**
   - Configuration settings
   - Contact list management
   - API credentials

3. **`src/services/notificationService.ts`**
   - Notification service wrapper
   - Calls WhatsApp service for all notifications
   - Provides unified interface

### Integration Points
- **Task Assignment**: `src/components/tasks/TaskModal.tsx`
- **Task Completion**: `src/firebase/services.ts`
- **Chat Messages**: `src/context/AppContext.tsx`
- **Approvals**: `src/components/dashboard/ApprovalSection.tsx`
- **Overdue Tasks**: `src/services/taskMonitoringService.ts`

## Testing

### Test Script
A test script is available to verify WhatsApp notifications:

**File:** `src/utils/testWhatsAppNotifications.ts`

To run the test:
```bash
npm run test:whatsapp
```

This will send sample notifications for all notification types to verify the integration is working correctly.

### Manual Testing
1. Create a new task and assign it to a user
2. Mark a task as completed
3. Send a chat message
4. Approve or reject a task
5. Check WhatsApp messages on the configured numbers

## Troubleshooting

### Messages Not Received
1. **Check API Key**: Verify the API key is correct in `whatsappConfig.ts`
2. **Check Phone Numbers**: Ensure numbers include country code (91 for India) without + or spaces
3. **Check Network**: Ensure the application can reach the API endpoint
4. **Check Logs**: Look for error messages in the browser console

### Common Errors

**Error: "status": false**
- API key is incorrect or expired
- Sender number is not authorized
- Recipient number is invalid

**Error: Network request failed**
- API endpoint is unreachable
- CORS issues (may need backend proxy)
- Internet connection problems

### Enable Debug Mode
To see detailed logs, open browser console and look for:
- ✅ Success messages (green checkmark)
- ❌ Error messages (red X)
- 📱 Notification sending indicators

## Notes

1. **All notifications** are now sent via WhatsApp - local device notifications are disabled
2. **All configured contacts** receive all notifications (broadcast style)
3. Messages are sent **immediately** when events occur
4. The system **does not store** message history - check WhatsApp for records
5. **Rate limiting** may apply based on the API provider's limits
6. Messages are sent in **plain text** with WhatsApp markdown formatting

## Support

For API-related issues, contact the API provider:
- Service: wpauto.jenilpatel.co.in
- Support: Check with Jigneshbhai (9925823424) or the API provider

For application issues, check the browser console for error logs and verify the configuration files are correct.
