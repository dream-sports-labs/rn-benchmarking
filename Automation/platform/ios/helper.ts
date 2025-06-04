import { runCommand, loadState, updateState } from "../../utils/helper";
import { logMessage } from "../../utils/logger";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { BuildResults, IOSBuildMetadata, SuccessfulIOSInstall, StateFile } from "../../utils/types";

export function getAvailableIOSDevices(): string[] {
    try {
        const output = execSync('xcrun simctl list devices booted', { encoding: 'utf8' });
        const lines = output.split('\n');
        const devices: string[] = [];

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

export function buildIOSApps(BASE_DIR: string, RN_VERSION: string, BENCHMARK_DIR: string, ERROR_LOG_FILE: string): BuildResults {
    logMessage('INFO', '\n=== Building iOS Apps ===\n');

    const iosDir = path.join(BASE_DIR, 'built_apps_ios');
    if (!fs.existsSync(iosDir)) {
        fs.mkdirSync(iosDir, { recursive: true });
    }

    const oldArchAppPath = path.join(BASE_DIR, 'built_apps_ios', `rn_${RN_VERSION}_old_arch.app`);
    const newArchAppPath = path.join(BASE_DIR, 'built_apps_ios', `rn_${RN_VERSION}_new_arch.app`);
    const oldArchMetadataPath = path.join(BASE_DIR, 'built_apps_ios', `rn_${RN_VERSION}_old_arch_metadata.json`);
    const newArchMetadataPath = path.join(BASE_DIR, 'built_apps_ios', `rn_${RN_VERSION}_new_arch_metadata.json`);

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
        runCommand(`ts-node ${path.join(BASE_DIR, './platform/ios/build-ios-app.ts')} ${RN_VERSION} ${BENCHMARK_DIR} old`, ERROR_LOG_FILE);

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
        runCommand(`ts-node ${path.join(BASE_DIR, './platform/ios/build-ios-app.ts')} ${RN_VERSION} ${BENCHMARK_DIR} new`, ERROR_LOG_FILE);

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

export function runInstallAndTestsIOS(
    runOldArch: boolean = true,
    runNewArch: boolean = true,
    BENCHMARK_DIR: string,
    ERROR_LOG_FILE: string,
    BASE_DIR: string,
    RN_VERSION: string,
    ITERATIONS: number
): void {
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

    const successfulInstalls: SuccessfulIOSInstall[] = [];

    if (runOldArch) {
        logMessage('INFO', '\n=== Installing and launching iOS old architecture app ===\n');

        try {
            runCommand(`ts-node ${path.join(BASE_DIR, './platform/ios/run-ios-tests.ts')} ${oldArchMetadataPath} ${oldArchSimulatorId}`, ERROR_LOG_FILE);
            logMessage('INFO', 'Old architecture app installed and launched successfully');

            try {
                const metadata = JSON.parse(fs.readFileSync(oldArchMetadataPath, 'utf8')) as IOSBuildMetadata;
                successfulInstalls.push({
                    arch: 'old',
                    simulatorId: oldArchSimulatorId,
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
            runCommand(`ts-node ${path.join(BASE_DIR, './platform/ios/run-ios-tests.ts')} ${newArchMetadataPath} ${newArchSimulatorId}`, ERROR_LOG_FILE);
            logMessage('INFO', 'New architecture app installed and launched successfully');

            try {
                const metadata = JSON.parse(fs.readFileSync(newArchMetadataPath, 'utf8')) as IOSBuildMetadata;
                successfulInstalls.push({
                    arch: 'new',
                    simulatorId: newArchSimulatorId,
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

export function modifyPodfile(isNewArch: boolean, PODFILE_PATH: string): boolean {
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

export function cleanBuild(IOS_DIR: string, PROJECT_NAME: string, ERROR_LOG_FILE: string): void {
    logMessage('INFO', '\n=== Cleaning previous build artifacts ===\n');

    try {
        runCommand('rm -rf ~/Library/Developer/Xcode/DerivedData/*${PROJECT_NAME}*', ERROR_LOG_FILE, { stdio: 'pipe', shell: '/bin/bash' });
        runCommand(`rm -rf ${IOS_DIR}/build`, ERROR_LOG_FILE, { stdio: 'pipe', shell: '/bin/bash' });
        runCommand(`rm -rf ${IOS_DIR}/Pods`, ERROR_LOG_FILE, { stdio: 'pipe', shell: '/bin/bash' });
    } catch (error) {
        logMessage('ERROR', 'Error cleaning build artifacts', error);
    }
}

export function installPods(IOS_DIR: string, ERROR_LOG_FILE: string): void {
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
        } catch (error) {
            logMessage('ERROR', 'Failed to install Ruby dependencies', error);
            throw error;
        }

        logMessage('INFO', 'Installing CocoaPods...');
        try {
            runCommand('bundle exec pod install', ERROR_LOG_FILE, {
                cwd: IOS_DIR,
                env: {
                    ...process.env
                }
            });
        } catch (error) {
            logMessage('ERROR', 'Failed to install CocoaPods', error);
            throw error;
        }

        logMessage('INFO', 'Pods installed successfully');
    } catch (error) {
        logMessage('ERROR', 'Error installing pods', error);
        throw error;
    }
}

export function buildAppIOS(
    isNewArch: boolean,
    ERROR_LOG_FILE: string,
    APP_PATH: string,
    IOS_DIR: string,
    PROJECT_NAME: string
): boolean {
    logMessage('INFO', `\n=== Building iOS App (${isNewArch ? 'New' : 'Old'} Architecture) ===\n`);

    try {
        const command = `xcodebuild -workspace ${PROJECT_NAME}.xcworkspace -scheme ${PROJECT_NAME} -configuration Release -sdk iphonesimulator -derivedDataPath "build" CODE_SIGNING_ALLOWED=NO build`;
        runCommand(command, ERROR_LOG_FILE, { cwd: IOS_DIR });

        const buildPath = path.join(IOS_DIR, 'build/Build/Products/Release-iphonesimulator', `${PROJECT_NAME}.app`);
        if (!fs.existsSync(buildPath)) {
            logMessage('ERROR', 'Release app not found after build');
            return false;
        }

        fs.copyFileSync(buildPath, APP_PATH);
        logMessage('INFO', `App copied to ${APP_PATH}`);

        return true;
    } catch (error) {
        logMessage('ERROR', 'Error building iOS app', error);
        return false;
    }
} 

export function installApp(simulatorId: string, appPath: string, ERROR_LOG_FILE: string): boolean {
    console.log(`\n=== Installing App on Simulator ${simulatorId} ===`);
  
    runCommand(`xcrun simctl install ${simulatorId} "${appPath}"`, ERROR_LOG_FILE);
    console.log('App installation command completed');
  
    return true;
  }
  
export function launchApp(simulatorId: string, bundleId: string, ERROR_LOG_FILE: string): boolean {
    console.log(`\n=== Launching App ${bundleId} on Simulator ${simulatorId} ===`);
  
    runCommand(`xcrun simctl launch ${simulatorId} ${bundleId}`, ERROR_LOG_FILE);
    console.log('App launched successfully');
  
    return true;
}