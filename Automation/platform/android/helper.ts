import { runCommand, loadState, updateState } from '../../utils/helper';
import { logMessage } from '../../utils/logger';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { BuildResults, SuccessfulInstall, StateFile } from '../../utils/types';

export function getAvailableAndroidDevices(): string[] {
    try {
        const output = execSync('adb devices -l', { encoding: 'utf8' });
        const lines = output.split('\n').slice(1);
        const devices: string[] = [];

        for (const line of lines) {
            if (line.trim() && !line.includes('List of devices attached')) {
                const deviceId = line.split(/\s+/)[0];
                if (deviceId) {
                    devices.push(deviceId);
                }
            }
        }

        return devices;
    } catch (error) {
        logMessage('ERROR', 'Error getting Android devices', error);
        return [];
    }
}

export function buildAndroidApps(BASE_DIR: string, RN_VERSION: string, BENCHMARK_DIR: string, ERROR_LOG_FILE: string): BuildResults {
    logMessage('INFO', '\n=== Building Android APKs ===\n');

    const apksDir = path.join(BASE_DIR, 'built_apks');
    if (!fs.existsSync(apksDir)) {
        fs.mkdirSync(apksDir, { recursive: true });
    }

    const oldArchApkPath = path.join(apksDir, `rn_${RN_VERSION}_old_arch.apk`);
    const newArchApkPath = path.join(apksDir, `rn_${RN_VERSION}_new_arch.apk`);

    const oldArchMetadataPath = path.join(apksDir, `rn_${RN_VERSION}_old_arch_metadata.json`);
    const newArchMetadataPath = path.join(apksDir, `rn_${RN_VERSION}_new_arch_metadata.json`);

    // Check if builds already exist
    const oldArchExists = fs.existsSync(oldArchApkPath)
    const newArchExists = fs.existsSync(newArchApkPath)

    if (oldArchExists && newArchExists) {
        logMessage('INFO', '\n=== Existing Android builds found ===\n');
        logMessage('INFO', `Old architecture APK exists at: ${oldArchApkPath}`);
        logMessage('INFO', `New architecture APK exists at: ${newArchApkPath}`);
        logMessage('INFO', 'Using existing builds...');

        updateState(BENCHMARK_DIR, {
            androidOldArchApkPath: oldArchApkPath,
            androidNewArchApkPath: newArchApkPath,
            androidOldArchMetadataPath: oldArchMetadataPath,
            androidNewArchMetadataPath: newArchMetadataPath,
        });

        return {
            oldArchBuildSuccessful: oldArchExists,
            newArchBuildSuccessful: newArchExists,
            oldArchMetadataPath,
            newArchMetadataPath
        };
    }

    updateState(BENCHMARK_DIR, {
        androidOldArchApkPath: oldArchApkPath,
        androidNewArchApkPath: newArchApkPath,
        androidOldArchMetadataPath: oldArchMetadataPath,
        androidNewArchMetadataPath: newArchMetadataPath
    });

    logMessage('INFO', '\n> Building Android Old Architecture APK\n');

    let oldArchBuildSuccessful = false;

    try {
        runCommand(`ts-node ${path.join(BASE_DIR, './platform/android/build-android-app.ts')} ${RN_VERSION} ${BENCHMARK_DIR} old`, ERROR_LOG_FILE);

        oldArchBuildSuccessful = fs.existsSync(oldArchApkPath) && fs.existsSync(oldArchMetadataPath);

        if (oldArchBuildSuccessful) {
            logMessage('INFO', `Old architecture APK built successfully at: ${oldArchApkPath}`);
        } else {
            logMessage('ERROR', 'Old architecture build failed or APK/metadata not found');
            process.exit(1);
        }
    } catch (error) {
        logMessage('ERROR', 'Error building old architecture', error);
        process.exit(1);
    }

    logMessage('INFO', '\n> Building Android New Architecture APK\n');

    let newArchBuildSuccessful = false;

    try {
        runCommand(`ts-node ${path.join(BASE_DIR, './platform/android/build-android-app.ts')} ${RN_VERSION} ${BENCHMARK_DIR} new`, ERROR_LOG_FILE);

        newArchBuildSuccessful = fs.existsSync(newArchApkPath) && fs.existsSync(newArchMetadataPath);

        if (newArchBuildSuccessful) {
            logMessage('INFO', `New architecture APK built successfully at: ${newArchApkPath}`);
        } else {
            logMessage('ERROR', 'New architecture build failed or APK/metadata not found');
            process.exit(1);
        }
    } catch (error) {
        logMessage('ERROR', 'Error building new architecture', error);
        process.exit(1);
    }

    return {
        oldArchBuildSuccessful,
        newArchBuildSuccessful,
        oldArchMetadataPath,
        newArchMetadataPath,
    };
}

export function runInstallAndTests(
    runOldArch: boolean = true,
    runNewArch: boolean = true,
    BENCHMARK_DIR: string,
    ERROR_LOG_FILE: string,
    BASE_DIR: string,
    RN_VERSION: string,
    ITERATIONS: number
): void {
    logMessage('INFO', '\n=== Running Android Tests ===\n');

    const state = loadState(BENCHMARK_DIR);

    if (!state.androidOldArchMetadataPath || !state.androidNewArchMetadataPath) {
        logMessage('ERROR', 'Error: Missing metadata paths in state file. Cannot proceed with testing.');
        process.exit(1);
    }

    const deviceIds = getAvailableAndroidDevices();
    if (deviceIds.length === 0) {
        logMessage('ERROR', 'No Android devices/emulators found. Please start at least two emulators.');
        process.exit(1);
    } else if (deviceIds.length === 1) {
        logMessage('ERROR', 'Only one Android device/emulator found. Please start at least two emulators.');
        process.exit(1);
    }

    const oldArchDeviceId = deviceIds[0];
    const newArchDeviceId = deviceIds[1];
    const oldArchMetadataPath = state.androidOldArchMetadataPath;
    const newArchMetadataPath = state.androidNewArchMetadataPath;

    const successfulInstalls: SuccessfulInstall[] = [];

    if (runOldArch) {
        logMessage('INFO', '\n=== Installing and launching old architecture app ===\n');

        try {
            runCommand(`ts-node ${path.join(BASE_DIR, './platform/android/run-android-tests.ts')} ${oldArchMetadataPath} ${oldArchDeviceId}`, ERROR_LOG_FILE);

            successfulInstalls.push({
                arch: 'old',
                deviceId: oldArchDeviceId
            });
        } catch (error) {
            logMessage('ERROR', 'Failed to install/launch old architecture app', error);
            process.exit(1);
        }
    }

    if (runNewArch) {
        logMessage('INFO', '\n=== Installing and launching new architecture app ===\n');

        try {
            runCommand(`ts-node ${path.join(BASE_DIR, './platform/android/run-android-tests.ts')} ${newArchMetadataPath} ${newArchDeviceId}`, ERROR_LOG_FILE);

            successfulInstalls.push({
                arch: 'new',
                deviceId: newArchDeviceId
            });
        } catch (error) {
            logMessage('ERROR', 'Failed to install/launch new architecture app', error);
            process.exit(1);
        }
    }

    logMessage('INFO', `\n=== Installations completed: ${successfulInstalls.length} successful ===\n`);

    if (successfulInstalls.length === 0) {
        logMessage('ERROR', 'No installations were successful. Cannot run tests.');
        return;
    }

    logMessage('INFO', '\n=== Running benchmark tests ===\n');

    const command = `cd ${BENCHMARK_DIR} && yarn test:android ${ITERATIONS} ${oldArchDeviceId} ${newArchDeviceId}`;

    logMessage('INFO', `\n=== Running: ${command} ===\n`);

    try {
        runCommand(command, ERROR_LOG_FILE);

        logMessage('INFO', '\n=== Tests completed successfully ===\n');

        updateState(BENCHMARK_DIR, {
            androidOldArchTested: true,
            androidNewArchTested: true
        });

    } catch (error) {
        logMessage('ERROR', 'Error running tests', error);
        process.exit(1);
    }
}

export function modifyGradleProperties(isNewArch: boolean, GRADLE_PROPERTIES: string, PACKAGE_NAME: string): boolean {
    logMessage('INFO', `\n=== Configuring Android Gradle Properties for ${isNewArch ? 'New' : 'Old'} Architecture ===\n`);

    if (!fs.existsSync(GRADLE_PROPERTIES)) {
        logMessage('ERROR', `Gradle properties file not found at ${GRADLE_PROPERTIES}`);
        throw new Error('Gradle properties file not found');
    }

    let gradleContent = fs.readFileSync(GRADLE_PROPERTIES, 'utf8');

    // Update new architecture flag
    const newArchRegex = /newArchEnabled\s*=\s*(true|false)/;
    if (gradleContent.match(newArchRegex)) {
        gradleContent = gradleContent.replace(newArchRegex, `newArchEnabled=${isNewArch}`);
    } else {
        gradleContent += `\nnewArchEnabled=${isNewArch}\n`;
    }

    // Update package name
    const packageNameRegex = /applicationId\s*=\s*["']([^"']+)["']/;
    if (gradleContent.match(packageNameRegex)) {
        gradleContent = gradleContent.replace(packageNameRegex, `applicationId="${PACKAGE_NAME}"`);
    } else {
        gradleContent += `\napplicationId="${PACKAGE_NAME}"\n`;
    }

    fs.writeFileSync(GRADLE_PROPERTIES, gradleContent);
    logMessage('INFO', `Gradle properties updated with newArchEnabled=${isNewArch} and applicationId=${PACKAGE_NAME}`);

    return true;
}

export function buildApp(isNewArch: boolean, ANDROID_DIR: string, BENCHMARK_DIR: string, ERROR_LOG_FILE: string, APK_PATH: string): boolean {
    logMessage('INFO', `\n=== Building Android App (${isNewArch ? 'New' : 'Old'} Architecture) ===\n`);

    try {
        const assetsDir = path.join(ANDROID_DIR, 'app/src/main/assets');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }

        const command = `cd ${ANDROID_DIR} && ./gradlew assembleRelease`;
        runCommand(command, ERROR_LOG_FILE);

        const releaseApkPath = path.join(ANDROID_DIR, 'app/build/outputs/apk/release/app-release.apk');
        if (!fs.existsSync(releaseApkPath)) {
            logMessage('ERROR', 'Release APK not found after build');
            return false;
        }

        fs.copyFileSync(releaseApkPath, APK_PATH);
        logMessage('INFO', `APK copied to ${APK_PATH}`);

        return true;
    } catch (error) {
        logMessage('ERROR', 'Error building Android app', error);
        return false;
    }
} 