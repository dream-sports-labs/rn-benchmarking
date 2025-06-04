import { execSync, ExecSyncOptions } from 'child_process';
import fs from 'fs';
import path from 'path';
import { logMessage, initializeLogFile } from './logger';
import { getBenchmarkDir, getErrorLogFile } from './config';
import { parseArgs } from './args';
import { StateFile } from './types';

type ExecOptions = Omit<ExecSyncOptions, 'shell'> & { shell?: string };

export function runCommand(command: string, errorLogFile: string, options: ExecOptions = {}): boolean {
  try {
    execSync(command, {
      stdio: 'inherit',
      encoding: 'utf-8',
      shell: '/bin/bash',
      ...options
    });
    return true;
  } catch (error) {
    logMessage('ERROR', `Command failed: ${command}`, error, errorLogFile);
    process.exit(1);
  }
}

export function loadState(benchmarkDir: string): StateFile | null {
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

export function updateState(benchmarkDir: string, updates: Partial<StateFile>): StateFile | null {
  const stateFile = path.join(benchmarkDir, 'benchmark-state.json');
  let currentState: StateFile = {} as StateFile;

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

export function generateReports(ERROR_LOG_FILE: string): boolean {
  console.log(`\n=== Generating benchmark reports ===\n`);

  try {
    console.log('Running report generation...');
    const BASE_DIR = path.resolve(__dirname, '..', '..');
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

export function createStateFile(RN_VERSION: string, BENCHMARK_DIR: string): StateFile {
  const stateFile: StateFile = {
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

export function generateProject(RN_VERSION: string, BENCHMARK_DIR: string, BASE_DIR: string, ERROR_LOG_FILE: string): StateFile | null {
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

export function applyTemplates(RN_VERSION: string, ERROR_LOG_FILE: string, TEMPLATE_DIR: string, BENCHMARK_DIR: string): StateFile | null {
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

export function openTerminalWithCommand(command: string, title: string): boolean {
  let terminalCommand: string;

  if (process.platform === 'darwin') {
    logMessage('INFO', 'Detected macOS, attempting to open terminal with command...');

    const escapedCommand = command
      .replace(/"/g, '\\"')       // Escape double quotes
      .replace(/'/g, "'\\''");    // Escape single quotes

    try {
      logMessage('INFO', 'Attempting to launch Terminal.app...');
      execSync(`osascript -e 'tell application "Terminal" to do script "${escapedCommand}"'`, {
        stdio: 'inherit',
        encoding: 'utf-8'
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

  if (process.platform !== ('darwin' as NodeJS.Platform)) {
    logMessage('INFO', `\nLaunching terminal with command: ${command}`);

    try {
      execSync(terminalCommand, {
        stdio: 'inherit',
        encoding: 'utf-8',
        shell: '/bin/bash'
      });

      return true;
    } catch (error) {
      logMessage('ERROR', `Failed to open terminal: ${error.message}`);
      return false;
    }
  }
  return false;
}

export function makeScriptsExecutable(baseDir: string, scripts: string[] = ['android-benchmark.ts', 'ios-benchmark.ts']): void {
  const platformPaths = {
    'android-benchmark.ts': './platform/android',
    'ios-benchmark.ts': './platform/ios'
  };

  scripts.forEach(script => {
    const platformDir = platformPaths[script as keyof typeof platformPaths];
    const scriptPath = path.join(baseDir, platformDir, script);
    
    if (fs.existsSync(scriptPath)) {
      fs.chmodSync(scriptPath, '755');
    }
  });
}

export function handleCompletedBenchmarks(state: StateFile, benchmarkDir: string, errorLogFile: string): void {
  if (state.androidOldArchTested && state.androidNewArchTested && state.iosOldArchTested && state.iosNewArchTested) {
    logMessage('INFO', '\n=== All benchmarks completed successfully ===\n');
    generateReports(errorLogFile);
    updateState(benchmarkDir, { reportsGenerated: true });
  }
}

export function launchBenchmarkIfNeeded(platform: 'android' | 'ios', state: StateFile, baseDir: string, rnVersion: string, iterations: number): void {
  const arch = state[`${platform}OldArchTested`] ? 'new' : 'old';
  const scriptPath = path.join(baseDir, `./platform/${platform}/${platform}-benchmark.ts`);
  
  if (fs.existsSync(scriptPath)) {
    openTerminalWithCommand(
      `ts-node ${scriptPath} ${rnVersion} ${iterations} ${arch}`,
      `${platform.toUpperCase()} ${arch.toUpperCase()} Architecture Benchmark`
    );
  }
}

export interface InitializeResult {
  RN_VERSION: string;
  ITERATIONS: number;
  BENCHMARK_DIR: string;
  TEMPLATE_DIR: string;
  BASE_DIR: string;
}

export function initialize(): InitializeResult {
  const { RN_VERSION, ITERATIONS } = parseArgs();
  const BENCHMARK_DIR = getBenchmarkDir(RN_VERSION);
  const TEMPLATE_DIR = path.join(process.cwd(), 'templates');
  const BASE_DIR = process.cwd();
  initializeLogFile(getErrorLogFile());

  return {
    RN_VERSION,
    ITERATIONS,
    BENCHMARK_DIR,
    TEMPLATE_DIR,
    BASE_DIR
  };
} 