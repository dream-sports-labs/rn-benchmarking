import path from 'path';

export const BASE_DIR = process.cwd();
export const TEMPLATE_DIR = path.join(BASE_DIR, 'templates');
export const ERROR_LOG_FILE = path.join(BASE_DIR, 'benchmark-errors.log');

export function getBenchmarkDir(rnVersion) {
  return path.join(BASE_DIR, 'SampleApps', `RN_${rnVersion.replace(/\./g, '_')}_Benchmark`);
}