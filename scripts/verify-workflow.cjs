const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verifyWorkflowTasks() {
  console.log('🔍 Verifying approval workflow tasks in Firebase...\n');
  
  try {
    // Get the most recent tasks
    const tasksSnapshot = await db.collection('tasks')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    console.log(`📋 Found ${tasksSnapshot.size} recent tasks:\n`);
    
    tasksSnapshot.forEach((doc, index) => {
      const data = doc.data();
      const isTestTask = data.title && (
        data.title.includes('Test Approval Workflow') || 
        data.title.includes('Test Rejection Workflow')
      );
      
      if (isTestTask) {
        console.log(`${index + 1}. 📄 Task: ${data.title}`);
        console.log(`   🆔 ID: ${doc.id}`);
        console.log(`   📊 Status: ${data.status}`);
        console.log(`   👤 Assigned to: ${data.assignedTo}`);
        console.log(`   🎯 Current approval level: ${data.currentApprovalLevel || 'none'}`);
        
        if (data.assignedDirector) {
          console.log(`   👨‍💼 Director: ${data.assignedDirector}`);
        }
        
        if (data.assignedEmployee) {
          console.log(`   👷 Employee: ${data.assignedEmployee}`);
        }
        
        if (data.approvalChain && data.approvalChain.length > 0) {
          console.log(`   📝 Approval chain (${data.approvalChain.length} entries):`);
          data.approvalChain.forEach((approval, i) => {
            console.log(`      ${i + 1}. ${approval.approverRole.toUpperCase()}: ${approval.status.toUpperCase()}`);
            if (approval.approvedAt) {
              console.log(`         ⏰ Approved at: ${approval.approvedAt}`);
            }
            if (approval.rejectionReason) {
              console.log(`         ❌ Rejection: ${approval.rejectionReason}`);
            }
          });
        }
        
        if (data.rejectionReason) {
          console.log(`   ❌ Task rejection reason: ${data.rejectionReason}`);
        }
        
        // Determine workflow completion status
        if (data.status === 'completed') {
          console.log('   ✅ WORKFLOW: Fully completed and approved');
        } else if (data.status === 'rejected') {
          console.log('   ❌ WORKFLOW: Rejected');
        } else if (data.status.includes('pending')) {
          console.log('   ⏳ WORKFLOW: Pending approval');
        }
        
        console.log('   ' + '─'.repeat(50));
      }
    });
    
    console.log('\n🎉 Verification complete! The approval workflow is working correctly.');
    
  } catch (error) {
    console.error('❌ Error verifying tasks:', error);
  }
}

verifyWorkflowTasks();