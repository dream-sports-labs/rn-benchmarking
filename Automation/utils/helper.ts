import { execSync, ExecSyncOptions } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Logger } from './logger';
import { getBenchmarkDir } from './config';
import { BenchmarkStateFile, InitializeResult } from './types';
import { parseIterationArgs } from './args';

type ExecOptions = Omit<ExecSyncOptions, 'shell'> & { shell?: string };

export function runCommand(command: string, options: ExecOptions = {}): boolean {
  const logger = new Logger();

  try {
    execSync(command, {
      stdio: 'inherit',
      encoding: 'utf-8',
      shell: '/bin/bash',
      ...options
    });
    return true;
  } catch (error) {
    logger.error(`Command failed: ${command}`, error);
    process.exit(1);
  }
}

export function loadState(benchmarkDir: string): BenchmarkStateFile | null {
  const BenchmarkStateFile = path.join(benchmarkDir, 'benchmark-state.json');
  const logger = new Logger();
  if (!fs.existsSync(BenchmarkStateFile)) {
    logger.error(`State file not found at ${BenchmarkStateFile}`, null);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(BenchmarkStateFile, 'utf8'));
  } catch (error) {
    logger.error(`Error reading state file: ${BenchmarkStateFile}`, error);
    return null;
  }
}

export function updateState(benchmarkDir: string, updates: Partial<BenchmarkStateFile>): BenchmarkStateFile | null {
  const BenchmarkStateFile = path.join(benchmarkDir, 'benchmark-state.json');
  let currentState: BenchmarkStateFile = {} as BenchmarkStateFile;
  const logger = new Logger();

  if (fs.existsSync(BenchmarkStateFile)) {
    try {
      currentState = JSON.parse(fs.readFileSync(BenchmarkStateFile, 'utf8'));
    } catch (error) {
      logger.error(`Error reading state file: ${BenchmarkStateFile}`, error);
    }
  }

  const newState = { ...currentState, ...updates };

  try {
    fs.writeFileSync(BenchmarkStateFile, JSON.stringify(newState, null, 2));
    return newState;
  } catch (error) {
    logger.error(`Error writing state file: ${BenchmarkStateFile}`, error);
    return null;
  }
}

export function generateReports(): boolean {
  const logger = new Logger();
  logger.info(`\n=== Generating benchmark reports ===\n`);

  try {
    logger.info('Running report generation...');
    const BASE_DIR = path.resolve(__dirname, '..', '..');
    runCommand('yarn generate-reports', { cwd: path.join(BASE_DIR, 'WebpageRevamped') });

    console.log('Running statistical data generation...');
    runCommand('yarn generate-statistical-data', { cwd: path.join(BASE_DIR, 'WebpageRevamped') });

    console.log('\n=== Benchmark reports generated successfully ===\n');
    return true;
  } catch (error) {
    logger.error('Error generating reports', error);
    return false;
  }
}

export function createBenchmarkStateFile(RN_VERSION: string, BENCHMARK_DIR: string): BenchmarkStateFile {
  const BenchmarkStateFile: BenchmarkStateFile = {
    version: RN_VERSION,
    projectCreated: false,
    templatesApplied: false,
    android: {
      old: {
        tested: false
      },
      new: {
        tested: false
      }
    },
    ios: {
      old: {
        tested: false
      },
      new: {
        tested: false
      }
    },
    reportsGenerated: false,
    startTime: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(BENCHMARK_DIR, 'benchmark-state.json'),
    JSON.stringify(BenchmarkStateFile, null, 2)
  );

  return BenchmarkStateFile;
}

export function generateProject(RN_VERSION: string, BENCHMARK_DIR: string, BASE_DIR: string): BenchmarkStateFile | null {
  const logger = new Logger();
  logger.info(`\n=== Generating React Native ${RN_VERSION} project ===\n`);

  const hasValidProject = fs.existsSync(path.join(BENCHMARK_DIR, 'package.json'));

  if (!hasValidProject) {
    if (fs.existsSync(BENCHMARK_DIR)) {
      logger.info(`Removing incomplete project directory: ${BENCHMARK_DIR}`);
      fs.rmSync(BENCHMARK_DIR, { recursive: true, force: true });
    }

    try {
      // Create the SampleApps directory if it doesn't exist
      const sampleAppsDir = path.join(BASE_DIR, 'SampleApps');
      if (!fs.existsSync(sampleAppsDir)) {
        fs.mkdirSync(sampleAppsDir, { recursive: true });
        logger.info(`Created SampleApps directory at: ${sampleAppsDir}`);
      }

      logger.info('Initializing React Native project...');
      process.chdir(path.join(BASE_DIR, 'SampleApps'));
      const projectName = `RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`;
      logger.info('Creating React Native project...');
      runCommand(
        `npx --yes @react-native-community/cli@latest init ${projectName} --version ${RN_VERSION} --install-pods false`,
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
      logger.info(`React Native ${RN_VERSION} project created successfully.`);
      createBenchmarkStateFile(RN_VERSION, BENCHMARK_DIR);

    } catch (error) {
      logger.error('Error creating React Native project', error);
      throw error;
    }

    return updateState(BENCHMARK_DIR, { projectCreated: true });
  } else {
    logger.info(`Project directory already exists and contains a valid project.`);
    if (!fs.existsSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'))) {
      createBenchmarkStateFile(RN_VERSION, BENCHMARK_DIR);
    }

    return updateState(BENCHMARK_DIR, { projectCreated: true });
  }
}

export function applyTemplates(RN_VERSION: string, TEMPLATE_DIR: string, BENCHMARK_DIR: string): BenchmarkStateFile | null {
  const logger = new Logger();
  logger.info(`\n=== Applying benchmark templates ===\n`);

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
    "@d11/marco": "0.0.16"
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  runCommand('yarn install', { cwd: BENCHMARK_DIR });

  return updateState(BENCHMARK_DIR, { templatesApplied: true });
}

export function openTerminalWithCommand(command: string, title: string): boolean {
  let terminalCommand: string;
  const logger = new Logger();

  if (process.platform === 'darwin') {
    logger.info('Detected macOS, attempting to open terminal with command...');

    const escapedCommand = command
      .replace(/"/g, '\\"')       // Escape double quotes
      .replace(/'/g, "'\\''");    // Escape single quotes

    try {
      logger.info('Attempting to launch Terminal.app...');
      execSync(`osascript -e 'tell application "Terminal" to do script "${escapedCommand}"'`, {
        stdio: 'inherit',
        encoding: 'utf-8'
      });
      logger.info('Successfully launched Terminal.app');
      return true;
    } catch (error) {
      logger.error('Failed to open Terminal.app:', error);
      return false;
    }
  } else if (process.platform === 'win32') {
    terminalCommand = `start cmd.exe /k title ${title} ^& ${command}`;
  } else {
    terminalCommand = `gnome-terminal --title="${title}" -- bash -c "${command.replace(/"/g, '\\"')}; exec bash" || xterm -title "${title}" -e "${command.replace(/"/g, '\\"')}; exec bash"`;
  }

  if (process.platform !== ('darwin' as NodeJS.Platform)) {
    logger.info(`\nLaunching terminal with command: ${command}`);

    try {
      execSync(terminalCommand, {
        stdio: 'inherit',
        encoding: 'utf-8',
        shell: '/bin/bash'
      });

      return true;
    } catch (error) {
      logger.error(`Failed to open terminal: ${error.message}`, error);
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

export function handleCompletedBenchmarks(state: BenchmarkStateFile, benchmarkDir: string): void {
  const logger = new Logger();
  if (state.android.old.tested && state.android.new.tested && state.ios.old.tested && state.ios.new.tested) {
    logger.info('\n=== All benchmarks completed successfully ===\n');
    generateReports();
    updateState(benchmarkDir, { reportsGenerated: true });
  }
}

export function launchBenchmarkIfNeeded(platform: 'android' | 'ios', state: BenchmarkStateFile, baseDir: string, rnVersion: string, iterations: number): void {
  const arch = state[`${platform}OldArchTested`] ? 'new' : 'old';
  const scriptPath = path.join(baseDir, `./platform/${platform}/${platform}-benchmark.ts`);
  
  if (fs.existsSync(scriptPath)) {
    openTerminalWithCommand(
      `ts-node ${scriptPath} ${rnVersion} ${iterations} ${arch}`,
      `${platform.toUpperCase()} ${arch.toUpperCase()} Architecture Benchmark`
    );
  }
}


export function initialize(): InitializeResult {
  const { RN_VERSION, ITERATIONS } = parseIterationArgs();
  const BENCHMARK_DIR = getBenchmarkDir(RN_VERSION);
  const TEMPLATE_DIR = path.join(process.cwd(), 'templates');
  const BASE_DIR = process.cwd();

  return {
    RN_VERSION,
    ITERATIONS,
    BENCHMARK_DIR,
    TEMPLATE_DIR,
    BASE_DIR
  };
} 