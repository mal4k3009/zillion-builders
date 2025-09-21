const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://zillion-builders-group-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function fixChairmanApprovals() {
  try {
    console.log('🔧 Starting to fix chairman approval assignments...');
    
    // Get all users to find the correct chairman
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({ 
      id: parseInt(doc.id), 
      ...doc.data() 
    }));
    
    // Find chairmen and select the one with highest ID (most recent)
    const chairmen = users.filter(u => u.role === 'chairman' || u.designation === 'chairman');
    const chairman = chairmen.length > 0 
      ? chairmen.sort((a, b) => b.id - a.id)[0] 
      : users.find(u => u.role === 'master');
    
    console.log('👑 Found chairmen:', chairmen.map(c => `ID: ${c.id}, Name: ${c.name}, Designation: ${c.designation}`));
    console.log('✅ Selected chairman:', chairman ? `ID: ${chairman.id}, Name: ${chairman.name}` : 'None');
    
    if (!chairman) {
      console.log('❌ No chairman found!');
      return;
    }
    
    // Get all tasks that are pending chairman approval
    const tasksSnapshot = await db.collection('tasks')
      .where('status', '==', 'pending_chairman_approval')
      .get();
    
    console.log(`📋 Found ${tasksSnapshot.docs.length} tasks pending chairman approval`);
    
    for (const taskDoc of tasksSnapshot.docs) {
      const taskData = taskDoc.data();
      const taskId = taskDoc.id;
      
      console.log(`🔄 Processing task: ${taskId} - "${taskData.title}"`);
      
      if (taskData.approvalChain && Array.isArray(taskData.approvalChain)) {
        // Update the chairman approval entry to use the correct user ID
        const updatedApprovalChain = taskData.approvalChain.map(approval => {
          if (approval.approverRole === 'chairman' && approval.status === 'pending') {
            console.log(`  ↻ Updating chairman approval from user ${approval.approverUserId} to user ${chairman.id}`);
            return {
              ...approval,
              approverUserId: chairman.id
            };
          }
          return approval;
        });
        
        // Update the task with the corrected approval chain
        await db.collection('tasks').doc(taskId).update({
          approvalChain: updatedApprovalChain,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`  ✅ Updated task ${taskId}`);
      }
    }
    
    console.log('🎉 All chairman approvals have been fixed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing chairman approvals:', error);
    process.exit(1);
  }
}

fixChairmanApprovals();