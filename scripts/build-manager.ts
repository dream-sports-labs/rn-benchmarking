/**
 * Build management for Android and iOS
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { Platform, Architecture, BuildType } from './types';
import { ensureMetroRunning, stopMetroBundler } from './metro-manager';

/**
 * Configure architecture in gradle.properties (Android) or prepare for iOS
 */
export function configureArchitecture(
  appPath: string,
  architecture: Architecture,
  platform: Platform
): void {
  const newArchEnabled = architecture === 'newarch';
  
  if (platform === 'android') {
    const gradlePropsPath = path.join(appPath, 'android', 'gradle.properties');
    if (fs.existsSync(gradlePropsPath)) {
      let content = fs.readFileSync(gradlePropsPath, 'utf-8');
      content = content.replace(/newArchEnabled=.*/, `newArchEnabled=${newArchEnabled}`);
      fs.writeFileSync(gradlePropsPath, content);
    }
  }
  // iOS configuration is done via pod install command
}

/**
 * Build Android app
 */
function buildAndroidApp(
  appPath: string,
  architecture: Architecture,
  buildType: BuildType,
  packageName: string
): void {
  configureArchitecture(appPath, architecture, 'android');
  
  if (!fs.existsSync(path.join(appPath, 'android', 'app', 'build.gradle'))) {
    throw new Error('Android project not found. Make sure the app was created correctly.');
  }
  
  const buildCommand = buildType === 'release' 
    ? './gradlew assembleRelease'
    : './gradlew assembleDebug';
  
  execSync(buildCommand, { cwd: path.join(appPath, 'android'), stdio: 'inherit' });
  
  // Install the APK
  const apkPath = buildType === 'release'
    ? path.join(appPath, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')
    : path.join(appPath, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  
  if (fs.existsSync(apkPath)) {
    // Uninstall existing app first to avoid conflicts
    try {
      execSync(`adb uninstall ${packageName}`, { stdio: 'pipe' });
    } catch {
      // Ignore if app doesn't exist
    }
    execSync(`adb install -r ${apkPath}`, { stdio: 'inherit' });
    console.log(`✅ Installed ${buildType} APK`);
    
    // Ensure ADB reverse is set up for debug builds
    if (buildType === 'debug') {
      try {
        execSync('adb reverse tcp:8081 tcp:8081', { stdio: 'pipe' });
      } catch {
        // Ignore if already set up
      }
    }
  } else {
    throw new Error(`APK not found at ${apkPath}`);
  }
}

/**
 * Build iOS app
 */
function buildIOSApp(
  appPath: string,
  architecture: Architecture,
  buildType: BuildType
): void {
  const newArchEnabled = architecture === 'newarch' ? '1' : '0';
  
  // Check if Gemfile exists and install gems first
  const gemfilePath = path.join(appPath, 'Gemfile');
  if (fs.existsSync(gemfilePath)) {
    console.log('💎 Installing Ruby gems...');
    try {
      execSync('bundle install', { cwd: appPath, stdio: 'inherit' });
      console.log('✅ Ruby gems installed');
    } catch (error: any) {
      console.log('⚠️  bundle install failed, trying without bundle...');
      console.log(`   Error: ${error.message}`);
    }
  } else {
    console.log('⚠️  No Gemfile found. CocoaPods may not be available via bundle.');
  }
  
  // Install pods
  console.log('📦 Installing CocoaPods dependencies...');
  if (fs.existsSync(gemfilePath)) {
    try {
      execSync(
        `cd ios && export NO_FLIPPER=1 && RCT_NEW_ARCH_ENABLED=${newArchEnabled} bundle exec pod install`,
        { cwd: appPath, stdio: 'inherit' }
      );
    } catch (error: any) {
      console.error('❌ Failed to install pods with bundle exec');
      console.error('   Trying with pod directly...');
      execSync(
        `cd ios && export NO_FLIPPER=1 && RCT_NEW_ARCH_ENABLED=${newArchEnabled} pod install`,
        { cwd: appPath, stdio: 'inherit' }
      );
    }
  } else {
    execSync(
      `cd ios && export NO_FLIPPER=1 && RCT_NEW_ARCH_ENABLED=${newArchEnabled} pod install`,
      { cwd: appPath, stdio: 'inherit' }
    );
  }
  
  // Build and run
  const buildCommand = buildType === 'release'
    ? 'yarn ios --configuration Release --simulator'
    : 'yarn ios --simulator';
  
  try {
    execSync(buildCommand, { cwd: appPath, stdio: 'inherit' });
    console.log(`✅ Built and installed ${buildType} iOS app`);
  } catch (error: any) {
    console.error('\n❌ iOS build failed');
    console.error('Error details:', error.message);
    
    console.error('\n🔍 Common causes of iOS build failures:');
    console.error('  • Code signing issues (error code 70)');
    console.error('  • Missing provisioning profiles');
    console.error('  • Xcode configuration problems');
    console.error('  • Missing dependencies or build settings');
    console.error('  • Simulator not properly set up\n');
    
    // Try to diagnose
    console.error('📋 Diagnostics:');
    try {
      const xcodeVersion = execSync('xcodebuild -version', { encoding: 'utf-8', stdio: 'pipe' });
      console.error(`  Xcode version: ${xcodeVersion.trim()}`);
    } catch {
      console.error('  ⚠️  Could not get Xcode version');
    }
    
    try {
      const simulators = execSync('xcrun simctl list devices available', {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      const booted = simulators.includes('Booted');
      console.error(`  Simulator status: ${booted ? 'Running' : 'Not running'}`);
    } catch {
      console.error('  ⚠️  Could not check simulator status');
    }
    
    console.error('\n💡 Troubleshooting steps:');
    const iosDir = path.join(appPath, 'ios');
    const workspaceFiles = fs.readdirSync(iosDir).filter(f => f.endsWith('.xcworkspace'));
    if (workspaceFiles.length > 0) {
      console.error(`  1. Open the project in Xcode:`);
      console.error(`     open ${path.join(iosDir, workspaceFiles[0])}`);
    }
    console.error('  2. Check code signing settings in Xcode (use "Automatically manage signing" for simulator)');
    console.error('  3. Ensure simulator is running: open -a Simulator');
    console.error('  4. Try building from Xcode to see detailed errors');
    console.error('  5. Run: npx react-native doctor');
    console.error('  6. Clean build: cd ios && xcodebuild clean');
    
    throw new Error(`iOS build failed. Please check Xcode settings and try building manually.`);
  }
}

/**
 * Build app for the specified platform, architecture, and build type
 */
export function buildApp(
  appPath: string,
  platform: Platform,
  architecture: Architecture,
  buildType: BuildType,
  packageName: string
): void {
  console.log(`\n🔨 Building ${platform} ${architecture} ${buildType}...`);
  
  // Ensure Metro is running for debug builds
  if (buildType === 'debug') {
    ensureMetroRunning(appPath);
  } else {
    stopMetroBundler();
  }
  
  if (platform === 'android') {
    buildAndroidApp(appPath, architecture, buildType, packageName);
  } else {
    buildIOSApp(appPath, architecture, buildType);
  }
}


