const packageJson = require('../../package.json');
const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

// # Test id's of views and buttons
// # Variables names must be prefixed with MAESTRO_ if environament variables are manually defined in flows
// # Refernce: https://maestro.mobile.dev/advanced/parameters-and-constants#parameters-and-javascript
// # Maestro currently does not support running on physical iOS device (https://github.com/mobile-dev-inc/maestro/issues/1224#issuecomment-1624089679)

(globalThis as any).process.env.MAESTRO_VIEW_CONTAINER = 'n_view_container_0';
(globalThis as any).process.env.MAESTRO_TEXT_CONTAINER = 'n_text_container_0';
(globalThis as any).process.env.MAESTRO_IMAGE_CONTAINER = 'n_image_container_0';
(globalThis as any).process.env.MAESTRO_EMPTY_VIEW = 'render_empty_view';
(globalThis as any).process.env.MAESTRO_RENDER_1500_VIEW_BUTTON = 'render_1500_view';
(globalThis as any).process.env.MAESTRO_RENDER_1500_TEXT_BUTTON = 'render_1500_text';
(globalThis as any).process.env.MAESTRO_RENDER_1500_IMAGE_BUTTON = 'render_1500_image';
(globalThis as any).process.env.MAESTRO_RENDER_4000_IMAGE_BUTTON = 'render_4000_image';
(globalThis as any).process.env.MAESTRO_RENDER_4000_VIEW_BUTTON = 'render_4000_view';
(globalThis as any).process.env.MAESTRO_RENDER_4000_TEXT_BUTTON = 'render_4000_text';
(globalThis as any).process.env.MAESTRO_RESET_VIEW_BUTTON = 'reset_view';
(globalThis as any).process.env.MAESTRO_RESET_LOGS_BUTTON = 'reset_logs';
(globalThis as any).process.env.MAESTRO_GET_REPORT_BUTTON = 'get_report';

const platform = (globalThis as any).process.argv[2];
const packageName = (globalThis as any).process.argv[3];
const iterationCount = (globalThis as any).process.argv[4];
const oldArchDeviceId = (globalThis as any).process.argv[5];
const newArchDeviceId = (globalThis as any).process.argv[6];

const stdio = {
  stdio: 'inherit',
};

const BASE_DIR = path.resolve((globalThis as any).process.cwd(),'../../../../../');
const rootDirectoryPath = path.resolve(BASE_DIR,'WebpageRevamped/src/Reports');
const supportedVersionDirectoryPath = path.resolve(BASE_DIR,'WebpageRevamped/src');

const reportsDirectoryPath = `${rootDirectoryPath}/${packageJson.dependencies['react-native']}`;
const supportedVersionsJsonPath = `${supportedVersionDirectoryPath}/supportedVersions.json`;

const oldArchcitectureReportPathAndroid = `/sdcard/Android/data/${packageName}/files/oldarch.json`;
const newArchitectureReportPathAndroid = `/sdcard/Android/data/${packageName}/files/newarch.json`;

const oldArchitectureReportPathIos = 'Documents/oldarch.json';
const newArchitectureReportPathIos = 'Documents/newarch.json';

const commandToGetIosOldArchReports = `xcrun simctl get_app_container ${oldArchDeviceId} ${packageName} data`;
const commandToGetIosNewArchReports = `xcrun simctl get_app_container ${newArchDeviceId} ${packageName} data`;

const pathToDumpData = `${reportsDirectoryPath}/${platform}`;

validateInput();
runMaestroScript();
createDirectoryForReport();
writeSupportedVersions();

function validateInput() {
  if (!platform) {
    console.log(
      'Platform (android / ios) must be specified to run automation script.',
    );
    (globalThis as any).process.exit(1);
  } else if (!packageName) {
    console.log('App id must be specified to run automation script.');
    (globalThis as any).process.exit(1);
  } else if (!iterationCount) {
    console.log('Iterations must be specified to run automation script.');
    (globalThis as any).process.exit(1);
  }
}

function runMaestroScript() {
  console.log('------------deviceId',oldArchDeviceId, newArchDeviceId, platform)
  execSync(
    `maestro --device="${oldArchDeviceId},${newArchDeviceId}" test --shard-all 2 -e APP_ID=${packageName} -e ITERATIONS=${iterationCount} ../automation/renderFlow.yaml`,
    stdio,
  );
}

function createDirectoryForReport() {
  if (!fs.existsSync(rootDirectoryPath)) {
    fs.mkdirSync(rootDirectoryPath);
  }

  if (!fs.existsSync(reportsDirectoryPath)) {
    fs.mkdirSync(reportsDirectoryPath);
  }

  if (platform === 'android') {
    getReportForAndroid(oldArchcitectureReportPathAndroid, oldArchDeviceId);
    getReportForAndroid(newArchitectureReportPathAndroid, newArchDeviceId);
  } else {
    getReportForIos(oldArchitectureReportPathIos, "oldArch");
    getReportForIos(newArchitectureReportPathIos, "newArch");
  }
}

function getReportForAndroid(filePath: string, deviceId: string) {
  try {
    execSync(`adb -s ${deviceId} shell ls ${filePath}`, stdio);
    console.log(`${filePath} found.`);

    if (!fs.existsSync(pathToDumpData)) {
      fs.mkdirSync(pathToDumpData);
    }

    execSync(`adb -s ${deviceId} pull ${filePath} ${pathToDumpData}`, stdio);
  } catch (_error) {}
}

function getReportForIos(filePath: string, architecture: string) {
  try {
    const commandToGetIosReports = architecture === "oldArch" ? commandToGetIosOldArchReports : commandToGetIosNewArchReports;
    const result = execSync(commandToGetIosReports, {encoding: 'utf-8'});

    if (!fs.existsSync(pathToDumpData)) {
      fs.mkdirSync(pathToDumpData);
    }

    execSync(`cp ${result.trim()}/${filePath} ${pathToDumpData}`, stdio);
  } catch (_error) {}
}

function writeSupportedVersions() {
  const supportedVersions: Record<string, any> = {
    versions: [],
  };

  const files: Array<string> | undefined = fs.readdirSync(rootDirectoryPath);

  if (files?.length) {
    for (let i = 0; i < files.length; i++) {
      const stats = fs.statSync(`${rootDirectoryPath}/${files[i]}`);
      if (stats.isDirectory()) {
        supportedVersions.versions.push(files[i]);
      }
    }

    if (!fs.existsSync(supportedVersionDirectoryPath)) {
      fs.mkdirSync(supportedVersionDirectoryPath);
    }

    fs.writeFileSync(
      supportedVersionsJsonPath,
      JSON.stringify(supportedVersions),
    );
  }
}
