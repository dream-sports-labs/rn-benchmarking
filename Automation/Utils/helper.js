import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { logMessage, initializeLogFile } from './logger.js';
import { getBenchmarkDir, ERROR_LOG_FILE } from './config.js';
import { parseArgs } from './args.js';

export function runCommand(command, errorLogFile, options = {}) {
  try {
    execSync(command, {
      stdio: 'inherit',
      ...options
    });
    return true;
  } catch (error) {
    logMessage('ERROR', `Command failed: ${command}`, error, errorLogFile);
    process.exit(1);
  }
}

export function loadState(benchmarkDir) {
  const stateFile = path.join(benchmarkDir, 'benchmark-state.json');
  if (!fs.existsSync(stateFile)) {
    logMessage('ERROR', `State file not found at ${stateFile}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch (error) {
    logMessage('ERROR', `Error reading state file: ${stateFile}`, error);
    return null;
  }
}

export function updateState(benchmarkDir, updates) {
  const stateFile = path.join(benchmarkDir, 'benchmark-state.json');
  let currentState = {};

  if (fs.existsSync(stateFile)) {
    try {
      currentState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    } catch (error) {
      logMessage('ERROR', `Error reading state file: ${stateFile}`, error);
    }
  }

  const newState = { ...currentState, ...updates };

  try {
    fs.writeFileSync(stateFile, JSON.stringify(newState, null, 2));
    return newState;
  } catch (error) {
    logMessage('ERROR', `Error writing state file: ${stateFile}`, error);
    return null;
  }
}

export function generateReports(ERROR_LOG_FILE) {
  console.log(`\n=== Generating benchmark reports ===\n`);

  try {
    console.log('Running report generation...');
    const BASE_DIR = path.resolve(process.cwd(), '../');
    runCommand('yarn generate-reports', ERROR_LOG_FILE, { cwd: path.join(BASE_DIR, 'WebpageRevamped') });

    console.log('Running statistical data generation...');
    runCommand('yarn generate-statistical-data', ERROR_LOG_FILE, { cwd: path.join(BASE_DIR, 'WebpageRevamped') });

    console.log('\n=== Benchmark reports generated successfully ===\n');
    return true;
  } catch (error) {
    logMessage('ERROR', 'Error generating reports', error);
    return false;
  }
}

export function createStateFile(RN_VERSION, BENCHMARK_DIR) {
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

export function generateProject(RN_VERSION, BENCHMARK_DIR, BASE_DIR, ERROR_LOG_FILE) {
  logMessage('INFO', `\n=== Generating React Native ${RN_VERSION} project ===\n`);

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
        logMessage('INFO', `Created SampleApps directory at: ${sampleAppsDir}`);
      }

      logMessage('INFO', 'Initializing React Native project...');
      process.chdir(path.join(BASE_DIR, 'SampleApps'));
      const projectName = `RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`;
      logMessage('INFO', 'Creating React Native project...');
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
      createStateFile(RN_VERSION, BENCHMARK_DIR);

    } catch (error) {
      logMessage('ERROR', 'Error creating React Native project', error);
      throw error;
    }

    return updateState(BENCHMARK_DIR, { projectCreated: true });
  } else {
    logMessage('INFO', `Project directory already exists and contains a valid project.`);
    if (!fs.existsSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'))) {
      createStateFile(RN_VERSION, BENCHMARK_DIR);
    }

    return updateState(BENCHMARK_DIR, { projectCreated: true });
  }
}

export function applyTemplates(RN_VERSION, ERROR_LOG_FILE, TEMPLATE_DIR, BENCHMARK_DIR) {
  logMessage('INFO', `\n=== Applying benchmark templates ===\n`);

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

export function openTerminalWithCommand(command, title) {
  let terminalCommand;

  if (process.platform === 'darwin') {
    logMessage('INFO', 'Detected macOS, attempting to open terminal with command...');

    const escapedCommand = command
      .replace(/"/g, '\\"')       // Escape double quotes
      .replace(/'/g, "'\\''");    // Escape single quotes

    try {
      logMessage('INFO', 'Attempting to launch Terminal.app...');
      execSync(`osascript -e 'tell application "Terminal" to do script "${escapedCommand}"'`, {
        stdio: 'inherit'
      });
      logMessage('INFO', 'Successfully launched Terminal.app');
      return true;
    } catch (error) {
      logMessage('ERROR', 'Failed to open Terminal.app:', error);
      return false;
    }
  } else if (process.platform === 'win32') {
    terminalCommand = `start cmd.exe /k title ${title} ^& ${command}`;
  } else {
    terminalCommand = `gnome-terminal --title="${title}" -- bash -c "${command.replace(/"/g, '\\"')}; exec bash" || xterm -title "${title}" -e "${command.replace(/"/g, '\\"')}; exec bash"`;
  }

  if (process.platform !== 'darwin') {
    logMessage('INFO', `\nLaunching terminal with command: ${command}`);

    try {
      execSync(terminalCommand, {
        stdio: 'inherit',
        shell: true
      });

      return true;
    } catch (error) {
      logMessage('ERROR', `Failed to open terminal: ${error.message}`);
      return false;
    }
  }
}

export function makeScriptsExecutable(baseDir, scripts = ['android-benchmark.js', 'ios-benchmark.js']) {
  try {
    scripts.forEach(script => {
      const scriptPath = path.join(baseDir, script);
      if (fs.existsSync(scriptPath)) {
        fs.chmodSync(scriptPath, '755');
        logMessage('INFO', `Made ${script} executable`);
      } else {
        logMessage('WARN', `Script not found: ${script}`);
      }
    });
    return true;
  } catch (err) {
    logMessage('WARN', 'Could not make scripts executable:', err);
    return false;
  }
}

export function handleCompletedBenchmarks(state, benchmarkDir, errorLogFile) {
  if (!state.iosOldArchTested || !state.iosNewArchTested ||
    !state.androidOldArchTested || !state.androidNewArchTested) {
    return false;
  }

  if (!state.reportsGenerated) {
    logMessage('INFO', '\nAll benchmarks are complete. Generating reports...');
    const reportsGenerated = generateReports(errorLogFile);
    if (reportsGenerated) {
      updateState({
        reportsGenerated: true,
        endTime: new Date().toISOString()
      }, benchmarkDir);
    }
  } else {
    logMessage('INFO', '\nAll benchmarks are already completed and reports generated.');
  }

  return true;
}

export function launchBenchmarkIfNeeded(platform, state, baseDir, rnVersion, iterations) {
  const isTested = platform === 'ios'
    ? (state.iosOldArchTested && state.iosNewArchTested)
    : (state.androidOldArchTested && state.androidNewArchTested);

  if (isTested) {
    logMessage('INFO', `\n=== ${platform.toUpperCase()} benchmarks already completed ===\n`);
    return false;
  }

  logMessage('INFO', `\n=== Launching ${platform.toUpperCase()} benchmarking in a new terminal ===\n`);
  const command = `cd "${baseDir}" && ./platform/${platform}/${platform}-benchmark.js ${rnVersion} ${iterations}`;
  return openTerminalWithCommand(command, `RN ${rnVersion} ${platform.toUpperCase()} Benchmark`);
}

export async function initialize() {
  const { RN_VERSION, ITERATIONS } = parseArgs();
  const BENCHMARK_DIR = getBenchmarkDir(RN_VERSION);
  const BASE_DIR = process.cwd();
  const TEMPLATE_DIR = path.join(BASE_DIR, 'templates');
  logMessage('INFO', `BENCHMARK_DIR: ${BENCHMARK_DIR}`);
  initializeLogFile(ERROR_LOG_FILE);

  return {
    RN_VERSION,
    ITERATIONS,
    BENCHMARK_DIR,
    TEMPLATE_DIR,
    BASE_DIR
  };
}





