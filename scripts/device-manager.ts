/**
 * Device and emulator management
 */

import { execSync, spawn } from 'child_process';
import type { Platform, iOSSimulator } from './types';
import {
  DEFAULT_ANDROID_AVD,
  DEFAULT_ANDROID_DEVICE,
  DEFAULT_ANDROID_API,
} from './constants';

/**
 * Check if a device/emulator is available
 */
export function checkDeviceAvailable(platform: Platform): boolean {
  try {
    if (platform === 'android') {
      const result = execSync('adb devices', { encoding: 'utf-8' });
      const lines = result.trim().split('\n').slice(1);
      const devices = lines.filter(
        line => line.trim() && (line.includes('device') || line.includes('emulator'))
      );
      return devices.length > 0;
    } else {
      const result = execSync('xcrun simctl list devices booted', { encoding: 'utf-8' });
      return result.includes('Booted');
    }
  } catch {
    return false;
  }
}

/**
 * Get list of available Android AVDs
 */
export function getAvailableAndroidAVDs(): string[] {
  try {
    const result = execSync('emulator -list-avds', { encoding: 'utf-8' });
    return result.trim().split('\n').filter(line => line.trim());
  } catch {
    return [];
  }
}

/**
 * Get list of available iOS simulators
 */
export function getAvailableiOSSimulators(): iOSSimulator[] {
  try {
    const result = execSync('xcrun simctl list devices available --json', {
      encoding: 'utf-8',
    });
    const data = JSON.parse(result);
    const simulators: iOSSimulator[] = [];
    
    for (const [runtime, devices] of Object.entries(data.devices)) {
      if (runtime.includes('iOS')) {
        for (const device of devices as any[]) {
          if (device.isAvailable) {
            simulators.push({
              name: device.name,
              udid: device.udid,
              runtime: runtime.replace('com.apple.CoreSimulator.SimRuntime.', ''),
            });
          }
        }
      }
    }
    return simulators;
  } catch {
    return [];
  }
}

/**
 * Start Android emulator
 */
export function startAndroidEmulator(avdName: string): void {
  console.log(`🚀 Starting Android emulator: ${avdName}...`);
  
  // Check if emulator is already running
  try {
    const result = execSync('adb devices', { encoding: 'utf-8', stdio: 'pipe' });
    const lines = result.trim().split('\n').slice(1);
    const devices = lines.filter(
      line => line.trim() && (line.includes('device') || line.includes('emulator'))
    );
    if (devices.length > 0) {
      console.log('✅ Android emulator is already running!');
      return;
    }
  } catch {
    // No devices found, continue to start
  }
  
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let retry = 1; retry <= maxRetries; retry++) {
    if (retry > 1) {
      console.log(`\n🔄 Retry attempt ${retry}/${maxRetries}...`);
      try {
        execSync('pkill -f "emulator.*-avd"', { stdio: 'pipe' });
        execSync('sleep 2');
      } catch {
        // Ignore if no processes to kill
      }
    }
    
    try {
      // Verify AVD exists
      const avdList = execSync('emulator -list-avds', { encoding: 'utf-8', stdio: 'pipe' });
      if (!avdList.includes(avdName)) {
        throw new Error(
          `AVD "${avdName}" not found. Available AVDs:\n${avdList}`
        );
      }
      
      console.log(`   Attempting to start emulator (attempt ${retry}/${maxRetries})...`);
      
      // Start emulator in background (detached)
      const emulatorProcess = spawn('emulator', ['-avd', avdName], {
        detached: true,
        stdio: 'ignore',
      });
      
      emulatorProcess.unref();
      
      // Wait a moment for emulator to initialize
      execSync('sleep 5');
      
      // Check if emulator process is still running
      try {
        execSync(`pgrep -f "emulator.*-avd.*${avdName}"`, { stdio: 'pipe' });
      } catch {
        throw new Error('Emulator process exited immediately');
      }
      
      // Wait for emulator to boot
      console.log('⏳ Waiting for emulator to boot (this may take 30-60 seconds)...');
      let attempts = 0;
      const maxAttempts = 90; // 3 minutes max
      
      while (attempts < maxAttempts) {
        try {
          // Check if boot is completed
          const result = execSync('adb shell getprop sys.boot_completed', {
            encoding: 'utf-8',
            stdio: 'pipe',
          });
          
          if (result.trim() === '1') {
            // Additional check: wait for package manager to be ready
            try {
              execSync('adb shell pm list packages', { stdio: 'pipe' });
              console.log('✅ Android emulator is ready!');
              return;
            } catch {
              // Package manager not ready yet, continue waiting
            }
          }
        } catch (error: any) {
          // Emulator not ready yet - this is normal during boot
        }
        
        // Check if emulator process is still running (every 10 attempts)
        if (attempts % 10 === 0) {
          try {
            execSync('pgrep -f "emulator.*-avd"', { stdio: 'pipe' });
          } catch {
            throw new Error('Emulator process stopped unexpectedly during boot');
          }
        }
        
        execSync('sleep 2');
        attempts++;
        if (attempts % 10 === 0) {
          console.log(`   Still waiting... (${attempts * 2}s)`);
        }
      }
      
      throw new Error('Emulator failed to boot within 3 minutes');
    } catch (error: any) {
      lastError = error;
      console.error(`\n❌ Attempt ${retry} failed:`);
      console.error(`   Error: ${error.message}`);
      
      if (retry < maxRetries) {
        console.log(`\n   Will retry in 3 seconds...`);
        execSync('sleep 3');
      }
    }
  }
  
  // All retries failed - provide detailed diagnostics
  console.error('\n❌ Failed to start emulator after 3 attempts.\n');
  console.error('Diagnostics:');
  console.error('─'.repeat(60));
  
  // Check if AVD exists
  try {
    const avdList = execSync('emulator -list-avds', { encoding: 'utf-8', stdio: 'pipe' });
    console.error(`\nAvailable AVDs:\n${avdList}`);
    if (!avdList.includes(avdName)) {
      console.error(`\n⚠️  AVD "${avdName}" is not in the list above.`);
    }
  } catch (error: any) {
    console.error(`\n⚠️  Could not list AVDs: ${error.message}`);
  }
  
  // Check ADB status
  try {
    const adbDevices = execSync('adb devices', { encoding: 'utf-8', stdio: 'pipe' });
    console.error(`\nADB devices:\n${adbDevices}`);
  } catch (error: any) {
    console.error(`\n⚠️  ADB error: ${error.message}`);
  }
  
  // Check emulator process
  try {
    const processes = execSync('ps aux | grep emulator | grep -v grep', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    if (processes.trim()) {
      console.error(`\nRunning emulator processes:\n${processes}`);
    } else {
      console.error(`\n⚠️  No emulator processes found running.`);
    }
  } catch {
    console.error(`\n⚠️  No emulator processes found.`);
  }
  
  // Check environment
  try {
    const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
    if (androidHome) {
      console.error(`\nANDROID_HOME: ${androidHome}`);
    } else {
      console.error(`\n⚠️  ANDROID_HOME or ANDROID_SDK_ROOT not set.`);
    }
  } catch {}
  
  console.error('\n' + '─'.repeat(60));
  console.error('\n💡 Suggestions:');
  console.error('   1. Start emulator manually: emulator -avd ' + avdName);
  console.error('   2. Check Android Studio > Tools > Device Manager');
  console.error('   3. Verify AVD exists: emulator -list-avds');
  console.error('   4. Check emulator logs for detailed errors');
  console.error('   5. Ensure ANDROID_HOME is set correctly');
  
  throw new Error(
    `Failed to start emulator after ${maxRetries} attempts. Last error: ${lastError?.message}`
  );
}

/**
 * Start iOS simulator
 */
export function startIOSSimulator(udid: string, name: string): void {
  console.log(`🚀 Starting iOS simulator: ${name}...`);
  execSync(`xcrun simctl boot ${udid}`, { stdio: 'inherit' });
  execSync('open -a Simulator', { stdio: 'inherit' });
  
  // Wait for simulator to be ready
  console.log('⏳ Waiting for simulator to boot...');
  execSync('sleep 5');
  console.log('✅ iOS simulator is ready!');
}

/**
 * Create Android AVD if it doesn't exist
 */
export function createAndroidAVD(): string {
  console.log('\n📦 No Android AVD found. Creating one...');
  console.log(`   Device: ${DEFAULT_ANDROID_DEVICE}`);
  console.log(`   API Level: ${DEFAULT_ANDROID_API}`);
  
  const systemImage = `system-images;android-${DEFAULT_ANDROID_API};google_apis;x86_64`;
  
  try {
    console.log('\n📥 Ensuring system image is installed...');
    execSync(`sdkmanager "${systemImage}"`, { stdio: 'inherit' });
    
    console.log(`\n🔧 Creating AVD: ${DEFAULT_ANDROID_AVD}...`);
    execSync(
      `echo "no" | avdmanager create avd -n ${DEFAULT_ANDROID_AVD} -k "${systemImage}" -d "${DEFAULT_ANDROID_DEVICE}"`,
      { stdio: 'inherit', shell: '/bin/bash' }
    );
    
    console.log(`✅ AVD created: ${DEFAULT_ANDROID_AVD}`);
    return DEFAULT_ANDROID_AVD;
  } catch (error) {
    console.error('\n❌ Failed to create AVD. Please create one manually:');
    console.error('   1. Open Android Studio');
    console.error('   2. Go to Tools > Device Manager');
    console.error('   3. Create a new Virtual Device (Pixel 3a with API 34 recommended)');
    throw new Error('Could not create Android AVD');
  }
}

/**
 * Ensure device/emulator is running for the platform
 */
export async function ensureDeviceRunning(platform: Platform): Promise<void> {
  console.log(`\n🔍 Checking for ${platform} devices...`);
  
  if (checkDeviceAvailable(platform)) {
    console.log(`✅ ${platform} device is already running!`);
    return;
  }
  
  console.log(`⚠️  No running ${platform} device found.`);
  
  if (platform === 'android') {
    let avds = getAvailableAndroidAVDs();
    
    if (avds.length === 0) {
      const newAvd = createAndroidAVD();
      avds = [newAvd];
    }
    
    console.log('\n📱 Available Android AVDs:');
    avds.forEach((avd, index) => {
      console.log(`   ${index + 1}. ${avd}`);
    });
    
    const avdToStart = avds[0];
    console.log(`\n   Using: ${avdToStart}`);
    
    startAndroidEmulator(avdToStart);
  } else {
    const simulators = getAvailableiOSSimulators();
    
    if (simulators.length === 0) {
      console.error('\n❌ No iOS simulators available.');
      console.error('   Please open Xcode and install iOS simulators:');
      console.error('   Xcode > Settings > Platforms > iOS > Download');
      throw new Error('No iOS simulators available');
    }
    
    console.log('\n📱 Available iOS Simulators:');
    simulators.slice(0, 5).forEach((sim, index) => {
      console.log(`   ${index + 1}. ${sim.name} (${sim.runtime})`);
    });
    
    // Prefer iPhone 15 Pro or similar
    let simToStart =
      simulators.find(s => s.name.includes('iPhone 15 Pro')) ||
      simulators.find(s => s.name.includes('iPhone')) ||
      simulators[0];
    
    console.log(`\n   Using: ${simToStart.name}`);
    
    startIOSSimulator(simToStart.udid, simToStart.name);
  }
}


