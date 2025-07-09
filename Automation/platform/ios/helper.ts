import { runCommand, loadState, updateState } from "../../utils/helper";
import { execSync } from "child_process";
import * as fs from 'fs-extra';
import path from "path";
import { BuildResults, BuildMetadata, SuccessfulInstall, Architecture } from "../../utils/types";
import { Logger } from "../../utils/logger";

export function getAvailableIOSDevices(): string[] {
    const logger = new Logger();
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
        logger.error('Error getting iOS devices', error);
        return [];
    }
}

export function buildIOSApps(BASE_DIR: string, RN_VERSION: string, BENCHMARK_DIR: string): BuildResults {
    const logger = new Logger();
    logger.info('\n=== Building iOS Apps ===\n');

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
        logger.info('\n=== Existing iOS builds found ===\n');
        logger.info(`Old architecture app exists at: ${oldArchAppPath}`);
        logger.info(`New architecture app exists at: ${newArchAppPath}`);
        logger.info('Using existing builds...');

        updateState(BENCHMARK_DIR, {
            ios: {
                old: {
                    appPath: oldArchAppPath,
                    metadataPath: oldArchMetadataPath
                },
                new: {
                    appPath: newArchAppPath,
                    metadataPath: newArchMetadataPath
                }
            }
        });

        return {
            ios: {
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
        ios: {
            old: {
                appPath: oldArchAppPath,
                metadataPath: oldArchMetadataPath
            },
            new: {
                appPath: newArchAppPath,
                metadataPath: newArchMetadataPath
            }
        }
    });

    logger.info('\n> Building iOS Old Architecture App\n');

    let oldArchBuildSuccessful = false;

    try {
        runCommand(`ts-node ${path.join(BASE_DIR, './platform/ios/build-ios-app.ts')} ${RN_VERSION} ${BENCHMARK_DIR} old`);

        oldArchBuildSuccessful = fs.existsSync(oldArchAppPath) && fs.existsSync(oldArchMetadataPath);

        if (oldArchBuildSuccessful) {
            logger.info(`Old architecture iOS app built successfully at: ${oldArchAppPath}`);
        } else {
            logger.error('Old architecture iOS build failed or app/metadata not found', null);
        }
    } catch (error) {
        logger.error('Error building old architecture for iOS', error);
    }

    logger.info('\n> Building iOS New Architecture App\n');

    let newArchBuildSuccessful = false;

    try {
        runCommand(`ts-node ${path.join(BASE_DIR, './platform/ios/build-ios-app.ts')} ${RN_VERSION} ${BENCHMARK_DIR} new`);

        newArchBuildSuccessful = fs.existsSync(newArchAppPath) && fs.existsSync(newArchMetadataPath);

        if (newArchBuildSuccessful) {
            logger.info(`New architecture iOS app built successfully at: ${newArchAppPath}`);
        } else {
            logger.error('New architecture iOS build failed or app/metadata not found', null);
        }
    } catch (error) {
        logger.error('Error building new architecture for iOS', error);
    }

    return {
        ios: {
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

export function runInstallAndTestsIOS(
    runOldArch: boolean = true,
    runNewArch: boolean = true,
    BENCHMARK_DIR: string,
    BASE_DIR: string,
    ITERATIONS: number
): void {
    const logger = new Logger();
    logger.info('\n=== Running iOS Tests ===\n');

    const state = loadState(BENCHMARK_DIR);

    if (!state.ios.old.metadataPath || !state.ios.new.metadataPath) {
        logger.error('Error: Missing iOS metadata paths in state file. Cannot proceed with testing.', null);
        return;
    }

    const simulatorIds = getAvailableIOSDevices();
    if (simulatorIds.length === 0) {
        logger.warn('No iOS simulators found. Please start at least two simulators.');
        throw new Error('No iOS simulators found');
    } else if (simulatorIds.length === 1) {
        logger.warn('Only one iOS simulator found. Please start at least two simulators.');
        throw new Error('Only one iOS simulator found');
    }
    const oldArchSimulatorId = simulatorIds[0];
    const newArchSimulatorId = simulatorIds[1];

    const oldArchMetadataPath = state.ios.old.metadataPath;
    const newArchMetadataPath = state.ios.new.metadataPath;

    const successfulInstalls: SuccessfulInstall[] = [];

    if (runOldArch) {
        logger.info('\n=== Installing and launching iOS old architecture app ===\n');

        try {
            runCommand(`ts-node ${path.join(BASE_DIR, './platform/ios/run-ios-tests.ts')} ${oldArchMetadataPath} ${oldArchSimulatorId}`);
            logger.info('Old architecture app installed and launched successfully');

            try {
                const metadata = JSON.parse(fs.readFileSync(oldArchMetadataPath, 'utf8')) as BuildMetadata;
                successfulInstalls.push({
                    arch: Architecture.OLD,
                    deviceId: oldArchSimulatorId,
                    bundleId: metadata.bundleId
                });
            } catch (error) {
                logger.error('Failed to read iOS metadata after successful installation', error);
            }
        } catch (error) {
            logger.error('Failed to install/launch old architecture app', error);
        }
    }

    if (runNewArch) {
        logger.info('\n=== Installing and launching iOS new architecture app ===\n');

        try {
            runCommand(`ts-node ${path.join(BASE_DIR, './platform/ios/run-ios-tests.ts')} ${newArchMetadataPath} ${newArchSimulatorId}`);
            logger.info('New architecture app installed and launched successfully');

            try {
                const metadata = JSON.parse(fs.readFileSync(newArchMetadataPath, 'utf8')) as BuildMetadata;
                successfulInstalls.push({
                    arch: Architecture.NEW,
                    deviceId: newArchSimulatorId,
                    bundleId: metadata.bundleId
                });
            } catch (error) {
                logger.error('Failed to read iOS metadata after successful installation', error);
            }
        } catch (error) {
            logger.error('Failed to install/launch new architecture app', error);
        }
    }

    logger.info(`\n=== Installations completed: ${successfulInstalls.length} successful ===\n`);

    if (successfulInstalls.length === 0) {
        logger.error('No installations were successful. Cannot run tests.', null);
        return;
    }

    logger.info('\n=== Running benchmark tests ===\n');

    try {
        runCommand(`cd ${BENCHMARK_DIR} && yarn test:ios ${ITERATIONS} ${oldArchSimulatorId} ${newArchSimulatorId}`);
        logger.info('Benchmark tests completed successfully');
    } catch (error) {
        logger.error('Benchmark tests failed', error);
    }
}

export function modifyPodfile(isNewArch: boolean, PODFILE_PATH: string): boolean {
    const logger = new Logger();
    logger.info(`\n=== Configuring iOS Podfile for ${isNewArch ? 'New' : 'Old'} Architecture ===\n`);

    if (!fs.existsSync(PODFILE_PATH)) {
        logger.error(`Podfile not found at ${PODFILE_PATH}`, null);
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
    logger.info(`Podfile updated with RCT_NEW_ARCH_ENABLED=${isNewArch ? '1' : '0'}`);

    return true;
}

export function cleanBuild(IOS_DIR: string): void {
    const logger = new Logger();
    logger.info('\n=== Cleaning previous build artifacts ===\n');

    try {
        runCommand('rm -rf ~/Library/Developer/Xcode/DerivedData/*${PROJECT_NAME}*', { stdio: 'pipe', shell: '/bin/bash' });
        runCommand(`rm -rf ${IOS_DIR}/build`, { stdio: 'pipe', shell: '/bin/bash' });
        runCommand(`rm -rf ${IOS_DIR}/Pods`, { stdio: 'pipe', shell: '/bin/bash' });
    } catch (error) {
        logger.error('Error cleaning build artifacts', error);
    }
}

export function installPods(IOS_DIR: string): void {
    const logger = new Logger();
    logger.info('\n=== Installing Pods ===\n');

    try {
        logger.info('Installing Ruby dependencies...');
        try {
            runCommand('bundle install', {
                cwd: IOS_DIR,
                env: {
                    ...process.env
                }
            });
        } catch (error) {
            logger.error('Failed to install Ruby dependencies', error);
            throw error;
        }

        logger.info('Installing CocoaPods...');
        try {
            runCommand('bundle exec pod install', {
                cwd: IOS_DIR,
                env: {
                    ...process.env
                }
            });
        } catch (error) {
            logger.error('Failed to install CocoaPods', error);
            throw error;
        }

        logger.info('Pods installed successfully');
    } catch (error) {
        logger.error('Error installing pods', error);
        throw error;
    }
}

export function buildAppIOS(
    isNewArch: boolean,
    APP_PATH: string,
    IOS_DIR: string,
    PROJECT_NAME: string
): boolean {
    const logger = new Logger();
    logger.info(`\n=== Building iOS App (${isNewArch ? 'New' : 'Old'} Architecture) ===\n`);

    try {
        const command = `xcodebuild -workspace ${PROJECT_NAME}.xcworkspace -scheme ${PROJECT_NAME} -configuration Release -sdk iphonesimulator -derivedDataPath "build" CODE_SIGNING_ALLOWED=NO build`;
        runCommand(command, { cwd: IOS_DIR });

        const buildPath = path.join(IOS_DIR, 'build/Build/Products/Release-iphonesimulator', `${PROJECT_NAME}.app`);
        if (!fs.existsSync(buildPath)) {
            logger.error('Release app not found after build', null);
            return false;
        }

        fs.copySync(buildPath, APP_PATH, { overwrite: true });
        logger.info(`App copied to ${APP_PATH}`);

        return true;
    } catch (error) {
        logger.error('Error building iOS app', error);
        return false;
    }
} 

export function installApp(simulatorId: string, appPath: string): boolean {
    const logger = new Logger();
    logger.info(`\n=== Installing App on Simulator ${simulatorId} ===`);
  
    runCommand(`xcrun simctl install ${simulatorId} "${appPath}"`);
    logger.info('App installation command completed');
  
    return true;
  }
  
export function launchApp(simulatorId: string, bundleId: string): boolean {
    const logger = new Logger();
    logger.info(`\n=== Launching App ${bundleId} on Simulator ${simulatorId} ===`);
  
    runCommand(`xcrun simctl launch ${simulatorId} ${bundleId}`);
    logger.info('App launched successfully');
  
    return true;
}