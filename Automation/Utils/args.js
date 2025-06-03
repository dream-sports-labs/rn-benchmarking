import { logMessage } from './logger.js';

export function parseArgs() {
  const RN_VERSION = process.argv[2];
  if (!RN_VERSION) {
    logMessage('ERROR', 'Error: React Native version is required. Please provide a version number as the first argument.');
    process.exit(1);
  }

  const ITERATIONS = process.argv[3] || 10;

  return {
    RN_VERSION,
    ITERATIONS
  };
}