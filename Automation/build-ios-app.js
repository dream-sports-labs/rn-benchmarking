#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { runCommand } = require('./Utils/helper');

const RN_VERSION = process.argv[2];
const BENCHMARK_DIR = process.argv[3];
const ARCH_TYPE = process.argv[4] || 'old'; // 'old' or 'new'

if (!RN_VERSION || !BENCHMARK_DIR) {
  console.error('Usage: ./build-ios-app.js <RN_VERSION> <BENCHMARK_DIR> [ARCH_TYPE] [SIMULATOR_ID]');
  console.error('  ARCH_TYPE: "old" or "new" (default: "old")');
  console.error('  SIMULATOR_ID: Optional simulator ID to use');
  process.exit(1);
}

const IOS_DIR = path.join(BENCHMARK_DIR, 'ios');
const PODFILE_PATH = path.join(IOS_DIR, 'Podfile');
const APP_OUTPUT_DIR = path.join(process.cwd(), 'built_apps_ios');
const isNewArch = ARCH_TYPE === 'new';
const PROJECT_NAME = `RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`;
const APP_PATH = path.join(APP_OUTPUT_DIR, `rn_${RN_VERSION}_${ARCH_TYPE}_arch.app`);

const ERROR_LOG_FILE = path.join(process.cwd(), `ios-benchmark-errors.log`);

function modifyPodfile() {
  console.log(`\n=== Configuring iOS Podfile for ${isNewArch ? 'New' : 'Old'} Architecture ===\n`);
  
  if (!fs.existsSync(PODFILE_PATH)) {
    console.error(`Podfile not found at ${PODFILE_PATH}`);
    throw new Error('Podfile not found');
  }
  
  let podfileContent = fs.readFileSync(PODFILE_PATH, 'utf8');
  
  const newArchRegex = /ENV\['RCT_NEW_ARCH_ENABLED'\]\s*=\s*['"]([01])["']/;
  const match = podfileContent.match(newArchRegex);
  
  if (match) {
    podfileContent = podfileContent.replace(
      newArchRegex,
      `ENV['RCT_NEW_ARCH_ENABLED'] = '${isNewArch ? '1' : '0'}'`
    );
  } else {
    podfileContent = `ENV['RCT_NEW_ARCH_ENABLED'] = '${isNewArch ? '1' : '0'}'\n${podfileContent}`;
  }
  
  fs.writeFileSync(PODFILE_PATH, podfileContent);
  console.log(`Podfile updated with RCT_NEW_ARCH_ENABLED=${isNewArch ? '1' : '0'}`);
  
  return true;
}

function cleanBuild() {
  console.log('\n=== Cleaning Previous iOS Build Artifacts ===\n');
  
  runCommand('rm -rf ~/Library/Developer/Xcode/DerivedData/*${PROJECT_NAME}*', ERROR_LOG_FILE, { stdio: 'pipe', shell: true });
  
  runCommand(`rm -rf ${IOS_DIR}/build`, ERROR_LOG_FILE, { stdio: 'pipe', shell: true });
  
  runCommand(`rm -rf ${IOS_DIR}/Pods`, ERROR_LOG_FILE, { stdio: 'pipe', shell: true });
  
  console.log('Clean completed successfully');
}

function installPods() {
  console.log('\n=== Installing Pods ===\n');
  
  try {
    console.log('Installing Ruby dependencies...');
    try {
      runCommand('bundle install', ERROR_LOG_FILE, { 
        cwd: IOS_DIR,
        env: {
          ...process.env
        }
      });
    } catch (bundleError) {
      console.warn(`Bundle install failed: ${bundleError.message}`);
      throw bundleError;
    }
    
    console.log('Installing CocoaPods...');
    runCommand('bundle exec pod install', ERROR_LOG_FILE, { 
      cwd: IOS_DIR,
      env: {
        ...process.env
      }
    });
    
    return true;
  } catch (error) {
    console.error('Pod installation failed:', error.message);
    throw error;
  }
}

function buildApp() {
  console.log(`\n=== Building iOS App (${isNewArch ? 'New' : 'Old'} Architecture) ===\n`);
  
  try {
    if (!fs.existsSync(APP_OUTPUT_DIR)) {
      fs.mkdirSync(APP_OUTPUT_DIR, { recursive: true });
    }
    
    const buildScriptPath = path.join(BENCHMARK_DIR, 'ios-build.sh');
    
    const buildScript = `#!/usr/bin/env bash
set -euo pipefail

# Configuration
WS="ios/${PROJECT_NAME}.xcworkspace"
SCHEME="${PROJECT_NAME}"
CONFIG="Release"

# Debug info
echo "Using workspace: $WS"
echo "Using scheme: $SCHEME"
echo "Using config: $CONFIG"

# Figure out what (if anything) is already booted
BOOTED_SIM_UDID="$(xcrun simctl list devices booted | \\
                   grep -Eo '([0-9A-F-]{36})' | head -n1 || true)"
PLUGGED_DEVICE_UDID="$(xcrun xcdevice list 2>/dev/null | \\
                       awk '/Device/{print $NF; exit}' | tr -d '()' || true)"

if [[ -n "$BOOTED_SIM_UDID" ]]; then
  DEST="id=$BOOTED_SIM_UDID"
  echo "✅ Found booted simulator →  $BOOTED_SIM_UDID"
elif [[ -n "$PLUGGED_DEVICE_UDID" ]]; then
  DEST="id=$PLUGGED_DEVICE_UDID"
  echo "✅ Found plugged-in device → $PLUGGED_DEVICE_UDID"
else
  # Fallback so we still build (but won't launch)
  DEST="generic/platform=iOS Simulator"
  echo "ℹ️  No booted device; will just compile."
fi

BUILD_DIR="build"

# Build the app
echo "Running xcodebuild command..."
xcodebuild \\
  -workspace "$WS" \\
  -scheme "$SCHEME" \\
  -configuration Release \\
  -sdk iphonesimulator \\
  -derivedDataPath "$BUILD_DIR" \\
  CODE_SIGNING_ALLOWED=NO \\
  build

# Print build result
echo "Build complete!"
APP_PATH="$BUILD_DIR/Build/Products/Release-iphonesimulator/$SCHEME.app"
echo "📦 Built app bundle →  $APP_PATH"
`;
    
    fs.writeFileSync(buildScriptPath, buildScript, { mode: 0o755 });
    console.log(`Created build script at ${buildScriptPath}`);
    
    runCommand(`chmod +x ${buildScriptPath}`, ERROR_LOG_FILE);
    
    console.log('Contents of build script:');
    runCommand(`cat ${buildScriptPath}`, ERROR_LOG_FILE, { stdio: 'inherit' });
    
    console.log('\n=== Running Xcode build script ===\n');
    runCommand(`${buildScriptPath}`, ERROR_LOG_FILE, { cwd: BENCHMARK_DIR });
    
    const builtAppPath = path.join(BENCHMARK_DIR, 'build/Build/Products/Release-iphonesimulator', `${PROJECT_NAME}.app`);
    
    if (!fs.existsSync(builtAppPath)) {
      console.error(`Built app not found at expected path: ${builtAppPath}`);
      return false;
    }
    
    runCommand(`cp -R "${builtAppPath}" "${APP_PATH}"`, ERROR_LOG_FILE);
    console.log(`App copied to ${APP_PATH}`);
    
    return true;
  } catch (error) {
    console.error('Build failed:', error.message);
    return false;
  }
}

function buildIOSApp() {
  console.log(`\n=== Building iOS App (${isNewArch ? 'New' : 'Old'} Architecture) ===\n`);
  
  try {
    cleanBuild();
    
    modifyPodfile();
    
    const podsInstalled = installPods();
    if (!podsInstalled) {
      console.error('Pod installation failed');
      process.exit(1);
    }
    
    const buildSuccess = buildApp();
    if (!buildSuccess) {
      console.error('Build failed');
      process.exit(1);
    }
    
    let bundleId = `org.reactjs.native.example.${PROJECT_NAME.replace(/_/g, '-')}`;
    
    
    console.log(`\n=== Build Completed Successfully ===\n`);
    console.log(`App built at: ${APP_PATH}`);
    console.log(`Bundle ID: ${bundleId}`);
    
    const metadataPath = path.join(APP_OUTPUT_DIR, `rn_${RN_VERSION}_${ARCH_TYPE}_arch.json`);
    const metadata = {
      version: RN_VERSION,
      bundleId: bundleId,
      appPath: APP_PATH,
      architecture: isNewArch ? 'new' : 'old',
      buildTimestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`Metadata written to: ${metadataPath}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`iOS ${isNewArch ? 'New' : 'Old'} Architecture Build Failed:`, error.message);
    process.exit(1);
  }
}

buildIOSApp(); 