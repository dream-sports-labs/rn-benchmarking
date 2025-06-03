#!/usr/bin/env node

import { loadState, generateReports } from '../../utils/helper.js';
import { logMessage } from '../../utils/logger.js';
import { ERROR_LOG_FILE } from '../../utils/config.js';
import { parseArgs } from '../../utils/args.js';
import { buildIOSApps, runInstallAndTestsIOS } from './helper.js';
import { getBenchmarkDir } from '../../utils/config.js';




async function main() {
  const { RN_VERSION, ITERATIONS } = parseArgs();
  const BENCHMARK_DIR = getBenchmarkDir(RN_VERSION);
  const BASE_DIR = process.cwd();
  if (!RN_VERSION || !ITERATIONS) {
    logMessage('ERROR', 'Usage: ./ios-benchmark.js <RN_VERSION> [ITERATIONS] [BASE_DIR]');
    process.exit(1);
  }
  logMessage('INFO', `\n=== iOS Benchmark for React Native ${RN_VERSION} (${ITERATIONS} iterations) ===\n`);

  try {
    const initialState = loadState(BENCHMARK_DIR);

    if (!initialState.projectCreated || !initialState.templatesApplied) {
      logMessage('ERROR', 'Project not properly initialized. Run the main script first.');
      process.exit(1);
    }

    const buildResults = buildIOSApps(BASE_DIR, RN_VERSION, BENCHMARK_DIR, ERROR_LOG_FILE);

    runInstallAndTestsIOS(buildResults.oldArchBuildSuccessful, buildResults.newArchBuildSuccessful, BENCHMARK_DIR, ERROR_LOG_FILE, BASE_DIR, RN_VERSION, ITERATIONS);

    generateReports(ERROR_LOG_FILE);

    logMessage('INFO', '\n=== iOS benchmarking completed ===\n');

  } catch (error) {
    logMessage('ERROR', 'Error in iOS benchmarking', error);
    process.exit(1);
  }
}

main().catch(error => {
  logMessage('ERROR', 'Unhandled error in iOS benchmarking', error);
  process.exit(1);
}); 