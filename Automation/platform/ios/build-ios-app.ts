#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { buildAppIOS, cleanBuild, modifyPodfile, installPods } from './helper';
import { logMessage } from '../../utils/logger';
import { getErrorLogFile } from '../../utils/config';
import { IOSBuildMetadata } from '../../utils/types';

async function main(): Promise<void> {
  try {
    const RN_VERSION = process.argv[2];
    const BENCHMARK_DIR = process.argv[3];
    const ARCH_TYPE = process.argv[4];

    if (!RN_VERSION || !BENCHMARK_DIR || !ARCH_TYPE) {
      logMessage('ERROR', 'Usage: ./build-ios-app.js <RN_VERSION> <BENCHMARK_DIR> <ARCH_TYPE>');
      process.exit(1);
    }

    const IOS_DIR = path.join(BENCHMARK_DIR, 'ios');
    const PODFILE_PATH = path.join(IOS_DIR, 'Podfile');
    const APP_OUTPUT_DIR = path.join(BENCHMARK_DIR, '..', '..', 'built_apps_ios');
    const isNewArch = ARCH_TYPE === 'new';
    const PROJECT_NAME = `RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`;
    const BUNDLE_ID = `org.reactjs.native.example.RN_${RN_VERSION.replace(/\./g, '-')}_Benchmark`;
    const APP_PATH = path.join(APP_OUTPUT_DIR, `rn_${RN_VERSION}_${ARCH_TYPE}_arch.app`);
    const ERROR_LOG_FILE = getErrorLogFile();

    cleanBuild(IOS_DIR, PROJECT_NAME, ERROR_LOG_FILE);
    modifyPodfile(isNewArch, PODFILE_PATH);
    installPods(IOS_DIR, ERROR_LOG_FILE);
    const buildSuccess = buildAppIOS(isNewArch, ERROR_LOG_FILE, APP_PATH, IOS_DIR, PROJECT_NAME);

    if (buildSuccess) {
      const metadata: IOSBuildMetadata = {
        bundleId: BUNDLE_ID,
        version: RN_VERSION,
        appPath: APP_PATH,
        architecture: ARCH_TYPE as 'old' | 'new',
      };

      const metadataPath = path.join(APP_OUTPUT_DIR, `rn_${RN_VERSION}_${ARCH_TYPE}_arch_metadata.json`);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      logMessage('INFO', `Metadata saved to ${metadataPath}`);
    } else {
      logMessage('ERROR', 'Build failed');
      process.exit(1);
    }
  } catch (error) {
    logMessage('ERROR', 'Error in build process', error);
    process.exit(1);
  }
}

main().catch(error => {
  logMessage('ERROR', 'Unhandled error in build process', error);
  process.exit(1);
}); 