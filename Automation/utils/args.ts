import { DEFAULT_ITERATIONS } from './constant';
import { Logger } from './logger';
import { Architecture, BuildArgs, IterationInfoArgs } from './types';

export function parseIterationArgs(): IterationInfoArgs {
  const RN_VERSION = process.argv[2];
  const logger = new Logger();
  if (!RN_VERSION) {
    logger.warn('Error: React Native version is required. Please provide a version number as the first argument.');
    process.exit(1);
  }

  const ITERATIONS = process.argv[3] ? parseInt(process.argv[3], DEFAULT_ITERATIONS) : DEFAULT_ITERATIONS;

  return {
    RN_VERSION,
    ITERATIONS
  };
}

export function parseBuildArgs(): BuildArgs {
  const RN_VERSION = process.argv[2];
  const BENCHMARK_DIR = process.argv[3];
  const ARCH_TYPE = process.argv[4] as Architecture
  const logger = new Logger();
  if (!RN_VERSION || !BENCHMARK_DIR || !ARCH_TYPE) {
    logger.warn('Usage: ./build-android-app.js <RN_VERSION> <BENCHMARK_DIR> <ARCH_TYPE>');
    process.exit(1);
  }

  return {
    RN_VERSION,
    BENCHMARK_DIR,
    ARCH_TYPE
  };
}