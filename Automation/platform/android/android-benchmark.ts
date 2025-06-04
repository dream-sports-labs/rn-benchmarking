#!/usr/bin/env node

import { loadState, generateReports } from '../../utils/helper';
import { logMessage } from '../../utils/logger';
import { getErrorLogFile } from '../../utils/config';
import { parseArgs } from '../../utils/args';
import { buildAndroidApps, runInstallAndTests } from './helper';
import { getBenchmarkDir } from '../../utils/config';
import { BuildResults } from '../../utils/types';
import path from 'path';

async function main(): Promise<void> {
  const { RN_VERSION, ITERATIONS } = parseArgs();
  const BASE_DIR = path.resolve(__dirname, '..', '..');
  const BENCHMARK_DIR = getBenchmarkDir(RN_VERSION);
  const ERROR_LOG_FILE = getErrorLogFile();
  if (!RN_VERSION || !ITERATIONS) {
    logMessage('ERROR', 'Usage: ./android-benchmark.js <RN_VERSION> [ITERATIONS] [BASE_DIR]');
    process.exit(1);
  }
  logMessage('INFO', `\n=== Android Benchmark for React Native ${RN_VERSION} (${ITERATIONS} iterations) ===\n`);

  try {
    const initialState = loadState(BENCHMARK_DIR);

    if (!initialState.projectCreated || !initialState.templatesApplied) {
      logMessage('ERROR', 'Project not properly initialized. Run the main script first.');
      process.exit(1);
    }

    const buildResults: BuildResults = buildAndroidApps(BASE_DIR, RN_VERSION, BENCHMARK_DIR, ERROR_LOG_FILE);

    runInstallAndTests(buildResults.oldArchBuildSuccessful, buildResults.newArchBuildSuccessful, BENCHMARK_DIR, ERROR_LOG_FILE, BASE_DIR, RN_VERSION, ITERATIONS);
    generateReports(ERROR_LOG_FILE);

    logMessage('INFO', '\n=== Android benchmarking completed ===\n');

  } catch (error) {
    logMessage('ERROR', 'Error in Android benchmarking', error);
    process.exit(1);
  }
}

main().catch(error => {
  logMessage('ERROR', 'Unhandled error in Android benchmarking', error);
  process.exit(1);
}); 