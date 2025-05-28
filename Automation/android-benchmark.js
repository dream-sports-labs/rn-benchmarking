#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { runCommand, loadState, updateState, getAvailableAndroidDevices, generateReports } = require('./Utils/helper');

const RN_VERSION = process.argv[2];
const ITERATIONS = process.argv[3] || 10;
const BASE_DIR = process.argv[4] || process.cwd();

if (!RN_VERSION) {
  console.error('Usage: ./android-benchmark.js <RN_VERSION> [ITERATIONS] [BASE_DIR]');
  process.exit(1);
}

const BENCHMARK_DIR = path.join(BASE_DIR, 'SampleApps',`RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`);
const ERROR_LOG_FILE = path.join(BASE_DIR, 'android-benchmark-errors.log');

fs.writeFileSync(ERROR_LOG_FILE, `=== Android Benchmark for RN ${RN_VERSION} Started at ${new Date().toISOString()} ===\n\n`, 'utf8');

function buildAndroidApps() {
  console.log('\n=== Building Android APKs ===\n');
  
  const apksDir = path.join(BASE_DIR, 'built_apks');
  if (!fs.existsSync(apksDir)) {
    fs.mkdirSync(apksDir, { recursive: true });
  }
  
  const oldArchApkPath = path.join(apksDir, `rn_${RN_VERSION}_old_arch.apk`);
  const newArchApkPath = path.join(apksDir, `rn_${RN_VERSION}_new_arch.apk`);
  
  const oldArchMetadataPath = path.join(apksDir, `rn_${RN_VERSION}_old_arch.json`);
  const newArchMetadataPath = path.join(apksDir, `rn_${RN_VERSION}_new_arch.json`);
  
  // Check if builds already exist
  const oldArchExists = fs.existsSync(oldArchApkPath) && fs.existsSync(oldArchMetadataPath);
  const newArchExists = fs.existsSync(newArchApkPath) && fs.existsSync(newArchMetadataPath);
  
  if (oldArchExists && newArchExists) {
    console.log('\n=== Existing Android builds found ===\n');
    console.log(`Old architecture APK exists at: ${oldArchApkPath}`);
    console.log(`New architecture APK exists at: ${newArchApkPath}`);
    console.log('Using existing builds...');
    
    const deviceIds = getAvailableAndroidDevices();
    if (deviceIds.length === 0) {
      console.error('No Android devices/emulators found. Please start at least two emulators.');
      throw new Error('No Android devices/emulators found');
    } else if (deviceIds.length === 1) {
      console.error('Only one Android device/emulator found. Please start at least two emulators.');
      throw new Error('Only one Android device/emulator found');
    }
    
    const oldArchDeviceId = deviceIds[0];
    const newArchDeviceId = deviceIds[1];
    
    updateState(BENCHMARK_DIR, {
      androidOldArchApkPath: oldArchApkPath,
      androidNewArchApkPath: newArchApkPath,
      androidOldArchMetadataPath: oldArchMetadataPath,
      androidNewArchMetadataPath: newArchMetadataPath,
      androidOldArchDeviceId: oldArchDeviceId,
      androidNewArchDeviceId: newArchDeviceId
    });
    
    return {
      oldArchBuildSuccessful: oldArchExists,
      newArchBuildSuccessful: newArchExists,
      oldArchMetadataPath,
      newArchMetadataPath,
      oldArchDeviceId,
      newArchDeviceId
    };
  }
  
  const deviceIds = getAvailableAndroidDevices();
  if (deviceIds.length === 0) {
    console.error('No Android devices/emulators found. Please start at least two emulators.');
    throw new Error('No Android devices/emulators found');
  } else if (deviceIds.length === 1) {
    console.error('Only one Android device/emulator found. Please start at least two emulators.');
    throw new Error('Only one Android device/emulator found');
  }
  
  const oldArchDeviceId = deviceIds[0];
  const newArchDeviceId = deviceIds[1];
  
  updateState(BENCHMARK_DIR, {
    androidOldArchApkPath: oldArchApkPath,
    androidNewArchApkPath: newArchApkPath,
    androidOldArchMetadataPath: oldArchMetadataPath,
    androidNewArchMetadataPath: newArchMetadataPath,
    androidOldArchDeviceId: oldArchDeviceId,
    androidNewArchDeviceId: newArchDeviceId
  });

  console.log('\n> Building Android Old Architecture APK\n');
  
  let oldArchBuildSuccessful = false;
  
  try {
    runCommand(`node ${path.join(BASE_DIR, 'build-android-app.js')} ${RN_VERSION} ${BENCHMARK_DIR} old`, ERROR_LOG_FILE);
    
    oldArchBuildSuccessful = fs.existsSync(oldArchApkPath) && fs.existsSync(oldArchMetadataPath);
    
    if (oldArchBuildSuccessful) {
      console.log(`Old architecture APK built successfully at: ${oldArchApkPath}`);
    } else {
      console.error('Old architecture build failed or APK/metadata not found');
    }
  } catch (error) {
    console.error('Error building old architecture:', error);
  }
  
  console.log('\n> Building Android New Architecture APK\n');
  
  let newArchBuildSuccessful = false;
  
  try {
    runCommand(`node ${path.join(BASE_DIR, 'build-android-app.js')} ${RN_VERSION} ${BENCHMARK_DIR} new`, ERROR_LOG_FILE);
    
    newArchBuildSuccessful = fs.existsSync(newArchApkPath) && fs.existsSync(newArchMetadataPath);
    
    if (newArchBuildSuccessful) {
      console.log(`New architecture APK built successfully at: ${newArchApkPath}`);
    } else {
      console.error('New architecture build failed or APK/metadata not found');
    }
  } catch (error) {
    console.error('Error building new architecture:', error);
  }
  
  return {
    oldArchBuildSuccessful,
    newArchBuildSuccessful,
    oldArchMetadataPath,
    newArchMetadataPath,
    oldArchDeviceId,
    newArchDeviceId
  };
}

async function runInstallAndTests(runOldArch = true, runNewArch = true) {
  console.log('\n=== Running Android Tests ===\n');
  
  const state = loadState(BENCHMARK_DIR);
  
  if (!state.androidOldArchMetadataPath || !state.androidNewArchMetadataPath) {
    console.error('Error: Missing metadata paths in state file. Cannot proceed with testing.');
    return;
  }
  
  const oldArchDeviceId = state.androidOldArchDeviceId;
  const newArchDeviceId = state.androidNewArchDeviceId;
  const oldArchMetadataPath = state.androidOldArchMetadataPath;
  const newArchMetadataPath = state.androidNewArchMetadataPath;
  
  const successfulInstalls = [];
  
  if (runOldArch) {
    console.log('\n=== Installing and launching old architecture app ===\n');
    
    try {
      runCommand(`node ${path.join(BASE_DIR, 'run-android-tests.js')} ${oldArchMetadataPath} ${oldArchDeviceId}`, ERROR_LOG_FILE);
      
      successfulInstalls.push({
        arch: 'old',
        deviceId: oldArchDeviceId
      });
    } catch (error) {
      console.error('Failed to install/launch old architecture app:', error.message);
    }
  }
  
  if (runNewArch) {
    console.log('\n=== Installing and launching new architecture app ===\n');
    
    try {
      runCommand(`node ${path.join(BASE_DIR, 'run-android-tests.js')} ${newArchMetadataPath} ${newArchDeviceId}`, ERROR_LOG_FILE);
      
      successfulInstalls.push({
        arch: 'new',
        deviceId: newArchDeviceId
      });
    } catch (error) {
      console.error('Failed to install/launch new architecture app:', error.message);
    }
  }
  
  console.log(`\n=== Installations completed: ${successfulInstalls.length} successful ===\n`);
  
  if (successfulInstalls.length === 0) {
    console.error('No installations were successful. Cannot run tests.');
    return;
  }
  
  console.log('\n=== Running benchmark tests ===\n');
    
  const benchmarkDir = `SampleApps/RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`;
  const command = `cd ${benchmarkDir} && yarn test:android ${ITERATIONS} ${oldArchDeviceId} ${newArchDeviceId}`;
  
  console.log(`\n=== Running: ${command} ===\n`);
  
  try {
    runCommand(command, ERROR_LOG_FILE);
    
    console.log('\n=== Tests completed successfully ===\n');
    
    updateState(BENCHMARK_DIR, {
      androidOldArchTested: true,
      androidNewArchTested: true
    });
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

async function main() {
  console.log(`\n=== Android Benchmark for React Native ${RN_VERSION} (${ITERATIONS} iterations) ===\n`);
  
  try {
    const initialState = loadState(BENCHMARK_DIR);
    
    if (!initialState.projectCreated || !initialState.templatesApplied) {
      console.error('Project not properly initialized. Run the main script first.');
      process.exit(1);
    }
    
    const buildResults = buildAndroidApps();
    
    runInstallAndTests(buildResults.oldArchBuildSuccessful, buildResults.newArchBuildSuccessful);
    generateReports(ERROR_LOG_FILE);
    
    console.log('\n=== Android benchmarking completed ===\n');
    
  } catch (error) {
    console.error('Error in Android benchmarking:', error);
    fs.appendFileSync(ERROR_LOG_FILE, `[${new Date().toISOString()}] FATAL ERROR: ${error.message}\n${error.stack}\n\n`, 'utf8');
    process.exit(1);
  }
}

main(); 