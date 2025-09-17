const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountkey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Admin SDK implementation of the task service methods for testing
const testTasksService = {
  async create(taskData) {
    const docRef = await db.collection('tasks').add({
      ...taskData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  },

  async getById(id) {
    const docRef = db.collection('tasks').doc(id);
    const docSnap = await docRef.get();
    return docSnap.exists ? { id, ...docSnap.data() } : null;
  },

  async assignToDirector(taskId, directorId) {
    const docRef = db.collection('tasks').doc(taskId);
    await docRef.update({
      assignedDirector: directorId,
      assignedTo: directorId,
      status: 'assigned_to_director',
      currentApprovalLevel: 'none',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  },

  async assignToEmployee(taskId, employeeId) {
    const docRef = db.collection('tasks').doc(taskId);
    await docRef.update({
      assignedEmployee: employeeId,
      assignedTo: employeeId,
      status: 'assigned_to_employee',
      currentApprovalLevel: 'none',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  },

  async markAsCompletedByEmployee(taskId) {
    const docRef = db.collection('tasks').doc(taskId);
    const taskDoc = await docRef.get();
    const task = taskDoc.data();
    
    if (!task) throw new Error('Task not found');
    
    const approvalEntry = {
      id: `${taskId}_director_${Date.now()}`,
      taskId,
      approverUserId: task.assignedDirector || 0,
      approverRole: 'director',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await docRef.update({
      status: 'pending_director_approval',
      currentApprovalLevel: 'director',
      approvalChain: [approvalEntry],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  },

  async approveByDirector(taskId, approved, rejectionReason) {
    const docRef = db.collection('tasks').doc(taskId);
    const taskDoc = await docRef.get();
    const task = taskDoc.data();
    
    if (!task) throw new Error('Task not found');
    
    if (approved) {
      const adminApprovalEntry = {
        id: `${taskId}_admin_${Date.now()}`,
        taskId,
        approverUserId: task.createdBy,
        approverRole: 'admin',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const updatedApprovalChain = (task.approvalChain || []).map(approval => 
        approval.approverRole === 'director' 
          ? { ...approval, status: 'approved', approvedAt: new Date().toISOString() }
          : approval
      );

      await docRef.update({
        status: 'pending_admin_approval',
        currentApprovalLevel: 'admin',
        approvalChain: [...updatedApprovalChain, adminApprovalEntry],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      const updatedApprovalChain = (task.approvalChain || []).map(approval => 
        approval.approverRole === 'director' 
          ? { 
              ...approval, 
              status: 'rejected', 
              approvedAt: new Date().toISOString(),
              rejectionReason 
            }
          : approval
      );

      await docRef.update({
        status: 'rejected',
        currentApprovalLevel: 'none',
        rejectionReason,
        approvalChain: updatedApprovalChain,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  },

  async approveByAdmin(taskId, approved, rejectionReason) {
    const docRef = db.collection('tasks').doc(taskId);
    const taskDoc = await docRef.get();
    const task = taskDoc.data();
    
    if (!task) throw new Error('Task not found');
    
    if (approved) {
      const updatedApprovalChain = (task.approvalChain || []).map(approval => 
        approval.approverRole === 'admin' 
          ? { ...approval, status: 'approved', approvedAt: new Date().toISOString() }
          : approval
      );

      await docRef.update({
        status: 'completed',
        currentApprovalLevel: 'none',
        approvalChain: updatedApprovalChain,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      const updatedApprovalChain = (task.approvalChain || []).map(approval => 
        approval.approverRole === 'admin' 
          ? { 
              ...approval, 
              status: 'rejected', 
              approvedAt: new Date().toISOString(),
              rejectionReason 
            }
          : approval
      );

      await docRef.update({
        status: 'rejected',
        currentApprovalLevel: 'none',
        rejectionReason,
        approvalChain: updatedApprovalChain,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
};

async function testApprovalWorkflow() {
  console.log('🚀 Starting Approval Workflow Test');
  
  try {
    // 1. Master Admin creates a task
    console.log('\n📝 Step 1: Master Admin creates a task');
    const taskId = await testTasksService.create({
      title: 'Test Approval Workflow Task',
      description: 'This task tests the complete approval workflow',
      category: 'Test',
      assignedTo: 1, // Initially assigned to master admin
      priority: 'high',
      status: 'pending',
      dueDate: '2024-12-31T00:00:00Z',
      createdBy: 1, // Master Admin (ID: 1)
      comments: [],
      attachments: [],
      approvalChain: [],
      currentApprovalLevel: 'none'
    });
    console.log(`✅ Task created with ID: ${taskId}`);

    // 2. Master Admin assigns to Director
    console.log('\n👥 Step 2: Master Admin assigns task to Director');
    await testTasksService.assignToDirector(taskId, 2); // Director (ID: 2)
    console.log('✅ Task assigned to Director');

    // Verify assignment
    let task = await testTasksService.getById(taskId);
    console.log(`   Status: ${task.status}, Assigned to: ${task.assignedTo}`);

    // 3. Director assigns to Employee
    console.log('\n👤 Step 3: Director assigns task to Employee');
    await testTasksService.assignToEmployee(taskId, 3); // Employee (ID: 3)
    console.log('✅ Task assigned to Employee');

    // Verify assignment
    task = await testTasksService.getById(taskId);
    console.log(`   Status: ${task.status}, Assigned to: ${task.assignedTo}`);

    // 4. Employee marks task as complete
    console.log('\n✅ Step 4: Employee marks task as complete');
    await testTasksService.markAsCompletedByEmployee(taskId);
    console.log('✅ Task marked as completed by employee, pending director approval');

    // Verify status
    task = await testTasksService.getById(taskId);
    console.log(`   Status: ${task.status}, Current approval level: ${task.currentApprovalLevel}`);
    console.log(`   Approval chain length: ${task.approvalChain?.length || 0}`);

    // 5. Director approves
    console.log('\n👍 Step 5: Director approves the task');
    await testTasksService.approveByDirector(taskId, true);
    console.log('✅ Task approved by director, pending admin approval');

    // Verify status
    task = await testTasksService.getById(taskId);
    console.log(`   Status: ${task.status}, Current approval level: ${task.currentApprovalLevel}`);
    console.log(`   Approval chain length: ${task.approvalChain?.length || 0}`);

    // 6. Admin approves
    console.log('\n🏆 Step 6: Admin gives final approval');
    await testTasksService.approveByAdmin(taskId, true);
    console.log('✅ Task fully approved and completed!');

    // Verify final status
    const finalTask = await testTasksService.getById(taskId);
    console.log(`\n🎉 Final task status: ${finalTask?.status}`);
    console.log(`📋 Approval chain length: ${finalTask?.approvalChain?.length || 0}`);
    console.log(`🔄 Current approval level: ${finalTask?.currentApprovalLevel}`);
    
    console.log('\n✨ Workflow test completed successfully!');
    
    return taskId; // Return for cleanup or further testing
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error);
    throw error;
  }
}

async function testRejectionWorkflow() {
  console.log('\n🔄 Testing Rejection Workflow');
  
  try {
    // Create a task and go through rejection
    const taskId = await testTasksService.create({
      title: 'Test Rejection Workflow Task',
      description: 'This task tests the rejection workflow',
      category: 'Test',
      assignedTo: 1,
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-12-31T00:00:00Z',
      createdBy: 1,
      comments: [],
      attachments: [],
      approvalChain: [],
      currentApprovalLevel: 'none'
    });

    console.log(`📝 Created rejection test task: ${taskId}`);

    await testTasksService.assignToDirector(taskId, 2);
    await testTasksService.assignToEmployee(taskId, 3);
    await testTasksService.markAsCompletedByEmployee(taskId);

    // Director rejects
    console.log('❌ Director rejects the task');
    await testTasksService.approveByDirector(taskId, false, 'Quality standards not met');
    
    const rejectedTask = await testTasksService.getById(taskId);
    console.log(`✅ Task status after rejection: ${rejectedTask?.status}`);
    console.log(`📝 Rejection reason: ${rejectedTask?.rejectionReason}`);
    console.log(`🔄 Current approval level: ${rejectedTask?.currentApprovalLevel}`);
    
    return taskId;
    
  } catch (error) {
    console.error('❌ Rejection workflow test failed:', error);
    throw error;
  }
}

async function runAllTests() {
  console.log('🧪 Starting Approval Workflow Tests\n');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Complete Approval Workflow
    const approvedTaskId = await testApprovalWorkflow();
    
    console.log('\n' + '='.repeat(50));
    
    // Test 2: Rejection Workflow
    const rejectedTaskId = await testRejectionWorkflow();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 All tests completed successfully!');
    console.log(`📊 Tasks created: ${approvedTaskId}, ${rejectedTaskId}`);
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run the tests
runAllTests();