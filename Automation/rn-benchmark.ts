#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { generateProject, applyTemplates, makeScriptsExecutable, handleCompletedBenchmarks, launchBenchmarkIfNeeded, initialize } from './utils/helper';
import { BenchmarkStateFile } from './utils/types';
import { Logger } from './utils/logger';

async function main(): Promise<void> {
  const { RN_VERSION, ITERATIONS, BENCHMARK_DIR, TEMPLATE_DIR, BASE_DIR } = initialize();
  const logger = new Logger();
  logger.info(`\n=== React Native Benchmark Automation ===`);
  logger.info(`Version: ${RN_VERSION}`);
  logger.info(`Iterations: ${ITERATIONS}`);
  logger.info(`BENCHMARK_DIR: ${BENCHMARK_DIR}`);

  try {
    let state: BenchmarkStateFile;
    if (fs.existsSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'))) {
      state = JSON.parse(fs.readFileSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'), 'utf8'));
      logger.info(`Resuming benchmark for React Native ${state.version}`);
    } else {
      generateProject(RN_VERSION, BENCHMARK_DIR, BASE_DIR);
      state = JSON.parse(fs.readFileSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'), 'utf8'));
    }

    if (!state.templatesApplied) {
      applyTemplates(RN_VERSION, TEMPLATE_DIR, BENCHMARK_DIR);

      state = JSON.parse(fs.readFileSync(path.join(BENCHMARK_DIR, 'benchmark-state.json'), 'utf8'));
    }

    makeScriptsExecutable(BASE_DIR);

    handleCompletedBenchmarks(state, BENCHMARK_DIR);

    const iosLaunched = launchBenchmarkIfNeeded('ios', state, BASE_DIR, RN_VERSION, ITERATIONS);
    const androidLaunched = launchBenchmarkIfNeeded('android', state, BASE_DIR, RN_VERSION, ITERATIONS);

  } catch (error) {
    logger.error('Error in main execution', error);
    process.exit(1);
  }
}

main()