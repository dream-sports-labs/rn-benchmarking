/**
 * Metro Bundler management
 */

import { execSync, spawn } from 'child_process';

let metroProcess: any = null;

/**
 * Start Metro bundler for the app
 */
export function startMetroBundler(appPath: string): void {
  console.log('🚇 Starting Metro bundler...');
  
  // Kill any existing Metro processes
  try {
    execSync('pkill -f "react-native.*start" || pkill -f "metro"', { stdio: 'pipe' });
    execSync('sleep 1');
  } catch {
    // No existing Metro processes
  }
  
  // Start Metro in background
  metroProcess = spawn('yarn', ['start', '--reset-cache'], {
    cwd: appPath,
    detached: true,
    stdio: 'pipe',
  });
  
  metroProcess.unref();
  
  // Wait for Metro to start
  console.log('⏳ Waiting for Metro to start...');
  execSync('sleep 5');
  
  // Verify Metro is running
  try {
    execSync('curl -s http://localhost:8081/status', { stdio: 'pipe' });
    console.log('✅ Metro bundler is running on port 8081');
  } catch {
    console.log('⚠️  Metro may not be ready yet, but continuing...');
  }
  
  // Set up ADB reverse for Android
  try {
    execSync('adb reverse tcp:8081 tcp:8081', { stdio: 'pipe' });
    console.log('✅ ADB reverse port forwarding set up');
  } catch (error: any) {
    console.log('⚠️  Could not set up ADB reverse (device may not be connected yet)');
  }
}

/**
 * Stop Metro bundler
 */
export function stopMetroBundler(): void {
  if (metroProcess) {
    try {
      process.kill(metroProcess.pid);
    } catch {
      // Process already dead
    }
  }
  
  // Kill any Metro processes
  try {
    execSync('pkill -f "react-native.*start" || pkill -f "metro"', { stdio: 'pipe' });
  } catch {
    // No processes to kill
  }
}

/**
 * Check if Metro is running
 */
export function isMetroRunning(): boolean {
  try {
    execSync('curl -s http://localhost:8081/status', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure Metro is running, start if not
 */
export function ensureMetroRunning(appPath: string): void {
  if (!isMetroRunning()) {
    startMetroBundler(appPath);
  }
}


