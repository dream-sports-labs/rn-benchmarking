#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { runCommand, loadState, updateState, getAvailableIOSDevices, generateReports } = require('./Utils/helper');

const RN_VERSION = process.argv[2];
const ITERATIONS = process.argv[3] || 10;
const BASE_DIR = process.argv[4] || process.cwd();

if (!RN_VERSION) {
  console.error('Usage: ./ios-benchmark.js <RN_VERSION> [ITERATIONS] [BASE_DIR]');
  process.exit(1);
}

const BENCHMARK_DIR = path.join(BASE_DIR, 'SampleApps',`RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`);
const ERROR_LOG_FILE = path.join(BASE_DIR, 'ios-benchmark-errors.log');

fs.writeFileSync(ERROR_LOG_FILE, `=== iOS Benchmark for RN ${RN_VERSION} Started at ${new Date().toISOString()} ===\n\n`, 'utf8');

function buildIOSApps() {
  console.log('\n=== Building iOS Apps ===\n');
  
  const appsDir = path.join(BASE_DIR, 'built_apps_ios');
  if (!fs.existsSync(appsDir)) {
    fs.mkdirSync(appsDir, { recursive: true });
  }
  
  const oldArchAppPath = path.join(appsDir, `rn_${RN_VERSION}_old_arch.app`);
  const newArchAppPath = path.join(appsDir, `rn_${RN_VERSION}_new_arch.app`);
  
  const oldArchMetadataPath = path.join(appsDir, `rn_${RN_VERSION}_old_arch.json`);
  const newArchMetadataPath = path.join(appsDir, `rn_${RN_VERSION}_new_arch.json`);
  
  // Check if builds already exist
  const oldArchExists = fs.existsSync(oldArchAppPath) && fs.existsSync(oldArchMetadataPath);
  const newArchExists = fs.existsSync(newArchAppPath) && fs.existsSync(newArchMetadataPath);
  
  if (oldArchExists && newArchExists) {
    console.log('\n=== Existing iOS builds found ===\n');
    console.log(`Old architecture app exists at: ${oldArchAppPath}`);
    console.log(`New architecture app exists at: ${newArchAppPath}`);
    console.log('Using existing builds...');
    
    const deviceIds = getAvailableIOSDevices();
    if (deviceIds.length === 0) {
      console.error('No iOS devices/simulators found. Please start at least two simulators.');
      throw new Error('No iOS devices/simulators found');
    } else if (deviceIds.length === 1) {
      console.error('Only one iOS device/simulator found. Please start at least two simulators.');
      throw new Error('Only one iOS device/simulator found');
    }
    
    const oldArchSimId = deviceIds[0];
    const newArchSimId = deviceIds[1];
    
    updateState(BENCHMARK_DIR, {
      iosOldArchAppPath: oldArchAppPath,
      iosNewArchAppPath: newArchAppPath,
      iosOldArchMetadataPath: oldArchMetadataPath,
      iosNewArchMetadataPath: newArchMetadataPath,
      iosOldArchSimulatorId: oldArchSimId,
      iosNewArchSimulatorId: newArchSimId
    });
    
    return {
      oldArchBuildSuccessful: oldArchExists,
      newArchBuildSuccessful: newArchExists,
      oldArchMetadataPath,
      newArchMetadataPath
    };
  }
  
  const deviceIds = getAvailableIOSDevices();

  if (deviceIds.length === 0) {
    console.error('No iOS devices/emulators found. Please start at least two emulators.');
    throw new Error('No iOS devices/emulators found');
  } else if (deviceIds.length === 1) {
    console.error('Only one iOS device/emulator found. Please start at least two emulators.');
    throw new Error('Only one iOS device/emulator found');
  }
  
  const oldArchSimId = deviceIds[0];
  const newArchSimId = deviceIds[1];
  
  updateState(BENCHMARK_DIR, {
    iosOldArchAppPath: oldArchAppPath,
    iosNewArchAppPath: newArchAppPath,
    iosOldArchMetadataPath: oldArchMetadataPath,
    iosNewArchMetadataPath: newArchMetadataPath,
    iosOldArchSimulatorId: oldArchSimId,
    iosNewArchSimulatorId: newArchSimId
  });
  
  console.log('\n> Building iOS Old Architecture App\n');
  
  let oldArchBuildSuccessful = false;
  
  try {
    runCommand(`node ${path.join(BASE_DIR, 'build-ios-app.js')} ${RN_VERSION} ${BENCHMARK_DIR} old ${oldArchSimId || ''}`, ERROR_LOG_FILE);
    
    oldArchBuildSuccessful = fs.existsSync(oldArchAppPath) && fs.existsSync(oldArchMetadataPath);
    
    if (oldArchBuildSuccessful) {
      console.log(`Old architecture iOS app built successfully at: ${oldArchAppPath}`);
    } else {
      console.error('Old architecture iOS build failed or app/metadata not found');
    }
  } catch (error) {
    console.error('Error building old architecture for iOS:', error);
  }
  
  console.log('\n> Building iOS New Architecture App\n');
  
  let newArchBuildSuccessful = false;
  
  try {
    runCommand(`node ${path.join(BASE_DIR, 'build-ios-app.js')} ${RN_VERSION} ${BENCHMARK_DIR} new ${newArchSimId || ''}`, ERROR_LOG_FILE);
    
    newArchBuildSuccessful = fs.existsSync(newArchAppPath) && fs.existsSync(newArchMetadataPath);
    
    if (newArchBuildSuccessful) {
      console.log(`New architecture iOS app built successfully at: ${newArchAppPath}`);
    } else {
      console.error('New architecture iOS build failed or app/metadata not found');
    }
  } catch (error) {
    console.error('Error building new architecture for iOS:', error);
  }
  
  return {
    oldArchBuildSuccessful,
    newArchBuildSuccessful,
    oldArchMetadataPath,
    newArchMetadataPath
  };
}

function runInstallAndTestsIOS(runOldArch = true, runNewArch = true) {
  console.log('\n=== Running iOS Tests ===\n');
  
  const state = loadState(BENCHMARK_DIR);
  
  if (!state.iosOldArchMetadataPath || !state.iosNewArchMetadataPath) {
    console.error('Error: Missing iOS metadata paths in state file. Cannot proceed with testing.');
    return;
  }
  
  const oldArchMetadataPath = state.iosOldArchMetadataPath;
  const newArchMetadataPath = state.iosNewArchMetadataPath;
  const oldArchSimulatorId = state.iosOldArchSimulatorId;
  const newArchSimulatorId = state.iosNewArchSimulatorId;
  
  const successfulInstalls = [];
  
  if (runOldArch) {
    console.log('\n=== Installing and launching iOS old architecture app ===\n');
    
    try {
      runCommand(`node ${path.join(BASE_DIR, 'run-ios-tests.js')} ${oldArchMetadataPath} ${oldArchSimulatorId || ''}`, ERROR_LOG_FILE);
      console.log('Old architecture app installed and launched successfully');
      
      try {
        const metadata = JSON.parse(fs.readFileSync(oldArchMetadataPath, 'utf8'));
        successfulInstalls.push({
          arch: 'old',
          simulatorId: metadata.simulatorId,
          bundleId: metadata.bundleId
        });
      } catch (error) {
        console.error('Failed to read iOS metadata after successful installation:', error.message);
      }
    } catch (error) {
      console.error('Failed to install/launch old architecture app:', error.message);
    }
  }
  
  if (runNewArch) {
    console.log('\n=== Installing and launching iOS new architecture app ===\n');
    
    try {
      runCommand(`node ${path.join(BASE_DIR, 'run-ios-tests.js')} ${newArchMetadataPath} ${newArchSimulatorId || ''}`);
      console.log('New architecture app installed and launched successfully');
      
      try {
        const metadata = JSON.parse(fs.readFileSync(newArchMetadataPath, 'utf8'));
        successfulInstalls.push({
          arch: 'new',
          simulatorId: metadata.simulatorId,
          bundleId: metadata.bundleId
        });
      } catch (error) {
        console.error('Failed to read iOS metadata after successful installation:', error.message);
      }
    } catch (error) {
      console.error('Failed to install/launch new architecture app:', error.message);
    }
  }
  
  console.log(`\n=== iOS installations completed: ${successfulInstalls.length} successful ===\n`);
  
  if (successfulInstalls.length === 0) {
    console.error('No iOS installations were successful. Cannot run tests.');
    return;
  }
  
  console.log('\n=== Running iOS benchmark tests ===\n');
  
  const benchmarkDir = `SampleApps/RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`;
  const simulatorIdArgs = `${oldArchSimulatorId || ''} ${newArchSimulatorId || ''}`;
  const command = `cd ${benchmarkDir} && yarn test:ios ${ITERATIONS} ${simulatorIdArgs}`;
  
  console.log(`\n=== Running: ${command} ===\n`);
  
  try {
    runCommand(command);
    
    console.log('\n=== iOS tests completed successfully ===\n');
    
    updateState(BENCHMARK_DIR, {
      iosOldArchTested: true,
      iosNewArchTested: true
    });
    
  } catch (error) {
    console.error('Error running iOS tests:', error);
  }
}

async function main() {
  console.log(`\n=== iOS Benchmark for React Native ${RN_VERSION} (${ITERATIONS} iterations) ===\n`);
  
  try {
    const initialState = loadState(BENCHMARK_DIR);
    
    if (!initialState.projectCreated || !initialState.templatesApplied) {
      console.error('Project not properly initialized. Run the main script first.');
      process.exit(1);
    }
    
    const buildResults = buildIOSApps();
    
    runInstallAndTestsIOS(buildResults.oldArchBuildSuccessful, buildResults.newArchBuildSuccessful);
    
    generateReports(ERROR_LOG_FILE);
    
    console.log('\n=== iOS benchmarking completed ===\n');
    
  } catch (error) {
    console.error('Error in iOS benchmarking:', error);
    fs.appendFileSync(ERROR_LOG_FILE, `[${new Date().toISOString()}] FATAL ERROR: ${error.message}\n${error.stack}\n\n`, 'utf8');
    process.exit(1);
  }
}

main(); 