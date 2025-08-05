#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Incrypt OTA Update Script');
console.log('=============================\n');

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'build-preview':
    console.log('📱 Building preview APK with OTA support...');
    try {
      execSync('npx eas build --profile preview --platform android', { stdio: 'inherit' });
      console.log('✅ Preview build completed!');
      console.log('📦 APK is ready for demo distribution');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
    break;

  case 'publish-update':
    const message = args[1] || 'Demo update';
    console.log(`📤 Publishing OTA update: "${message}"...`);
    try {
      execSync(`npx eas update --branch demo --message "${message}"`, { stdio: 'inherit' });
      console.log('✅ Update published successfully!');
      console.log('🔄 Users will receive the update on next app launch');
    } catch (error) {
      console.error('❌ Update failed:', error.message);
      process.exit(1);
    }
    break;

  case 'demo-setup':
    console.log('🎯 Setting up demo with OTA updates...');
    console.log('\n📋 Steps:');
    console.log('1. Build preview APK: npm run ota:build');
    console.log('2. Share APK with judges');
    console.log('3. Make changes to your code');
    console.log('4. Publish update: npm run ota:update "Your update message"');
    console.log('5. Judges will get updates automatically!');
    break;

  default:
    console.log('📖 Usage:');
    console.log('  node scripts/ota-update.js build-preview    - Build demo APK');
    console.log('  node scripts/ota-update.js publish-update   - Publish OTA update');
    console.log('  node scripts/ota-update.js demo-setup       - Show demo instructions');
    console.log('\n💡 For hackathon demo:');
    console.log('  1. Run: npm run ota:build');
    console.log('  2. Share the APK with judges');
    console.log('  3. Make changes and run: npm run ota:update "New feature!"');
    console.log('  4. Judges get updates instantly!');
    break;
} 