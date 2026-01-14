/**
 * Report saving and management
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { REPORTS_DIR, ROOT_DIR } from './constants';
import type { Platform, Architecture, BuildType } from './types';
import { ensureDirectoryExists } from './utils';

/**
 * Save report from device to reports directory
 */
export function saveReport(
  rnVersion: string,
  platform: Platform,
  architecture: Architecture,
  buildType: BuildType,
  packageName: string
): void {
  console.log(`\n📊 Saving ${architecture} ${buildType} report...`);
  
  // Save in new structure: Reports/{version}/{platform}/{architecture}/{buildType}/
  const reportDir = path.join(REPORTS_DIR, rnVersion, platform, architecture, buildType);
  ensureDirectoryExists(reportDir);
  
  const reportFileName = `${architecture}.json`;
  const reportPath = path.join(reportDir, reportFileName);
  
  if (platform === 'android') {
    const devicePath = `/storage/emulated/0/Android/data/${packageName}/files/${architecture}.json`;
    try {
      // Check if file exists
      execSync(`adb shell ls ${devicePath}`, { stdio: 'pipe' });
      execSync(`adb pull ${devicePath} ${reportPath}`, { stdio: 'inherit' });
      console.log(`✅ Saved: ${reportPath}`);
    } catch (error) {
      console.log(`⚠️  Report not found at ${devicePath}`);
    }
  } else {
    // iOS
    try {
      const containerPath = execSync(
        `xcrun simctl get_app_container booted ${packageName} data`,
        { encoding: 'utf-8' }
      ).trim();
      
      const sourcePath = path.join(containerPath, 'Documents', `${architecture}.json`);
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, reportPath);
        console.log(`✅ Saved: ${reportPath}`);
      } else {
        console.log(`⚠️  Report not found at ${sourcePath}`);
      }
    } catch (error) {
      console.log(`⚠️  Could not retrieve iOS report`);
    }
  }
  
  // Also save in old structure for backward compatibility (using debug as default)
  if (buildType === 'debug') {
    const legacyReportDir = path.join(REPORTS_DIR, rnVersion, platform);
    ensureDirectoryExists(legacyReportDir);
    const legacyReportPath = path.join(legacyReportDir, `${architecture}.json`);
    if (fs.existsSync(reportPath)) {
      fs.copyFileSync(reportPath, legacyReportPath);
    }
  }
}

/**
 * Update supported versions list
 */
export function updateSupportedVersions(rnVersion: string): void {
  const supportedVersionsPath = path.join(
    ROOT_DIR,
    'WebpageRevamped',
    'src',
    'supportedVersions.json'
  );
  
  let versions: string[] = [];
  if (fs.existsSync(supportedVersionsPath)) {
    const data = JSON.parse(fs.readFileSync(supportedVersionsPath, 'utf-8'));
    versions = data.versions || [];
  }
  
  if (!versions.includes(rnVersion)) {
    versions.push(rnVersion);
    versions.sort();
    
    const data = { versions };
    fs.writeFileSync(supportedVersionsPath, JSON.stringify(data, null, 2));
    console.log(`\n✅ Updated supportedVersions.json`);
  }
}


