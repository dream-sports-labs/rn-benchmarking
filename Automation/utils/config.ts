import path from 'path';

export function getBenchmarkDir(rnVersion: string): string {
  const BASE_DIR = path.resolve(__dirname, '..');
  return path.join(BASE_DIR, 'SampleApps', `RN_${rnVersion.replace(/\./g, '_')}_Benchmark`);
}