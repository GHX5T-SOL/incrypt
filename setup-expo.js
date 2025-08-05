#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Incrypt Expo Setup');
console.log('=====================\n');

console.log('📋 To get your Expo Project ID:');
console.log('1. Go to https://expo.dev');
console.log('2. Sign in to your account');
console.log('3. Click "Create a Project"');
console.log('4. Choose "Blank" template');
console.log('5. Name it "Incrypt"');
console.log('6. Copy the Project ID (looks like: 12345678-1234-1234-1234-123456789012)\n');

console.log('🔧 After getting your Project ID:');
console.log('1. Open app.json');
console.log('2. Replace "YOUR_EXPO_PROJECT_ID_HERE" with your actual Project ID');
console.log('3. Save the file\n');

console.log('📱 Your assets are ready:');
console.log('✅ icon.png');
console.log('✅ splash.png');
console.log('✅ adaptive-icon.png');
console.log('✅ favicon.png');
console.log('✅ logo-neon.png');
console.log('✅ logo-white.png');
console.log('✅ logo-primary.png\n');

console.log('🚀 Once you update the Project ID, you can run:');
console.log('npx eas build --profile development --platform android');
console.log('\nThis will create your first Android APK!');

// Check if app.json exists and show current project ID
const appJsonPath = path.join(__dirname, 'app.json');
if (fs.existsSync(appJsonPath)) {
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const currentProjectId = appJson.expo?.extra?.eas?.projectId;
    
    if (currentProjectId && currentProjectId !== 'YOUR_EXPO_PROJECT_ID_HERE') {
      console.log('\n✅ Current Project ID:', currentProjectId);
    } else {
      console.log('\n⚠️  Project ID needs to be updated in app.json');
    }
  } catch (error) {
    console.log('\n❌ Error reading app.json:', error.message);
  }
} 