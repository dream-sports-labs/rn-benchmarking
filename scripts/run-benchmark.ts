#!/usr/bin/env ts-node

/**
 * Main benchmarking script orchestrator
 * 
 * This script automates the entire React Native benchmarking process:
 * - Creates RN apps with specified versions
 * - Runs benchmarks for both architectures (old/new)
 * - Runs benchmarks for both build types (debug/release)
 * - Runs benchmarks for both platforms (Android/iOS)
 * - Saves reports in organized folder structure
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { prompt } from './utils';
import { ensureDeviceRunning } from './device-manager';
import {
  createAppDirectory,
  createReactNativeApp,
  linkBenchmarkingPackage,
  copyBenchmarkFiles,
  installDependencies,
  getPackageName,
} from './app-setup';
import { buildApp } from './build-manager';
import { runMaestroTests } from './test-runner';
import { saveReport, updateSupportedVersions } from './report-manager';
import { stopMetroBundler, ensureMetroRunning } from './metro-manager';
import { BUILD_CONFIGS, ROOT_DIR, REPORTS_DIR } from './constants';
import type { BenchmarkConfig, BuildConfig, Platform, PlatformResult } from './types';

/**
 * Get user configuration
 */
async function getConfig(): Promise<BenchmarkConfig> {
  console.log('🚀 React Native Benchmarking Tool\n');
  console.log('This script will:');
  console.log('  • Create a React Native app with the specified version');
  console.log('  • Run benchmarks for both Old and New Architecture');
  console.log('  • Run benchmarks for both Debug and Release builds');
  console.log('  • Run benchmarks for both Android and iOS');
  console.log('  • Save reports in organized folders\n');

  const rnVersion = await prompt('Enter React Native version (e.g., 0.79.2): ');
  if (!rnVersion) {
    throw new Error('React Native version is required');
  }

  const platformInput = await prompt('Platforms (android/ios/both) [default: both]: ');
  let platforms: Platform[] = [];
  
  if (!platformInput || platformInput.toLowerCase() === 'both') {
    platforms = ['android', 'ios'];
  } else if (platformInput.toLowerCase() === 'android') {
    platforms = ['android'];
  } else if (platformInput.toLowerCase() === 'ios') {
    platforms = ['ios'];
  } else {
    throw new Error('Platform must be "android", "ios", or "both"');
  }

  // Ensure devices/emulators are running (will start if needed)
  for (const platform of platforms) {
    await ensureDeviceRunning(platform);
  }

  const iterationsInput = await prompt('Number of iterations (e.g., 30): ');
  const iterations = parseInt(iterationsInput, 10);
  if (isNaN(iterations) || iterations < 1) {
    throw new Error('Valid number of iterations is required');
  }

  const deviceIdInput = await prompt('Device ID (optional, press Enter to skip): ');
  const deviceId = deviceIdInput.trim() || undefined;

  return { rnVersion, platforms, iterations, deviceId };
}

/**
 * Run benchmarks for a specific platform
 */
async function runBenchmarkForPlatform(
  appPath: string,
  rnVersion: string,
  platform: Platform,
  iterations: number,
  deviceId?: string
): Promise<boolean> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📱 Running benchmarks for ${platform.toUpperCase()}`);
  console.log('='.repeat(70));
  
  try {
    const packageName = getPackageName(appPath, platform);
    
    for (const buildConfig of BUILD_CONFIGS) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Running ${platform}: ${buildConfig.architecture} - ${buildConfig.buildType}`);
      console.log('='.repeat(60));
      
      // Manage Metro bundler based on build type
      if (buildConfig.buildType === 'debug') {
        ensureMetroRunning(appPath);
      } else {
        stopMetroBundler();
      }
      
      // Build app
      buildApp(appPath, platform, buildConfig.architecture, buildConfig.buildType, packageName);
      
      // Run Maestro tests
      runMaestroTests(appPath, packageName, iterations, deviceId);
      
      // Save report
      saveReport(rnVersion, platform, buildConfig.architecture, buildConfig.buildType, packageName);
    }
    
    console.log(`\n✅ ${platform.toUpperCase()} benchmarks completed successfully!`);
    return true;
  } catch (error: any) {
    console.error(`\n❌ ${platform.toUpperCase()} benchmarks failed:`, error.message);
    const continueOnError = await prompt(`Continue with other platforms? (y/n) [default: y]: `);
    if (continueOnError.toLowerCase() === 'n') {
      throw error;
    }
    return false;
  }
}

/**
 * Main benchmark execution
 */
async function runBenchmark(config: BenchmarkConfig): Promise<void> {
  const { rnVersion, platforms, iterations, deviceId } = config;
  
  // Create app directory
  const { appPath, isNew } = await createAppDirectory(rnVersion);
  
  try {
    if (isNew) {
      // Step 1: Create React Native app
      createReactNativeApp(rnVersion, appPath);
      
      // Step 2: Link BenchmarkingPackage
      linkBenchmarkingPackage(appPath);
      
      // Step 3: Copy benchmark files
      copyBenchmarkFiles(appPath);
      
      // Step 4: Install dependencies
      installDependencies(appPath);
    } else {
      console.log('\n✅ Using existing app setup. Skipping app creation and setup.');
      // Verify dependencies are installed
      const nodeModulesPath = path.join(appPath, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        console.log('📥 Installing dependencies...');
        installDependencies(appPath);
      }
    }
    
    // Run benchmarks for each platform
    const platformResults: PlatformResult[] = [];
    for (const platform of platforms) {
      const success = await runBenchmarkForPlatform(appPath, rnVersion, platform, iterations, deviceId);
      platformResults.push({ platform, success });
    }
    
    // Summary
    const successfulPlatforms = platformResults.filter(r => r.success).map(r => r.platform);
    const failedPlatforms = platformResults.filter(r => !r.success).map(r => r.platform);
    
    if (failedPlatforms.length > 0) {
      console.log(`\n⚠️  Some platforms failed: ${failedPlatforms.join(', ')}`);
    }
    if (successfulPlatforms.length > 0) {
      console.log(`\n✅ Completed platforms: ${successfulPlatforms.join(', ')}`);
    }
    
    // Stop Metro after all benchmarks
    stopMetroBundler();
    
    // Update supported versions
    updateSupportedVersions(rnVersion);
    
    // Generate Reports.ts
    console.log('\n📝 Generating Reports.ts...');
    try {
      execSync('ts-node scripts/generate-reports.ts', { cwd: ROOT_DIR, stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Could not auto-generate Reports.ts. Run manually: yarn generate-reports');
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log('✅ All benchmarks completed successfully!');
    console.log('='.repeat(70));
    console.log(`\nReports saved to: ${path.join(REPORTS_DIR, rnVersion)}`);
    console.log(`\nStructure:`);
    for (const platform of platforms) {
      console.log(`  ${rnVersion}/`);
      console.log(`    ${platform}/`);
      console.log(`      oldarch/`);
      console.log(`        debug/oldarch.json`);
      console.log(`        release/oldarch.json`);
      console.log(`      newarch/`);
      console.log(`        debug/newarch.json`);
      console.log(`        release/newarch.json`);
    }
    
  } catch (error) {
    console.error('\n❌ Error during benchmarking:', error);
    stopMetroBundler();
    throw error;
  } finally {
    // Always cleanup Metro
    stopMetroBundler();
  }
}

// Main execution
async function main() {
  try {
    const config = await getConfig();
    await runBenchmark(config);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    stopMetroBundler();
    process.exit(1);
  }
}

// Run main directly
main();
