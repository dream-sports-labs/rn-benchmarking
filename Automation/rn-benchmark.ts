#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { generateProject, applyTemplates, makeScriptsExecutable, handleCompletedBenchmarks, launchBenchmarkIfNeeded, initialize } from './utils/helper';
import { logMessage } from './utils/logger';
import { getErrorLogFile } from './utils/config';
import { StateFile } from './utils/types';

async function main(): Promise<void> {
  const { RN_VERSION, ITERATIONS, BENCHMARK_DIR, TEMPLATE_DIR, BASE_DIR } = initialize();
  const ERROR_LOG_FILE = getErrorLogFile();
  logMessage('INFO', `\n=== React Native Benchmark Automation ===`);
  logMessage('INFO', `Version: ${RN_VERSION}`);
  logMessage('INFO', `Iterations: ${ITERATIONS}`);
  logMessage('INFO', `BENCHMARK_DIR: ${BENCHMARK_DIR}`);

  try {
    let state: StateFile;
    if (fs.existsSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'))) {
      state = JSON.parse(fs.readFileSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'), 'utf8'));
      logMessage('INFO', `Resuming benchmark for React Native ${state.version}`);
    } else {
      generateProject(RN_VERSION, BENCHMARK_DIR, BASE_DIR, ERROR_LOG_FILE);
      state = JSON.parse(fs.readFileSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'), 'utf8'));
    }

    if (!state.templatesApplied) {
      applyTemplates(RN_VERSION, ERROR_LOG_FILE, TEMPLATE_DIR, BENCHMARK_DIR);

      state = JSON.parse(fs.readFileSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'), 'utf8'));
    }

    makeScriptsExecutable(BASE_DIR);

    handleCompletedBenchmarks(state, BENCHMARK_DIR, ERROR_LOG_FILE);

    const iosLaunched = launchBenchmarkIfNeeded('ios', state, BASE_DIR, RN_VERSION, ITERATIONS);
    const androidLaunched = launchBenchmarkIfNeeded('android', state, BASE_DIR, RN_VERSION, ITERATIONS);

  } catch (error) {
    logMessage('ERROR', 'Error in main execution', error);
    process.exit(1);
  }
}

main().catch(err => {
  logMessage('ERROR', 'Unhandled error in benchmark script', err);
  process.exit(1);
}); 