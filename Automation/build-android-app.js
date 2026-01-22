#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { runCommand } = require('./Utils/helper');

const RN_VERSION = process.argv[2];
const BENCHMARK_DIR = process.argv[3];
const ARCH_TYPE = process.argv[4] || 'old'; // 'old' or 'new'

if (!RN_VERSION || !BENCHMARK_DIR) {
  console.error('Usage: ./build-android-app.js <RN_VERSION> <BENCHMARK_DIR> [ARCH_TYPE]');
  console.error('  ARCH_TYPE: "old" or "new" (default: "old")');
  process.exit(1);
}

const ANDROID_DIR = path.join(BENCHMARK_DIR, 'android');
const GRADLE_PROPERTIES = path.join(ANDROID_DIR, 'gradle.properties');
const APK_OUTPUT_DIR = path.join(process.cwd(), 'built_apks');
const isNewArch = ARCH_TYPE === 'new';
const PACKAGE_SUFFIX = '';
const APK_PATH = path.join(APK_OUTPUT_DIR, `rn_${RN_VERSION}_${ARCH_TYPE}_arch.apk`);
let PACKAGE_NAME = `com.rn_${RN_VERSION.replace(/\./g, '_')}_benchmark${PACKAGE_SUFFIX}`;

const ERROR_LOG_FILE = path.join(process.cwd(), `android-benchmark-errors.log`);

function buildAndroidApp() {
  console.log(`\n=== Building Android App (${isNewArch ? 'New' : 'Old'} Architecture) ===\n`);
  
  try {
    if (!fs.existsSync(APK_OUTPUT_DIR)) {
      fs.mkdirSync(APK_OUTPUT_DIR, { recursive: true });
    }
    
    configureArchitecture();
    const buildSuccess = buildApp();
    if (!buildSuccess) {
      console.error('Build failed');
      process.exit(1);
    }
    
    console.log(`\n=== Build Completed Successfully ===\n`);
    console.log(`APK built at: ${APK_PATH}`);
    console.log(`Package name: ${PACKAGE_NAME}`);
    
    const metadataPath = path.join(APK_OUTPUT_DIR, `${path.basename(APK_PATH, '.apk')}.json`);
    const metadata = {
      version: RN_VERSION,
      packageName: PACKAGE_NAME,
      apkPath: APK_PATH,
      architecture: isNewArch ? 'new' : 'old',
      buildTimestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`Metadata written to: ${metadataPath}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`Android ${isNewArch ? 'New' : 'Old'} Architecture Build Failed:`, error.message);
    process.exit(1);
  }
}

function configureArchitecture() {
  console.log(`\n=== Configuring Android for ${isNewArch ? 'New' : 'Old'} Architecture ===\n`);
  
  let gradleProps = fs.readFileSync(GRADLE_PROPERTIES, 'utf8');
  gradleProps = gradleProps.replace(/newArchEnabled=(true|false)/, `newArchEnabled=${isNewArch}`);
  fs.writeFileSync(GRADLE_PROPERTIES, gradleProps);
  console.log(`Set newArchEnabled=${isNewArch} in gradle.properties`);
  
  if (isNewArch) {
    const buildGradlePath = path.join(ANDROID_DIR, 'app/build.gradle');
    let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
    
    const manifestPath = path.join(ANDROID_DIR, 'app/src/main/AndroidManifest.xml');
    let manifestContent = '';
    try {
      manifestContent = fs.readFileSync(manifestPath, 'utf8');
    } catch (error) {
      console.error(`Could not read AndroidManifest.xml: ${error.message}`);
    }
    
    let originalPackage = '';
    if (manifestContent) {
      const packageMatch = manifestContent.match(/package="([^"]+)"/);
      if (packageMatch && packageMatch[1]) {
        originalPackage = packageMatch[1];
        console.log(`Found original package name: ${originalPackage}`);
      }
    }
    
    const packageMatch = buildGradle.match(/applicationId "([^"]+)"/);
    if (packageMatch && packageMatch[1]) {
      console.log(`Using package name: "${packageMatch[1]}"`);
      PACKAGE_NAME = packageMatch[1];
    }
  }
}

function buildApp() {
  console.log(`\n=== Building Android App (${isNewArch ? 'New' : 'Old'} Architecture) ===\n`);
  
  try {
    const assetsDir = path.join(ANDROID_DIR, 'app/src/main/assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    console.log('\n> Generating JavaScript bundle...\n');
    runCommand(
      `npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output ${path.join(assetsDir, 'index.android.bundle')}`,
      ERROR_LOG_FILE,
      { cwd: BENCHMARK_DIR }
    );
    
    console.log('\n> Building release APK...\n');
    runCommand('cd android && ./gradlew clean assembleRelease --no-daemon', ERROR_LOG_FILE, { cwd: BENCHMARK_DIR });
    
    const releaseApkPath = path.join(ANDROID_DIR, 'app/build/outputs/apk/release/app-release.apk');
    if (!fs.existsSync(releaseApkPath)) {
      console.error('Release APK not found at expected path');
      return false;
    }
    
    fs.copyFileSync(releaseApkPath, APK_PATH);
    console.log(`Release APK copied to ${APK_PATH}`);
    return true;
  } catch (error) {
    console.error('Build failed:', error.message);
    return false;
  }
}

buildAndroidApp(); 