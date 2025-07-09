import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export function runCommand(command, ERROR_LOG_FILE, options = {}) {
    console.log(`> ${command}`);
    
    try {
      const result = execSync(command, { 
        stdio: options.stdio || 'inherit',
        ...options,
        maxBuffer: 10 * 1024 * 1024
      });
      
      return result;
    } catch (error) {
      console.error(`Command failed: ${command}`);
      console.error(error.message);
      fs.appendFileSync(ERROR_LOG_FILE, `[${new Date().toISOString()}] ERROR: ${command}\n${error.message}\n\n`, 'utf8');
      throw error;
    }
}

export function loadState(BENCHMARK_DIR) {
  const statePath = path.join(BENCHMARK_DIR, 'benchmark-state.json');
  if (fs.existsSync(statePath)) {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  }
  
  console.error('State file not found. Run the main script first to initialize the project.');
  process.exit(1);
}

export function updateState(BENCHMARK_DIR, updates) {
  console.log(`Updating state for ${BENCHMARK_DIR}`);
  const statePath = path.join(BENCHMARK_DIR, 'benchmark-state.json');
  const currentState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const newState = { ...currentState, ...updates };
  
  fs.writeFileSync(statePath, JSON.stringify(newState, null, 2));
  return newState;
}

export function getAvailableAndroidDevices() {
  console.log('\n=== Detecting Android Devices ===\n');
  
  try {
    // Get list of connected devices
    const devices = execSync('adb devices', { encoding: 'utf8' });
    const deviceLines = devices.split('\n').filter(line => line.trim() !== '' && !line.includes('List of devices'));
    
    // Extract device IDs
    const deviceIds = deviceLines.map(line => line.split('\t')[0].trim()).filter(id => id);
    
    if (deviceIds.length < 2) {
      console.warn(`Warning: Found only ${deviceIds.length} device(s). Two devices are recommended for parallel testing.`);
    }
    
    console.log(`Found ${deviceIds.length} connected Android devices:`);
    deviceIds.forEach((id, index) => {
      console.log(`  Device ${index + 1}: ${id}`);
    });
    
    return deviceIds;
  } catch (error) {
    console.error('Error detecting Android devices:', error);
    return [];
  }
}

export function generateReports(ERROR_LOG_FILE) {
  console.log(`\n=== Generating benchmark reports ===\n`);
  
  try {
    console.log('Running report generation...');
    const BASE_DIR = path.resolve(process.cwd(),'../');
    runCommand('yarn generate-reports', ERROR_LOG_FILE, { cwd: path.join(BASE_DIR, 'WebpageRevamped') });
    
    console.log('Running statistical data generation...');
    runCommand('yarn generate-statistical-data', ERROR_LOG_FILE, { cwd: path.join(BASE_DIR, 'WebpageRevamped') });
    
    console.log('\n=== Benchmark reports generated successfully ===\n');
    return true;
  } catch (error) {
    console.error('Error generating reports:', error);
    return false;
  }
}

export function getAvailableIOSDevices() {
  console.log('\n=== Detecting iOS Simulators ===\n');
  
  try {
    const simulatorsOutput = execSync('xcrun simctl list devices available -j', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const simulatorsData = JSON.parse(simulatorsOutput);
    
    const availableSimulators = [];
    const bootedSimulators = [];
    
    Object.keys(simulatorsData.devices).forEach(runtime => {
      if (!runtime.includes('iOS')) return;
      
      const devices = simulatorsData.devices[runtime];
      devices.forEach(device => {
        if (device.state === 'Booted') {
          bootedSimulators.push({
            udid: device.udid,
            name: device.name,
            runtime
          });
        } else if (device.isAvailable) {
          availableSimulators.push({
            udid: device.udid,
            name: device.name,
            runtime
          });
        }
      });
    });
    
    console.log(`Found ${bootedSimulators.length} booted simulator(s) and ${availableSimulators.length} available simulator(s)`);
    
    const simulatorIds = [];
    
    if (bootedSimulators.length > 0) {
      bootedSimulators.forEach((simulator, index) => {
        console.log(`Booted simulator ${index + 1}: ${simulator.name} (${simulator.udid})`);
        simulatorIds.push(simulator.udid);
      });
    }
    
    return simulatorIds;
  } catch (error) {
    console.error('Error detecting iOS simulators:', error);
    return [];
  }
}