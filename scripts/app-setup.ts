/**
 * React Native app creation and setup
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { prompt, findFileRecursive } from './utils';
import { ensureDirectoryExists } from './utils';
import {
  ROOT_DIR,
  BENCHMARKING_DIR,
  BENCHMARKING_PACKAGE_DIR,
  GENERATED_DIR,
} from './constants';
import type { AppDirectoryResult } from './types';

/**
 * Create app directory (or use existing)
 */
export async function createAppDirectory(rnVersion: string): Promise<AppDirectoryResult> {
  const appName = `benchmark_${rnVersion.replace(/\./g, '_')}`;
  const appPath = path.join(GENERATED_DIR, appName);

  if (fs.existsSync(appPath)) {
    console.log(`⚠️  App directory already exists: ${appPath}`);
    const overwrite = await prompt('Overwrite? (y/n) [default: n, will use existing]: ');
    if (overwrite.toLowerCase() === 'y') {
      console.log('🗑️  Removing existing directory...');
      fs.rmSync(appPath, { recursive: true, force: true });
      return { appPath, isNew: true };
    } else {
      console.log('✅ Using existing directory. Skipping app creation.');
      return { appPath, isNew: false };
    }
  }

  return { appPath, isNew: true };
}

/**
 * Create React Native app
 */
export function createReactNativeApp(rnVersion: string, appPath: string): void {
  console.log(`\n📦 Creating React Native ${rnVersion} app...`);
  
  ensureDirectoryExists(GENERATED_DIR);

  const appName = path.basename(appPath);
  
  execSync(
    `npx --yes @react-native-community/cli@latest init ${appName} --version ${rnVersion} --skip-install`,
    { stdio: 'inherit', cwd: GENERATED_DIR }
  );
  
  // Verify the app was created
  if (!fs.existsSync(appPath)) {
    throw new Error(`App was not created at expected path: ${appPath}`);
  }
}

/**
 * Link BenchmarkingPackage and add required dependencies
 */
export function linkBenchmarkingPackage(appPath: string): void {
  console.log('\n🔗 Linking BenchmarkingPackage and adding required dependencies...');
  
  const packageJsonPath = path.join(appPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  // Add BenchmarkingPackage as a dependency
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.dependencies['benchmarking-package'] = `file:${path.relative(
    appPath,
    BENCHMARKING_PACKAGE_DIR
  )}`;
  
  // Add react-native-fs (required by benchmark code)
  packageJson.dependencies['react-native-fs'] = '^2.20.0';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

/**
 * Copy benchmark files to the app
 */
export function copyBenchmarkFiles(appPath: string): void {
  console.log('\n📁 Copying benchmark components and files...');
  
  // Copy src directory
  const srcSource = path.join(BENCHMARKING_DIR, 'src');
  const srcDest = path.join(appPath, 'src');
  if (fs.existsSync(srcSource)) {
    fs.cpSync(srcSource, srcDest, { recursive: true });
  }
  
  // Copy App.tsx
  const appSource = path.join(BENCHMARKING_DIR, 'App.tsx');
  const appDest = path.join(appPath, 'App.tsx');
  if (fs.existsSync(appSource)) {
    fs.copyFileSync(appSource, appDest);
  }
  
  // Copy scripts directory
  const scriptsSource = path.join(BENCHMARKING_DIR, 'scripts');
  const scriptsDest = path.join(appPath, 'scripts');
  if (fs.existsSync(scriptsSource)) {
    fs.cpSync(scriptsSource, scriptsDest, { recursive: true });
  }
  
  // Copy other necessary files
  const filesToCopy = [
    'babel.config.js',
    'metro.config.js',
    'tsconfig.json',
    'Gemfile',
    'Gemfile.lock',
  ];
  filesToCopy.forEach((file) => {
    const source = path.join(BENCHMARKING_DIR, file);
    const dest = path.join(appPath, file);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, dest);
    }
  });
}

/**
 * Install dependencies
 */
export function installDependencies(appPath: string): void {
  console.log('\n📥 Installing dependencies...');
  execSync('yarn install', { cwd: appPath, stdio: 'inherit' });
}

/**
 * Get package name for the app
 */
export function getPackageName(appPath: string, platform: 'android' | 'ios'): string {
  if (platform === 'android') {
    const buildGradlePath = path.join(appPath, 'android', 'app', 'build.gradle');
    if (fs.existsSync(buildGradlePath)) {
      const content = fs.readFileSync(buildGradlePath, 'utf-8');
      // Try to find applicationId
      let match = content.match(/applicationId\s+["'](.+?)["']/);
      if (match) {
        return match[1];
      }
      // Fallback: try namespace
      match = content.match(/namespace\s+["'](.+?)["']/);
      if (match) {
        return match[1];
      }
    }
    // Default fallback
    const appName = path.basename(appPath).toLowerCase().replace(/[^a-z0-9]/g, '');
    return `com.${appName}`;
  } else {
    // iOS - try to get from project.pbxproj
    const iosDir = path.join(appPath, 'ios');
    const pbxprojPath = findFileRecursive(iosDir, 'project.pbxproj');
    if (pbxprojPath) {
      const content = fs.readFileSync(pbxprojPath, 'utf-8');
      const match = content.match(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*(.+?);/);
      if (match) {
        return match[1].trim().replace(/["']/g, '');
      }
    }
    // Default fallback
    const appName = path.basename(appPath).toLowerCase().replace(/[^a-z0-9]/g, '');
    return `org.reactjs.native.${appName}`;
  }
}

