#!/usr/bin/env node

import fs from 'fs';
import { runCommand } from '../../utils/helper';
import { BuildMetadata } from '../../utils/types';
import { Logger } from '../../utils/logger';

const METADATA_PATH = process.argv[2];
const DEVICE_ID = process.argv[3];

async function installAndroidApp() {
  const logger = new Logger();
  logger.info('\n=== Installing and Launching App ===\n');

  try {
    logger.info('Reading metadata file...');
    const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8')) as BuildMetadata;

    const packageName = metadata.bundleId;
    const version = metadata.version;
    const apkPath = metadata.appPath;
    const architecture = metadata.arch;

    logger.info(`Package name: ${packageName}`);
    logger.info(`Version: ${version}`);
    logger.info(`Architecture: ${architecture}`);

    if (!fs.existsSync(apkPath)) {
      const errorMsg = `APK not found at ${apkPath}`;
      logger.error(errorMsg, null);
      process.exit(1);
    }

    logger.info(`\n=== Installing APK: ${apkPath} ===\n`);
    const deviceOption = DEVICE_ID ? `-s ${DEVICE_ID}` : '';
    runCommand(`adb ${deviceOption} install -r ${apkPath}`);

  } catch (error) {
    logger.error('Installation failed', error);
    process.exit(1);
  }
}

installAndroidApp()