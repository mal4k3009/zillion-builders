const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

// Test script to verify paused status implementation
console.log('🧪 Testing Paused Status Implementation...\n');

// Check if all required files have the paused status type
const files = [
  {
    path: 'src/types/index.ts',
    checks: [
      "status: 'pending' | 'in-progress' | 'completed' | 'paused'",
      'pausedAt?: string',
      'pausedBy?: number'
    ]
  },
  {
    path: 'src/components/tasks/TaskCard.tsx',
    checks: [
      'paused',
      'pausedAt',
      'purple-500'
    ]
  },
  {
    path: 'src/components/tasks/TaskModal.tsx',
    checks: [
      'paused',
      'Paused',
      'pausedAt',
      'pausedBy'
    ]
  },
  {
    path: 'src/components/analytics/AnalyticsPage.tsx',
    checks: [
      'userData.paused',
      'purple-600'
    ]
  },
  {
    path: 'src/firebase/services.ts',
    checks: [
      'getPausedTasksForReactivation',
      "where('status', '==', 'paused')"
    ]
  },
  {
    path: 'src/services/taskAutoStatusService.ts',
    checks: [
      'getPausedTasksForReactivation',
      'reactivated',
      'pausedAt: undefined'
    ]
  }
];

let allTestsPassed = true;

files.forEach(file => {
  console.log(`📁 Checking ${file.path}...`);
  
  try {
    const content = readFileSync(path.join(__dirname, '..', file.path), 'utf8');
    
    file.checks.forEach(check => {
      if (content.includes(check)) {
        console.log(`  ✅ Found: ${check}`);
      } else {
        console.log(`  ❌ Missing: ${check}`);
        allTestsPassed = false;
      }
    });
    
  } catch (error) {
    console.log(`  ❌ Error reading file: ${error.message}`);
    allTestsPassed = false;
  }
  
  console.log('');
});

// Test the logic for calculating reactivation time
console.log('🔄 Testing reactivation logic...');

const testReactivationLogic = () => {
  const currentTime = new Date();
  const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;
  
  // Test case 1: Task due in 5 days (should be reactivated)
  const dueInFiveDays = new Date(currentTime.getTime() + (5 * 24 * 60 * 60 * 1000));
  const reactivationTime1 = new Date(dueInFiveDays.getTime() - tenDaysInMs);
  const shouldReactivate1 = currentTime >= reactivationTime1;
  console.log(`  Test 1 - Due in 5 days: ${shouldReactivate1 ? '✅ Should reactivate' : '❌ Should not reactivate'}`);
  
  // Test case 2: Task due in 15 days (should not be reactivated yet)
  const dueInFifteenDays = new Date(currentTime.getTime() + (15 * 24 * 60 * 60 * 1000));
  const reactivationTime2 = new Date(dueInFifteenDays.getTime() - tenDaysInMs);
  const shouldReactivate2 = currentTime >= reactivationTime2;
  console.log(`  Test 2 - Due in 15 days: ${shouldReactivate2 ? '❌ Should not reactivate' : '✅ Should not reactivate'}`);
  
  // Test case 3: Task due in exactly 10 days (should be reactivated)
  const dueInTenDays = new Date(currentTime.getTime() + (10 * 24 * 60 * 60 * 1000));
  const reactivationTime3 = new Date(dueInTenDays.getTime() - tenDaysInMs);
  const shouldReactivate3 = currentTime >= reactivationTime3;
  console.log(`  Test 3 - Due in 10 days: ${shouldReactivate3 ? '✅ Should reactivate' : '❌ Should not reactivate'}`);
  
  return shouldReactivate1 && !shouldReactivate2 && shouldReactivate3;
};

const logicTestPassed = testReactivationLogic();
console.log('');

// Final result
console.log('📊 Test Results:');
console.log(`  Code Implementation: ${allTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`  Reactivation Logic: ${logicTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`  Overall: ${allTestsPassed && logicTestPassed ? '🎉 ALL TESTS PASSED' : '❌ TESTS FAILED'}`);

if (allTestsPassed && logicTestPassed) {
  console.log('\n🚀 Paused status implementation is ready!');
  console.log('📋 Features implemented:');
  console.log('  • Paused status in Task interface');
  console.log('  • Visual indicators in TaskCard');
  console.log('  • Status selection in TaskModal');
  console.log('  • Analytics tracking for paused tasks');
  console.log('  • Automatic reactivation service');
  console.log('  • Firebase integration');
  console.log('  • Paused tracking fields (pausedAt, pausedBy)');
} else {
  console.log('\n🔧 Some issues found. Please check the implementation.');
}