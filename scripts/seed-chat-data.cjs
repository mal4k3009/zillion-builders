const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK with service account
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

// Sample users data (make sure these IDs match your existing users)
const users = [
  { id: 1, name: 'Master Admin', department: 'management' },
  { id: 2, name: 'John Smith', department: 'construction' },
  { id: 3, name: 'Sarah Johnson', department: 'architecture' },
  { id: 4, name: 'Mike Wilson', department: 'engineering' },
  { id: 5, name: 'Emily Davis', department: 'finance' },
  { id: 6, name: 'David Brown', department: 'marketing' },
  { id: 7, name: 'Lisa Garcia', department: 'hr' },
  { id: 8, name: 'Tom Miller', department: 'legal' }
];

// Sample chat messages with realistic construction industry content
const sampleMessages = [
  // Master Admin to Construction Department
  {
    senderId: 1,
    receiverId: 2,
    content: "Hi John, can you provide an update on the Foundation work for Building A?",
    type: 'text'
  },
  {
    senderId: 2,
    receiverId: 1,
    content: "Hello Sir! Foundation work is 75% complete. We should finish by Friday.",
    type: 'text'
  },
  {
    senderId: 1,
    receiverId: 2,
    content: "Great progress! Please ensure quality control checks are done.",
    type: 'text'
  },
  {
    senderId: 2,
    receiverId: 1,
    content: "📎 Shared a file: foundation_quality_report.pdf",
    type: 'file',
    fileName: 'foundation_quality_report.pdf',
    fileUrl: 'https://example.com/files/foundation_quality_report.pdf'
  },

  // Master Admin to Architecture Department
  {
    senderId: 1,
    receiverId: 3,
    content: "Sarah, we need the revised blueprints for Phase 2. When can you have them ready?",
    type: 'text'
  },
  {
    senderId: 3,
    receiverId: 1,
    content: "Working on them now. Will send by tomorrow morning with all client requested changes.",
    type: 'text'
  },

  // Master Admin to Engineering Department
  {
    senderId: 1,
    receiverId: 4,
    content: "Mike, the client wants to add solar panels. Can you assess structural requirements?",
    type: 'text'
  },
  {
    senderId: 4,
    receiverId: 1,
    content: "I'll run the calculations and provide a structural analysis by Thursday.",
    type: 'text'
  },

  // Master Admin to Finance Department
  {
    senderId: 1,
    receiverId: 5,
    content: "Emily, please prepare the Q3 budget report for the board meeting.",
    type: 'text'
  },
  {
    senderId: 5,
    receiverId: 1,
    content: "Already working on it. The preliminary numbers look good. Will have the full report ready by Monday.",
    type: 'text'
  },

  // Inter-department conversations
  {
    senderId: 2,
    receiverId: 4,
    content: "Mike, we found some foundation settlement issues. Can you check the soil report?",
    type: 'text'
  },
  {
    senderId: 4,
    receiverId: 2,
    content: "I'll review it immediately. Send me the exact locations and measurements.",
    type: 'text'
  },

  {
    senderId: 3,
    receiverId: 6,
    content: "David, the new building design is ready for marketing materials.",
    type: 'text'
  },
  {
    senderId: 6,
    receiverId: 3,
    content: "Perfect timing! I'll coordinate with the photography team for the 3D renders.",
    type: 'text'
  },

  // More recent messages
  {
    senderId: 7,
    receiverId: 1,
    content: "Sir, we have 3 new engineer candidates for interviews. Should I schedule them this week?",
    type: 'text'
  },
  {
    senderId: 1,
    receiverId: 7,
    content: "Yes, please schedule them. Also include Mike in the technical interviews.",
    type: 'text'
  },

  {
    senderId: 8,
    receiverId: 1,
    content: "The permit for Building C has been approved! We can start construction next week.",
    type: 'text'
  },
  {
    senderId: 1,
    receiverId: 8,
    content: "Excellent news! I'll inform the construction team to prepare the site.",
    type: 'text'
  }
];

async function seedChatData() {
  console.log('🌱 Starting to seed chat data...');
  
  try {
    const batch = db.batch();
    let messageCount = 0;

    for (const messageData of sampleMessages) {
      // Create participants array for querying
      const participants = [
        `${messageData.senderId}_${messageData.receiverId}`,
        `${messageData.receiverId}_${messageData.senderId}`
      ];

      // Create a more realistic timestamp (spread over the last 7 days)
      const now = new Date();
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      
      const timestamp = new Date(
        now.getTime() - 
        (daysAgo * 24 * 60 * 60 * 1000) - 
        (hoursAgo * 60 * 60 * 1000) - 
        (minutesAgo * 60 * 1000)
      );

      const chatMessage = {
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        content: messageData.content,
        type: messageData.type,
        participants: participants,
        timestamp: admin.firestore.Timestamp.fromDate(timestamp),
        createdAt: admin.firestore.Timestamp.fromDate(timestamp),
        isRead: Math.random() > 0.3, // 70% chance of being read
        ...(messageData.fileName && { fileName: messageData.fileName }),
        ...(messageData.fileUrl && { fileUrl: messageData.fileUrl })
      };

      const docRef = db.collection('chatMessages').doc();
      batch.set(docRef, chatMessage);
      messageCount++;
    }

    await batch.commit();
    
    console.log(`✅ Successfully seeded ${messageCount} chat messages!`);
    console.log('\n📊 Summary:');
    console.log(`- Total messages: ${messageCount}`);
    console.log(`- Participants: ${users.length} users`);
    console.log(`- Time range: Last 7 days`);
    console.log('\n🎯 Features demonstrated:');
    console.log('- Master admin conversations with all departments');
    console.log('- Inter-department communications');
    console.log('- Text and file message types');
    console.log('- Realistic construction industry content');
    console.log('- Read/unread status simulation');
    console.log('- Proper Firebase timestamp handling');
    
  } catch (error) {
    console.error('❌ Error seeding chat data:', error);
  } finally {
    // Close the admin app
    await admin.app().delete();
    console.log('\n🔚 Seeding completed. Firebase connection closed.');
  }
}

// Helper function to display user information
function displayUserInfo() {
  console.log('\n👥 Users in the system:');
  users.forEach(user => {
    console.log(`  ${user.id}: ${user.name} (${user.department})`);
  });
  console.log('');
}

// Run the seeding
console.log('🚀 Firebase Chat Data Seeder');
console.log('===============================');
displayUserInfo();
seedChatData();