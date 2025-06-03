import { runCommand, loadState, updateState } from "../../utils/helper.js";
import { logMessage } from "../../utils/logger.js";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export function getAvailableIOSDevices() {
    try {
        const output = execSync('xcrun simctl list devices booted', { encoding: 'utf8' });
        const lines = output.split('\n');
        const devices = [];

        for (const line of lines) {
            if (line.includes('(Booted)')) {
                const match = line.match(/\(([A-F0-9-]+)\)/);
                if (match) {
                    devices.push(match[1]);
                }
            }
        }
        return devices;
    } catch (error) {
        logMessage('ERROR', 'Error getting iOS devices', error);
        return [];
    }
}

export function buildIOSApps(BASE_DIR, RN_VERSION, BENCHMARK_DIR, ERROR_LOG_FILE) {
    logMessage('INFO', '\n=== Building iOS Apps ===\n');

    const oldArchAppPath = path.join(process.cwd(), 'built_apps_ios', `rn_${RN_VERSION}_old_arch.app`);
    const newArchAppPath = path.join(process.cwd(), 'built_apps_ios', `rn_${RN_VERSION}_new_arch.app`);
    const oldArchMetadataPath = path.join(process.cwd(), 'built_apps_ios', `rn_${RN_VERSION}_old_arch_metadata.json`);
    const newArchMetadataPath = path.join(process.cwd(), 'built_apps_ios', `rn_${RN_VERSION}_new_arch_metadata.json`);

    // Check if builds already exist
    const oldArchExists = fs.existsSync(oldArchAppPath);
    const newArchExists = fs.existsSync(newArchAppPath);

    if (oldArchExists && newArchExists) {
        logMessage('INFO', '\n=== Existing iOS builds found ===\n');
        logMessage('INFO', `Old architecture app exists at: ${oldArchAppPath}`);
        logMessage('INFO', `New architecture app exists at: ${newArchAppPath}`);
        logMessage('INFO', 'Using existing builds...');

        updateState(BENCHMARK_DIR, {
            iosOldArchAppPath: oldArchAppPath,
            iosNewArchAppPath: newArchAppPath,
            iosOldArchMetadataPath: oldArchMetadataPath,
            iosNewArchMetadataPath: newArchMetadataPath,
        });

        return {
            oldArchBuildSuccessful: oldArchExists,
            newArchBuildSuccessful: newArchExists,
            oldArchMetadataPath,
            newArchMetadataPath,
        };
    }

    updateState(BENCHMARK_DIR, {
        iosOldArchAppPath: oldArchAppPath,
        iosNewArchAppPath: newArchAppPath,
        iosOldArchMetadataPath: oldArchMetadataPath,
        iosNewArchMetadataPath: newArchMetadataPath,
    });

    logMessage('INFO', '\n> Building iOS Old Architecture App\n');

    let oldArchBuildSuccessful = false;

    try {
        runCommand(`node ${path.join(BASE_DIR, './platform/ios/build-ios-app.js')} ${RN_VERSION} ${BENCHMARK_DIR} old`, ERROR_LOG_FILE);

        oldArchBuildSuccessful = fs.existsSync(oldArchAppPath) && fs.existsSync(oldArchMetadataPath);

        if (oldArchBuildSuccessful) {
            logMessage('INFO', `Old architecture iOS app built successfully at: ${oldArchAppPath}`);
        } else {
            logMessage('ERROR', 'Old architecture iOS build failed or app/metadata not found');
        }
    } catch (error) {
        logMessage('ERROR', 'Error building old architecture for iOS', error);
    }

    logMessage('INFO', '\n> Building iOS New Architecture App\n');

    let newArchBuildSuccessful = false;

    try {
        runCommand(`node ${path.join(BASE_DIR, './platform/ios/build-ios-app.js')} ${RN_VERSION} ${BENCHMARK_DIR} new`, ERROR_LOG_FILE);

        newArchBuildSuccessful = fs.existsSync(newArchAppPath) && fs.existsSync(newArchMetadataPath);

        if (newArchBuildSuccessful) {
            logMessage('INFO', `New architecture iOS app built successfully at: ${newArchAppPath}`);
        } else {
            logMessage('ERROR', 'New architecture iOS build failed or app/metadata not found');
        }
    } catch (error) {
        logMessage('ERROR', 'Error building new architecture for iOS', error);
    }

    return {
        oldArchBuildSuccessful,
        newArchBuildSuccessful,
        oldArchMetadataPath,
        newArchMetadataPath
    };
}

export function runInstallAndTestsIOS(runOldArch = true, runNewArch = true, BENCHMARK_DIR, ERROR_LOG_FILE, BASE_DIR, RN_VERSION, ITERATIONS) {
    logMessage('INFO', '\n=== Running iOS Tests ===\n');

    const state = loadState(BENCHMARK_DIR);

    if (!state.iosOldArchMetadataPath || !state.iosNewArchMetadataPath) {
        logMessage('ERROR', 'Error: Missing iOS metadata paths in state file. Cannot proceed with testing.');
        return;
    }

    const simulatorIds = getAvailableIOSDevices();
    if (simulatorIds.length === 0) {
        logMessage('ERROR', 'No iOS simulators found. Please start at least two simulators.');
        throw new Error('No iOS simulators found');
    } else if (simulatorIds.length === 1) {
        logMessage('ERROR', 'Only one iOS simulator found. Please start at least two simulators.');
        throw new Error('Only one iOS simulator found');
    }
    const oldArchSimulatorId = simulatorIds[0];
    const newArchSimulatorId = simulatorIds[1];

    const oldArchMetadataPath = state.iosOldArchMetadataPath;
    const newArchMetadataPath = state.iosNewArchMetadataPath;

    const successfulInstalls = [];

    if (runOldArch) {
        logMessage('INFO', '\n=== Installing and launching iOS old architecture app ===\n');

        try {
            runCommand(`node ${path.join(BASE_DIR, './platform/ios/run-ios-tests.js')} ${oldArchMetadataPath} ${oldArchSimulatorId}`, ERROR_LOG_FILE);
            logMessage('INFO', 'Old architecture app installed and launched successfully');

            try {
                const metadata = JSON.parse(fs.readFileSync(oldArchMetadataPath, 'utf8'));
                successfulInstalls.push({
                    arch: 'old',
                    simulatorId: metadata.simulatorId,
                    bundleId: metadata.bundleId
                });
            } catch (error) {
                logMessage('ERROR', 'Failed to read iOS metadata after successful installation', error);
            }
        } catch (error) {
            logMessage('ERROR', 'Failed to install/launch old architecture app', error);
        }
    }

    if (runNewArch) {
        logMessage('INFO', '\n=== Installing and launching iOS new architecture app ===\n');

        try {
            runCommand(`node ${path.join(BASE_DIR, './platform/ios/run-ios-tests.js')} ${newArchMetadataPath} ${newArchSimulatorId}`, ERROR_LOG_FILE);
            logMessage('INFO', 'New architecture app installed and launched successfully');

            try {
                const metadata = JSON.parse(fs.readFileSync(newArchMetadataPath, 'utf8'));
                successfulInstalls.push({
                    arch: 'new',
                    simulatorId: metadata.simulatorId,
                    bundleId: metadata.bundleId
                });
            } catch (error) {
                logMessage('ERROR', 'Failed to read iOS metadata after successful installation', error);
            }
        } catch (error) {
            logMessage('ERROR', 'Failed to install/launch new architecture app', error);
        }
    }

    logMessage('INFO', `\n=== Installations completed: ${successfulInstalls.length} successful ===\n`);

    if (successfulInstalls.length === 0) {
        logMessage('ERROR', 'No installations were successful. Cannot run tests.');
        return;
    }

    logMessage('INFO', '\n=== Running benchmark tests ===\n');

    const benchmarkDir = `SampleApps/RN_${RN_VERSION.replace(/\./g, '_')}_Benchmark`;

    try {
        runCommand(`cd ${benchmarkDir} && yarn test:ios ${ITERATIONS} ${oldArchSimulatorId} ${newArchSimulatorId}`, ERROR_LOG_FILE);
        logMessage('INFO', 'Benchmark tests completed successfully');
    } catch (error) {
        logMessage('ERROR', 'Benchmark tests failed', error);
    }
}

export function modifyPodfile(isNewArch, PODFILE_PATH) {
    logMessage('INFO', `\n=== Configuring iOS Podfile for ${isNewArch ? 'New' : 'Old'} Architecture ===\n`);

    if (!fs.existsSync(PODFILE_PATH)) {
        logMessage('ERROR', `Podfile not found at ${PODFILE_PATH}`);
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
    logMessage('INFO', `Podfile updated with RCT_NEW_ARCH_ENABLED=${isNewArch ? '1' : '0'}`);

    return true;
}

export function cleanBuild(IOS_DIR, ERROR_LOG_FILE) {
    logMessage('INFO', '\n=== Cleaning Previous iOS Build Artifacts ===\n');

    runCommand('rm -rf ~/Library/Developer/Xcode/DerivedData/*${PROJECT_NAME}*', ERROR_LOG_FILE, { stdio: 'pipe', shell: true });

    runCommand(`rm -rf ${IOS_DIR}/build`, ERROR_LOG_FILE, { stdio: 'pipe', shell: true });

    runCommand(`rm -rf ${IOS_DIR}/Pods`, ERROR_LOG_FILE, { stdio: 'pipe', shell: true });

    logMessage('INFO', 'Clean completed successfully');
}

export function installPods(IOS_DIR, ERROR_LOG_FILE) {
    logMessage('INFO', '\n=== Installing Pods ===\n');

    try {
        logMessage('INFO', 'Installing Ruby dependencies...');
        try {
            runCommand('bundle install', ERROR_LOG_FILE, {
                cwd: IOS_DIR,
                env: {
                    ...process.env
                }
            });
        } catch (bundleError) {
            logMessage('WARN', `Bundle install failed: ${bundleError.message}`);
            throw bundleError;
        }

        logMessage('INFO', 'Installing CocoaPods...');
        runCommand('bundle exec pod install', ERROR_LOG_FILE, {
            cwd: IOS_DIR,
            env: {
                ...process.env
            }
        });

        return true;
    } catch (error) {
        logMessage('ERROR', 'Pod installation failed', error);
        throw error;
    }
}

export function buildAppIOS(isNewArch, BENCHMARK_DIR, ERROR_LOG_FILE, APP_PATH, APP_OUTPUT_DIR, PROJECT_NAME) {
    logMessage('INFO', `\n=== Building iOS App (${isNewArch ? 'New' : 'Old'} Architecture) ===\n`);

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

        logMessage('INFO', '\n=== Running Xcode build script ===\n');
        runCommand(`${buildScriptPath}`, ERROR_LOG_FILE, { cwd: BENCHMARK_DIR });

        const builtAppPath = path.join(BENCHMARK_DIR, 'build/Build/Products/Release-iphonesimulator', `${PROJECT_NAME}.app`);

        if (!fs.existsSync(builtAppPath)) {
            logMessage('ERROR', `Built app not found at expected path: ${builtAppPath}`);
            return false;
        }

        runCommand(`cp -R "${builtAppPath}" "${APP_PATH}"`, ERROR_LOG_FILE);
        logMessage('INFO', `App copied to ${APP_PATH}`);

        return true;
    } catch (error) {
        logMessage('ERROR', 'Build failed', error);
        return false;
    }
}