#!/usr/bin/env node

import { loadState, generateReports } from '../../utils/helper';
import { Logger } from '../../utils/logger';
import { parseIterationArgs } from '../../utils/args';
import { buildAndroidApps, runInstallAndTests } from './helper';
import { getBenchmarkDir } from '../../utils/config';
import { BuildResults } from '../../utils/types';
import path from 'path';

function main() {
  const { RN_VERSION, ITERATIONS } = parseIterationArgs();
  const BASE_DIR = path.resolve(__dirname, '..', '..');
  const BENCHMARK_DIR = getBenchmarkDir(RN_VERSION);
  const logger = new Logger();

  if (!RN_VERSION || !ITERATIONS) {
    logger.warn('Usage: ./android-benchmark.js <RN_VERSION> [ITERATIONS] [BASE_DIR]');
    process.exit(1);
  }

  logger.info(`\n=== Android Benchmark for React Native ${RN_VERSION} (${ITERATIONS} iterations) ===\n`);

  try {
    const initialState = loadState(BENCHMARK_DIR);

    if (!initialState.projectCreated || !initialState.templatesApplied) {
      logger.warn('Project not properly initialized. Run the main script first.');
      process.exit(1);
    }

    const buildResults: BuildResults = buildAndroidApps(BASE_DIR, RN_VERSION, BENCHMARK_DIR);

    runInstallAndTests(buildResults.android.old.buildSuccessful, buildResults.android.new.buildSuccessful, BENCHMARK_DIR, BASE_DIR, ITERATIONS);
    generateReports();

    logger.info('\n=== Android benchmarking completed ===\n');

  } catch (error) {
    logger.error('Error in Android benchmarking', error);
    process.exit(1);
  }
}

main()