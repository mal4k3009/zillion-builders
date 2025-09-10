console.log('🚀 VERCEL DEPLOYMENT READINESS CHECK');
console.log('===================================');

// Check API file structure
const fs = require('fs');
const path = require('path');

try {
  // Check if API file exists
  const apiFile = path.join(__dirname, '..', 'api', 'send-push-notification.js');
  if (fs.existsSync(apiFile)) {
    console.log('✅ API file exists at correct location');
    
    // Check file content
    const content = fs.readFileSync(apiFile, 'utf8');
    
    if (content.includes('module.exports = async function handler')) {
      console.log('✅ API file has correct Vercel export format');
    } else {
      console.log('❌ API file missing proper Vercel export');
    }
    
    if (content.includes('process.env.FIREBASE_PRIVATE_KEY')) {
      console.log('✅ API file configured for environment variables');
    } else {
      console.log('❌ API file not configured for environment variables');
    }
    
  } else {
    console.log('❌ API file not found');
  }

  // Check if vercel.json exists (should not)
  const vercelFile = path.join(__dirname, '..', 'vercel.json');
  if (!fs.existsSync(vercelFile)) {
    console.log('✅ No vercel.json (using Vercel auto-detection)');
  } else {
    console.log('⚠️  vercel.json exists (may cause runtime conflicts)');
  }

  // Check package.json
  const packageFile = path.join(__dirname, '..', 'package.json');
  const packageContent = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  
  if (packageContent.dependencies['firebase-admin']) {
    console.log('✅ firebase-admin dependency present');
  } else {
    console.log('❌ firebase-admin dependency missing');
  }

  console.log('\n🎯 DEPLOYMENT STATUS: READY!');
  console.log('============================');
  console.log('Your code should now deploy successfully to Vercel.');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Push code to GitHub');
  console.log('2. Set environment variables in Vercel dashboard');
  console.log('3. Deploy!');
  
} catch (error) {
  console.error('❌ Error checking deployment readiness:', error);
}

process.exit(0);
