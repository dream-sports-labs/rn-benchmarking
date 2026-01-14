/**
 * Maestro test execution
 */

import { execSync } from 'child_process';
import { MAESTRO_ENV_VARS } from './constants';

/**
 * Run Maestro tests
 */
export function runMaestroTests(
  appPath: string,
  packageName: string,
  iterations: number,
  deviceId?: string
): void {
  console.log(`\n🎭 Running Maestro tests (${iterations} iterations)...`);
  
  const envVars = Object.entries(MAESTRO_ENV_VARS)
    .map(([key, value]) => `-e ${key}=${value}`)
    .join(' ');
  
  const maestroCommand = deviceId
    ? `maestro --device ${deviceId} test ${envVars} -e APP_ID=${packageName} -e ITERATIONS=${iterations} scripts/automation/renderFlow.yaml`
    : `maestro test ${envVars} -e APP_ID=${packageName} -e ITERATIONS=${iterations} scripts/automation/renderFlow.yaml`;
  
  execSync(maestroCommand, { cwd: appPath, stdio: 'inherit' });
}


