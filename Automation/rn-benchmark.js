#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { runCommand, updateState, generateReports } = require('./Utils/helper');

// Configuration
const RN_VERSION = process.argv[2]
if (!RN_VERSION) {
  console.error('Error: React Native version is required. Please provide a version number as the first argument.');
  process.exit(1);
}
const ITERATIONS = process.argv[3] || 10;
const BASE_DIR = process.cwd();
const BENCHMARK_DIR = path.join(BASE_DIR, 'SampleApps', `RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`);
console.log("BENCHMARK_DIR=============",BENCHMARK_DIR.toString())
const TEMPLATE_DIR = path.join(BASE_DIR, 'AutomationTemplate');

const ERROR_LOG_FILE = path.join(process.cwd(), 'benchmark-errors.log');

function initializeLogFile() {
  const timestamp = new Date().toISOString();
  fs.writeFileSync(ERROR_LOG_FILE, `=== Benchmark Errors Log Started at ${timestamp} ===\n\n`, 'utf8');
  console.log(`Error log initialized at: ${ERROR_LOG_FILE}`);
}

function logMessage(level, message, error = null) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}${error ? '\n' + formatError(error) : ''}`;
  
  if (level === 'ERROR') {
    console.error(logEntry);
    
    try {
      fs.appendFileSync(ERROR_LOG_FILE, logEntry + '\n\n', 'utf8');
    } catch (err) {
      console.error('Failed to write to error log file:', err);
    }
  } else if (level === 'INFO') {
    console.log(message);
  }
}

function formatError(error) {
  let formattedError = '';
  
  if (error instanceof Error) {
    formattedError += `Error: ${error.message}\n`;
    formattedError += `Stack: ${error.stack}\n`;
    
    for (const key in error) {
      if (Object.prototype.hasOwnProperty.call(error, key) && 
          key !== 'message' && 
          key !== 'stack') {
        formattedError += `${key}: ${JSON.stringify(error[key])}\n`;
      }
    }
  } else {
    formattedError = `${JSON.stringify(error, null, 2)}`;
  }
  
  return formattedError;
}

function createStateFile() {
  const stateFile = {
    version: RN_VERSION,
    projectCreated: false,
    templatesApplied: false,
    androidOldArchTested: false,
    androidNewArchTested: false,
    iosOldArchTested: false,
    iosNewArchTested: false,
    reportsGenerated: false,
    startTime: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(BENCHMARK_DIR, 'benchmark-state.json'), 
    JSON.stringify(stateFile, null, 2)
  );
  
  return stateFile;
}

function generateProject() {
  console.log(`\n=== Generating React Native ${RN_VERSION} project ===\n`);
  
  const hasValidProject = fs.existsSync(path.join(BENCHMARK_DIR, 'package.json'));
  
  if (!hasValidProject) {
    if (fs.existsSync(BENCHMARK_DIR)) {
      logMessage('INFO', `Removing incomplete project directory: ${BENCHMARK_DIR}`);
      fs.rmSync(BENCHMARK_DIR, { recursive: true, force: true });
    }
    
    try {
      // Create the SampleApps directory if it doesn't exist
      const sampleAppsDir = path.join(BASE_DIR, 'SampleApps');
      if (!fs.existsSync(sampleAppsDir)) {
        fs.mkdirSync(sampleAppsDir, { recursive: true });
        console.log(`Created SampleApps directory at: ${sampleAppsDir}`);
      }
      
      logMessage('INFO', 'Initializing React Native project...');
      process.chdir(path.join(BASE_DIR, 'SampleApps'));
      const projectName = `RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`;
      console.log('Creating React Native project...');
      runCommand(
        `npx --yes @react-native-community/cli@latest init ${projectName} --version ${RN_VERSION} --install-pods false`,
        ERROR_LOG_FILE,
        { 
          cwd: path.join(BASE_DIR, 'SampleApps'),
          env: {
            ...process.env,
            CI: 'true'
          }
        }
      );
      
      // After project creation, change back to BASE_DIR
      process.chdir(BASE_DIR);
      
      if (!fs.existsSync(path.join(BENCHMARK_DIR, 'package.json'))) {
        throw new Error('Failed to create React Native project. package.json not found after project initialization.');
      }
      logMessage('INFO', `React Native ${RN_VERSION} project created successfully.`);
      createStateFile();
      
    } catch (error) {
      logMessage('ERROR', 'Error creating React Native project', error);
      throw error;
    }
    
    return updateState(BENCHMARK_DIR, { projectCreated: true });
  } else {
    logMessage('INFO', `Project directory already exists and contains a valid project.`);
    if (!fs.existsSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'))) {
      createStateFile();
    }
    
    return updateState(BENCHMARK_DIR, { projectCreated: true });
  }
}

function applyTemplates() {
  console.log(`\n=== Applying benchmark templates ===\n`);
  
  fs.cpSync(
    path.join(TEMPLATE_DIR, 'src'), 
    path.join(BENCHMARK_DIR, 'src'), 
    { recursive: true }
  );
  
  fs.cpSync(
    path.join(TEMPLATE_DIR, 'scripts'), 
    path.join(BENCHMARK_DIR, 'scripts'), 
    { recursive: true }
  );
  
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, 'App.tsx'),
    path.join(BENCHMARK_DIR, 'App.tsx')
  );
  
  const packageName = `com.rn_${RN_VERSION.replace(/\./g, '_')}_benchmark`;
  const iosPackageName = `org.reactjs.native.example.RN-${RN_VERSION.replace(/\./g, '-')}-Benchmark`;
  
  updateState(BENCHMARK_DIR, {
    packageName,
    iosPackageName
  });
  
  const packageJsonPath = path.join(BENCHMARK_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    "test:android": `cd scripts/node && ts-node getNumbers.ts android ${packageName}`,
    "test:ios": `cd scripts/node && ts-node getNumbers.ts ios ${iosPackageName}`
  };
  
  packageJson.dependencies = {
    ...packageJson.dependencies,
    "react-native-fs": "^2.20.0",
    "@d11/marco": "^0.0.9"
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  runCommand('yarn install', ERROR_LOG_FILE, { cwd: BENCHMARK_DIR });
  
  return updateState(BENCHMARK_DIR, { templatesApplied: true });
}

function openTerminalWithCommand(command, title) {
  let terminalCommand;
  
  if (process.platform === 'darwin') {
    console.log('Detected macOS, attempting to open terminal with command...');
    
    const escapedCommand = command
      .replace(/"/g, '\\"')       // Escape double quotes
      .replace(/'/g, "'\\''");    // Escape single quotes
    
    try {
      console.log('Attempting to launch Terminal.app...');
      execSync(`osascript -e 'tell application "Terminal" to do script "${escapedCommand}"'`, {
        stdio: 'inherit'
      });
      console.log('Successfully launched Terminal.app');
      return true;
    } catch (error) {
      console.error('Failed to open Terminal.app:', error.message);
      return false;
    }
  } else if (process.platform === 'win32') {
    terminalCommand = `start cmd.exe /k title ${title} ^& ${command}`;
  } else {
    terminalCommand = `gnome-terminal --title="${title}" -- bash -c "${command.replace(/"/g, '\\"')}; exec bash" || xterm -title "${title}" -e "${command.replace(/"/g, '\\"')}; exec bash"`;
  }
  
  if (process.platform !== 'darwin') {
    console.log(`\nLaunching terminal with command: ${command}`);
    
    try {
      execSync(terminalCommand, {
        stdio: 'inherit',
        shell: true
      });
      
      return true;
    } catch (error) {
      console.error(`Failed to open terminal: ${error.message}`);
      return false;
    }
  }
}

async function main() {
  console.log(`\n=== React Native Benchmark Automation ===`);
  console.log(`Version: ${RN_VERSION}`);
  console.log(`Iterations: ${ITERATIONS}`);
  console.log("BENCHMARK_DIR=============",BENCHMARK_DIR.toString())
  
  initializeLogFile();
  
  try {
    let state;
    if (fs.existsSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'))) {
      state = JSON.parse(fs.readFileSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'), 'utf8'));
      logMessage('INFO', `Resuming benchmark for React Native ${state.version}`);
    } else {
      generateProject();
      state = JSON.parse(fs.readFileSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'), 'utf8'));
    }
    
    if (!state.templatesApplied) {
      applyTemplates();
      
      state = JSON.parse(fs.readFileSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'), 'utf8'));
    }
    
    try {
      fs.chmodSync(path.join(BASE_DIR, 'android-benchmark.js'), '755');
      fs.chmodSync(path.join(BASE_DIR, 'ios-benchmark.js'), '755');
    } catch (err) {
      console.warn('Could not make scripts executable:', err.message);
    }
    
    if (state.iosOldArchTested && state.iosNewArchTested && 
        state.androidOldArchTested && state.androidNewArchTested) {
      
      if (!state.reportsGenerated) {
        console.log('\nAll benchmarks are complete. Generating reports...');
        const reportsGenerated = generateReports(ERROR_LOG_FILE);
        if (reportsGenerated) {
          updateState({ 
            reportsGenerated: true,
            endTime: new Date().toISOString() 
          }, BENCHMARK_DIR);
        }
      } else {
        console.log('\nAll benchmarks are already completed and reports generated.');
      }
      
      return;
    }
    
    
    if (!state.iosOldArchTested || !state.iosNewArchTested) {
      console.log('\n=== Launching iOS benchmarking in a new terminal ===\n');
      const iosCommand = `cd "${BASE_DIR}" && ./ios-benchmark.js ${RN_VERSION} ${ITERATIONS}`;
      iosLaunched = openTerminalWithCommand(iosCommand, `RN ${RN_VERSION} iOS Benchmark`);
      
    } else {
      console.log('\n=== iOS benchmarks already completed ===\n');
    }
    
    if (!state.androidOldArchTested || !state.androidNewArchTested) {
      console.log('\n=== Launching Android benchmarking in a new terminal ===\n');
      const androidCommand = `cd "${BASE_DIR}" && ./android-benchmark.js ${RN_VERSION} ${ITERATIONS}`;
      androidLaunched = openTerminalWithCommand(androidCommand, `RN ${RN_VERSION} Android Benchmark`);
      
    } else {
      console.log('\n=== Android benchmarks already completed ===\n');
    }
    
  } catch (error) {
    logMessage('ERROR', 'Error in main execution', error);
    process.exit(1);
  }
}

main().catch(err => {
  logMessage('ERROR', 'Unhandled error in benchmark script', err);
  process.exit(1);
}); 