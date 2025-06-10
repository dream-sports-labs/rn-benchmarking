#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { buildAppIOS, cleanBuild, modifyPodfile, installPods } from './helper';
import { Architecture, BuildMetadata } from '../../utils/types';
import { Logger } from '../../utils/logger';
import { parseBuildArgs } from '../../utils/args';

async function main() {
  const logger = new Logger();
  try {
    const { RN_VERSION, BENCHMARK_DIR, ARCH_TYPE } = parseBuildArgs();

    if (!RN_VERSION || !BENCHMARK_DIR || !ARCH_TYPE) {
      logger.warn('Usage: ./build-ios-app.js <RN_VERSION> <BENCHMARK_DIR> <ARCH_TYPE>');
      process.exit(1);
    }

    const IOS_DIR = path.join(BENCHMARK_DIR, 'ios');
    const PODFILE_PATH = path.join(IOS_DIR, 'Podfile');
    const APP_OUTPUT_DIR = path.join(BENCHMARK_DIR, '..', '..', 'built_apps_ios');
    const isNewArch = ARCH_TYPE === 'new';
    const PROJECT_NAME = `RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`;
    const BUNDLE_ID = `org.reactjs.native.example.RN-${RN_VERSION.replace(/\./g, '-')}-Benchmark`;
    const APP_PATH = path.join(APP_OUTPUT_DIR, `rn_${RN_VERSION}_${ARCH_TYPE}_arch.app`);

    cleanBuild(IOS_DIR);
    modifyPodfile(isNewArch, PODFILE_PATH);
    installPods(IOS_DIR);
    const buildSuccess = buildAppIOS(isNewArch, APP_PATH, IOS_DIR, PROJECT_NAME);

    if (buildSuccess) {
      const metadata: BuildMetadata = {
        bundleId: BUNDLE_ID,
        version: RN_VERSION,
        appPath: APP_PATH,
        arch: ARCH_TYPE as Architecture,
      };

      const metadataPath = path.join(APP_OUTPUT_DIR, `rn_${RN_VERSION}_${ARCH_TYPE}_arch_metadata.json`);
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      logger.info(`Metadata saved to ${metadataPath}`);
    } else {
      logger.error('Build failed', null);
      process.exit(1);
    }
  } catch (error) {
    logger.error('Error in build process', error);
    process.exit(1);
  }
}

main()