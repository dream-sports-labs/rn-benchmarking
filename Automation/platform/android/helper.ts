import { runCommand, loadState, updateState } from '../../utils/helper';
import { Logger } from '../../utils/logger';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Architecture, BuildResults, SuccessfulInstall } from '../../utils/types';

export function getAvailableAndroidDevices(): string[] {
    const logger = new Logger();
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
        logger.error('Error getting Android devices', error);
        return [];
    }
}

export function buildAndroidApps(BASE_DIR: string, RN_VERSION: string, BENCHMARK_DIR: string): BuildResults {
    const logger = new Logger();
    logger.info('\n=== Building Android APKs ===\n');

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
        logger.info('\n=== Existing Android builds found ===\n');
        logger.info(`Old architecture APK exists at: ${oldArchApkPath}`);
        logger.info(`New architecture APK exists at: ${newArchApkPath}`);
        logger.info('Using existing builds...');

        updateState(BENCHMARK_DIR, {
            android: {
                old: {
                    appPath: oldArchApkPath,
                    metadataPath: oldArchMetadataPath
                },
                new: {
                    appPath: newArchApkPath,
                    metadataPath: newArchMetadataPath
                }
            }
        });

        return {
            android: {
                old: {
                    buildSuccessful: oldArchExists,
                    metadataPath: oldArchMetadataPath
                },
                new: {
                    buildSuccessful: newArchExists,
                    metadataPath: newArchMetadataPath
                }
            }
        };
    }

    updateState(BENCHMARK_DIR, {
        android: {
            old: {
                appPath: oldArchApkPath,
                metadataPath: oldArchMetadataPath,
            },
            new: {
                appPath: newArchApkPath,
                metadataPath: newArchMetadataPath,
            }
        }
    });

    logger.info('\n> Building Android Old Architecture APK\n');

    let oldArchBuildSuccessful = false;

    try {
        runCommand(`ts-node ${path.join(BASE_DIR, './platform/android/build-android-app.ts')} ${RN_VERSION} ${BENCHMARK_DIR} old`);

        oldArchBuildSuccessful = fs.existsSync(oldArchApkPath) && fs.existsSync(oldArchMetadataPath);

        if (oldArchBuildSuccessful) {
            logger.info(`Old architecture APK built successfully at: ${oldArchApkPath}`);
        } else {
            logger.warn('Old architecture build failed or APK/metadata not found');
            process.exit(1);
        }
    } catch (error) {
        logger.error('Error building old architecture', error);
        process.exit(1);
    }

    logger.info('\n> Building Android New Architecture APK\n');

    let newArchBuildSuccessful = false;

    try {
        runCommand(`ts-node ${path.join(BASE_DIR, './platform/android/build-android-app.ts')} ${RN_VERSION} ${BENCHMARK_DIR} new`);

        newArchBuildSuccessful = fs.existsSync(newArchApkPath) && fs.existsSync(newArchMetadataPath);

        if (newArchBuildSuccessful) {
            logger.info(`New architecture APK built successfully at: ${newArchApkPath}`);
        } else {
            logger.warn('New architecture build failed or APK/metadata not found');
            process.exit(1);
        }
    } catch (error) {
        logger.error('Error building new architecture', error);
        process.exit(1);
    }

    return {
        android: {
            old: {
                buildSuccessful: oldArchBuildSuccessful,
                metadataPath: oldArchMetadataPath
            },
            new: {
                buildSuccessful: newArchBuildSuccessful,
                metadataPath: newArchMetadataPath
            }
        }
    };
}

export function runInstallAndTests(
    runOldArch: boolean = true,
    runNewArch: boolean = true,
    BENCHMARK_DIR: string,
    BASE_DIR: string,
    ITERATIONS: number
): void {
    const logger = new Logger();
    logger.info('\n=== Running Android Tests ===\n');

    const state = loadState(BENCHMARK_DIR);

    if (!state.android.old.metadataPath || !state.android.new.metadataPath) {
        logger.error('Error: Missing metadata paths in state file. Cannot proceed with testing.', null);
        process.exit(1);
    }

    const deviceIds = getAvailableAndroidDevices();
    if (deviceIds.length === 0) {
        logger.warn('No Android devices/emulators found. Please start at least two emulators.');
        process.exit(1);
    } else if (deviceIds.length === 1) {
        logger.warn('Only one Android device/emulator found. Please start at least two emulators.');
        process.exit(1);
    }

    const oldArchDeviceId = deviceIds[0];
    const newArchDeviceId = deviceIds[1];
    const oldArchMetadataPath = state.android.old.metadataPath;
    const newArchMetadataPath = state.android.new.metadataPath;

    const successfulInstalls: SuccessfulInstall[] = [];

    if (runOldArch) {
        logger.info('\n=== Installing and launching old architecture app ===\n');

        try {
            runCommand(`ts-node ${path.join(BASE_DIR, './platform/android/run-android-tests.ts')} ${oldArchMetadataPath} ${oldArchDeviceId}`);

            successfulInstalls.push({
                arch: Architecture.OLD,
                deviceId: oldArchDeviceId
            });
        } catch (error) {
            logger.error('Failed to install/launch old architecture app', error);
            process.exit(1);
        }
    }

    if (runNewArch) {
        logger.info('\n=== Installing and launching new architecture app ===\n');

        try {
            runCommand(`ts-node ${path.join(BASE_DIR, './platform/android/run-android-tests.ts')} ${newArchMetadataPath} ${newArchDeviceId}`);

            successfulInstalls.push({
                arch: Architecture.NEW,
                deviceId: newArchDeviceId
            });
        } catch (error) {
            logger.error('Failed to install/launch new architecture app', error);
            process.exit(1);
        }
    }

    logger.info(`\n=== Installations completed: ${successfulInstalls.length} successful ===\n`);

    if (successfulInstalls.length === 0) {
        logger.error('No installations were successful. Cannot run tests.', null);
        return;
    }

    logger.info('\n=== Running benchmark tests ===\n');

    const command = `cd ${BENCHMARK_DIR} && yarn test:android ${ITERATIONS} ${oldArchDeviceId} ${newArchDeviceId}`;

    logger.info(`\n=== Running: ${command} ===\n`);

    try {
        runCommand(command);

        logger.info('\n=== Tests completed successfully ===\n');

        updateState(BENCHMARK_DIR, {
            android: {
                old: {
                    tested: true
                },
                new: {
                    tested: true
                }
            }
        });

    } catch (error) {
        logger.error('Error running tests', error);
        process.exit(1);
    }
}

export function modifyGradleProperties(isNewArch: boolean, GRADLE_PROPERTIES: string, PACKAGE_NAME: string): boolean {
    const logger = new Logger();
    logger.info(`\n=== Configuring Android Gradle Properties for ${isNewArch ? 'New' : 'Old'} Architecture ===\n`);

    if (!fs.existsSync(GRADLE_PROPERTIES)) {
        logger.error(`Gradle properties file not found at ${GRADLE_PROPERTIES}`, null);
        process.exit(1);
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
    logger.info(`Gradle properties updated with newArchEnabled=${isNewArch} and applicationId=${PACKAGE_NAME}`);

    return true;
}

export function buildApp(isNewArch: boolean, ANDROID_DIR: string, APK_PATH: string): boolean {
    const logger = new Logger();
    logger.info(`\n=== Building Android App (${isNewArch ? 'New' : 'Old'} Architecture) ===\n`);

    try {
        const assetsDir = path.join(ANDROID_DIR, 'app/src/main/assets');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }

        const command = `cd ${ANDROID_DIR} && ./gradlew assembleRelease`;
        runCommand(command);

        const releaseApkPath = path.join(ANDROID_DIR, 'app/build/outputs/apk/release/app-release.apk');
        if (!fs.existsSync(releaseApkPath)) {
            logger.error('Release APK not found after build', null);
            return false;
        }

        fs.copyFileSync(releaseApkPath, APK_PATH);
        logger.info(`APK copied to ${APK_PATH}`);

        return true;
    } catch (error) {
        logger.error('Error building Android app', error);
        return false;
    }
} 