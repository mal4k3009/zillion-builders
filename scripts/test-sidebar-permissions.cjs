const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  const serviceAccount = require('../serviceAccountkey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://zillion-builders-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function testSidebarPermissions() {
  console.log('🧪 Testing Sidebar Permissions for Different User Roles\n');
  
  // Navigation items configuration
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', roles: ['master', 'director', 'chairman', 'employee'] },
    { id: 'tasks', label: 'Tasks', roles: ['master', 'director', 'chairman', 'employee'] },
    { id: 'projects', label: 'Projects', roles: ['master', 'director', 'chairman'] },
    { id: 'categories', label: 'Categories', roles: ['master', 'director', 'chairman'] },
    { id: 'users', label: 'User Management', roles: ['master', 'director', 'chairman'] },
    { id: 'chat', label: 'Messages', roles: ['master', 'director', 'chairman', 'employee'] },
    { id: 'notifications', label: 'Notifications', roles: ['master', 'director', 'chairman', 'employee'] },
    { id: 'analytics', label: 'Analytics', roles: ['master', 'director', 'chairman'] },
    { id: 'whatsapp', label: 'WhatsApp', roles: ['master', 'director', 'chairman'] },
    { id: 'calendar', label: 'Calendar', roles: ['master', 'director', 'chairman', 'employee'] }
  ];
  
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`📊 Found ${usersSnapshot.docs.length} users in database\n`);

    // Test permissions for each user
    usersSnapshot.docs.forEach(doc => {
      const user = doc.data();
      console.log(`👤 User: ${user.name} (${user.role})`);
      
      const accessibleItems = navigationItems.filter(item => 
        item.roles.includes(user.role)
      );
      
      console.log(`   📱 Accessible navigation items (${accessibleItems.length}/10):`);
      accessibleItems.forEach(item => {
        console.log(`   ✅ ${item.label}`);
      });
      
      const restrictedItems = navigationItems.filter(item => 
        !item.roles.includes(user.role)
      );
      
      if (restrictedItems.length > 0) {
        console.log(`   🚫 Restricted items (${restrictedItems.length}/10):`);
        restrictedItems.forEach(item => {
          console.log(`   ❌ ${item.label}`);
        });
      }
      
      console.log(''); // Empty line for spacing
    });

    // Summary by role
    console.log('\n📋 PERMISSION SUMMARY BY ROLE:\n');
    
    const roles = ['master', 'director', 'chairman', 'employee'];
    roles.forEach(role => {
      const accessibleItems = navigationItems.filter(item => 
        item.roles.includes(role)
      );
      
      console.log(`🔑 ${role.toUpperCase()} (${accessibleItems.length}/10 items):`);
      console.log(`   ${accessibleItems.map(item => item.label).join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error testing sidebar permissions:', error);
  }
}

// Run the test
testSidebarPermissions().then(() => {
  console.log('✅ Sidebar permission test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});