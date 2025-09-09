// Add this to your frontend services or context
// This would replace the direct server-side calls

export const notificationAPI = {
  async sendTaskAssignedNotification(taskId: string, assignedUserId: string, assignedByUserId: string, taskTitle: string) {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          assignedUserId,
          assignedByUserId,
          taskTitle
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error calling notification API:', error);
      return false;
    }
  }
};
