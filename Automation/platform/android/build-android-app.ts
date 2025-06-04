#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { modifyGradleProperties, buildApp } from './helper';
import { logMessage } from '../../utils/logger';
import { getErrorLogFile } from '../../utils/config';
import { AndroidBuildMetadata } from '../../utils/types';

async function main(): Promise<void> {
  try {
    const RN_VERSION = process.argv[2];
    const BENCHMARK_DIR = process.argv[3];
    const ARCH_TYPE = process.argv[4] as 'old' | 'new';
    const ERROR_LOG_FILE = getErrorLogFile();

    if (!RN_VERSION || !BENCHMARK_DIR || !ARCH_TYPE) {
      logMessage('ERROR', 'Usage: ./build-android-app.js <RN_VERSION> <BENCHMARK_DIR> <ARCH_TYPE>');
      process.exit(1);
    }

    const ANDROID_DIR = path.join(BENCHMARK_DIR, 'android');
    const GRADLE_PROPERTIES = path.join(ANDROID_DIR, 'gradle.properties');
    const APK_OUTPUT_DIR = path.join(path.resolve(__dirname, '..', '..'), 'built_apks');
    const isNewArch = ARCH_TYPE === 'new';
    const PACKAGE_SUFFIX = '';
    const APK_PATH = path.join(APK_OUTPUT_DIR, `rn_${RN_VERSION}_${ARCH_TYPE}_arch.apk`);
    const PACKAGE_NAME = `com.rn_${RN_VERSION.replace(/\./g, '_')}_benchmark${PACKAGE_SUFFIX}`;

    if (!fs.existsSync(APK_OUTPUT_DIR)) {
      fs.mkdirSync(APK_OUTPUT_DIR, { recursive: true });
    }

    modifyGradleProperties(isNewArch, GRADLE_PROPERTIES, PACKAGE_NAME);
    const buildSuccess = buildApp(isNewArch, ANDROID_DIR, BENCHMARK_DIR, ERROR_LOG_FILE, APK_PATH);

    if (buildSuccess) {
      const metadata: AndroidBuildMetadata = {
        packageName: PACKAGE_NAME,
        version: RN_VERSION,
        apkPath: APK_PATH,
        architecture: ARCH_TYPE
      };

      const metadataPath = path.join(APK_OUTPUT_DIR, `rn_${RN_VERSION}_${ARCH_TYPE}_arch_metadata.json`);
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