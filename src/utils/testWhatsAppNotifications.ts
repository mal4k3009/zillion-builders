// WhatsApp Notification Test Script
// This script tests the WhatsApp notification service

import { whatsappService } from '../services/whatsappService';

console.log('📱 WhatsApp Notification Test Script');
console.log('=====================================\n');

// Display configured contacts
console.log('📋 Configured Contacts:');
const contacts = whatsappService.getContacts();
contacts.forEach(contact => {
  console.log(`  - ${contact.name}: ${contact.number}`);
});
console.log('\n');

// Test function to send sample notifications
async function testWhatsAppNotifications() {
  try {
    console.log('🧪 Testing WhatsApp Notifications...\n');

    // Test 1: Task Assigned Notification
    console.log('Test 1: Sending Task Assigned Notification...');
    await whatsappService.sendTaskAssignedNotification(
      'Prepare Monthly Report',
      'John Doe',
      'Manager'
    );
    console.log('✅ Task Assigned notification sent\n');
    await delay(2000);

    // Test 2: Task Completed Notification
    console.log('Test 2: Sending Task Completed Notification...');
    await whatsappService.sendTaskCompletedNotification(
      'Monthly Report Preparation',
      'John Doe'
    );
    console.log('✅ Task Completed notification sent\n');
    await delay(2000);

    // Test 3: Task Overdue Notification
    console.log('Test 3: Sending Task Overdue Notification...');
    await whatsappService.sendTaskOverdueNotification(
      'Client Meeting Preparation',
      'Jane Smith',
      '2024-01-15'
    );
    console.log('✅ Task Overdue notification sent\n');
    await delay(2000);

    // Test 4: Chat Message Notification
    console.log('Test 4: Sending Chat Message Notification...');
    await whatsappService.sendChatMessageNotification(
      'Alice',
      'Hi there! Just checking in on the project status.'
    );
    console.log('✅ Chat Message notification sent\n');
    await delay(2000);

    // Test 5: Approval Request Notification
    console.log('Test 5: Sending Approval Request Notification...');
    await whatsappService.sendApprovalRequestNotification(
      'Budget Proposal Q1 2024',
      'Finance Team'
    );
    console.log('✅ Approval Request notification sent\n');
    await delay(2000);

    // Test 6: Approval Decision Notification (Approved)
    console.log('Test 6: Sending Approval Decision Notification (Approved)...');
    await whatsappService.sendApprovalDecisionNotification(
      'Budget Proposal Q1 2024',
      'approved',
      'CEO'
    );
    console.log('✅ Approval Decision (Approved) notification sent\n');
    await delay(2000);

    // Test 7: Approval Decision Notification (Rejected)
    console.log('Test 7: Sending Approval Decision Notification (Rejected)...');
    await whatsappService.sendApprovalDecisionNotification(
      'Marketing Campaign Proposal',
      'rejected',
      'Director'
    );
    console.log('✅ Approval Decision (Rejected) notification sent\n');
    await delay(2000);

    // Test 8: Custom Notification
    console.log('Test 8: Sending Custom Notification...');
    await whatsappService.sendCustomNotification(
      '🎉 System Update',
      'A new version of the Task Management System has been deployed with enhanced features!'
    );
    console.log('✅ Custom notification sent\n');

    console.log('\n✅ All tests completed successfully!');
    console.log('📱 Check the WhatsApp numbers to verify the messages were received.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Helper function to add delay between tests
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the tests
testWhatsAppNotifications();
