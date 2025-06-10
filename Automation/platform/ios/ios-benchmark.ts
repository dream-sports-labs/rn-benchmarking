#!/usr/bin/env node

import { loadState, generateReports } from '../../utils/helper';
import { parseIterationArgs } from '../../utils/args';
import { buildIOSApps, runInstallAndTestsIOS } from './helper';
import { getBenchmarkDir } from '../../utils/config';
import { IterationInfoArgs, BenchmarkStateFile } from '../../utils/types';
import path from 'path';
import { Logger } from '../../utils/logger';

async function main() {
  const { RN_VERSION, ITERATIONS } = parseIterationArgs();
  const BENCHMARK_DIR = getBenchmarkDir(RN_VERSION);
  const BASE_DIR = path.resolve(__dirname, '..', '..');
  const logger = new Logger();

  if (!RN_VERSION || !ITERATIONS) {
    logger.warn('Usage: ./ios-benchmark.js <RN_VERSION> [ITERATIONS] [BASE_DIR]');
    process.exit(1);
  }

  logger.info(`\n=== iOS Benchmark for React Native ${RN_VERSION} (${ITERATIONS} iterations) ===\n`);

  try {
    const initialState = loadState(BENCHMARK_DIR) as BenchmarkStateFile;

    if (!initialState.projectCreated || !initialState.templatesApplied) {
      logger.warn('Project not properly initialized. Run the main script first.');
      process.exit(1);
    }

    const buildResults = buildIOSApps(BASE_DIR, RN_VERSION, BENCHMARK_DIR);

    runInstallAndTestsIOS(
      buildResults.ios.old.buildSuccessful,
      buildResults.ios.new.buildSuccessful,
      BENCHMARK_DIR,
      BASE_DIR,
      ITERATIONS
    );

    generateReports();

    logger.info('\n=== iOS benchmarking completed ===\n');

  } catch (error) {
    logger.error('Error in iOS benchmarking', error);
    process.exit(1);
  }
}

main()