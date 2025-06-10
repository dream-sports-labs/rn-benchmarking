#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { modifyGradleProperties, buildApp } from './helper';
import { Logger } from '../../utils/logger';
import { Architecture, BuildMetadata } from '../../utils/types';
import { parseBuildArgs } from '../../utils/args';

async function main() {
  const { RN_VERSION, BENCHMARK_DIR, ARCH_TYPE } = parseBuildArgs();
  const logger = new Logger();
  try {
    if (!RN_VERSION || !BENCHMARK_DIR || !ARCH_TYPE) {
      logger.warn('Usage: ./build-android-app.js <RN_VERSION> <BENCHMARK_DIR> <ARCH_TYPE>');
      process.exit(1);
    }

    const ANDROID_DIR = path.join(BENCHMARK_DIR, 'android');
    const GRADLE_PROPERTIES = path.join(ANDROID_DIR, 'gradle.properties');
    const APK_OUTPUT_DIR = path.join(path.resolve(__dirname, '..', '..'), 'built_apks');
    const isNewArch = ARCH_TYPE === Architecture.NEW;
    const APK_PATH = path.join(APK_OUTPUT_DIR, `rn_${RN_VERSION}_${ARCH_TYPE}_arch.apk`);
    const PACKAGE_NAME = `com.rn_${RN_VERSION.replace(/\./g, '_')}_benchmark`;

    if (!fs.existsSync(APK_OUTPUT_DIR)) {
      fs.mkdirSync(APK_OUTPUT_DIR, { recursive: true });
    }

    modifyGradleProperties(isNewArch, GRADLE_PROPERTIES, PACKAGE_NAME);
    const buildSuccess = buildApp(isNewArch, ANDROID_DIR, APK_PATH);

    if (buildSuccess) {
      const metadata: BuildMetadata = {
        bundleId: PACKAGE_NAME,
        version: RN_VERSION,
        appPath: APK_PATH,
        arch: ARCH_TYPE as Architecture
      };

      const metadataPath = path.join(APK_OUTPUT_DIR, `rn_${RN_VERSION}_${ARCH_TYPE}_arch_metadata.json`);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      logger.info(`Metadata saved to ${metadataPath}`);
    } else {
      logger.warn('Build failed');
      process.exit(1);
    }
  } catch (error) {
    logger.error('Error in build process', error);
    process.exit(1);
  }
}

main()