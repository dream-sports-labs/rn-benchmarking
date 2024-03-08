const packageJson = require("../../package.json")
const { execSync } = require("child_process")
const fs = require("fs")

// # Test id's of views and buttons
// # Variables names must be prefixed with MAESTRO_ if environament variables are manually defined in flows
// # Refernce: https://maestro.mobile.dev/advanced/parameters-and-constants#parameters-and-javascript
// # Maestro currently does not support running on physical iOS device (https://github.com/mobile-dev-inc/maestro/issues/1224#issuecomment-1624089679)

globalThis.process.env.MAESTRO_VIEW_CONTAINER='n_view_container_0'
globalThis.process.env.MAESTRO_TEXT_CONTAINER='n_text_container_0'
globalThis.process.env.MAESTRO_IMAGE_CONTAINER='n_image_container_0'
globalThis.process.env.MAESTRO_EMPTY_VIEW='render_empty_view'
globalThis.process.env.MAESTRO_RENDER_1500_VIEW_BUTTON='render_1500_view'
globalThis.process.env.MAESTRO_RENDER_1500_TEXT_BUTTON='render_1500_text'
globalThis.process.env.MAESTRO_RENDER_1500_IMAGE_BUTTON='render_1500_image'
globalThis.process.env.MAESTRO_RENDER_5000_IMAGE_BUTTON='render_5000_image'
globalThis.process.env.MAESTRO_RENDER_5000_VIEW_BUTTON='render_5000_view'
globalThis.process.env.MAESTRO_RENDER_5000_TEXT_BUTTON='render_5000_text'
globalThis.process.env.MAESTRO_RESET_VIEW_BUTTON='reset_view'
globalThis.process.env.MAESTRO_RESET_LOGS_BUTTON='reset_logs'
globalThis.process.env.MAESTRO_GET_REPORT_BUTTON='get_report'

const platform = globalThis.process.argv[2]
const packageName  = globalThis.process.argv[3]
const iterationCount = globalThis.process.argv[4]
const deviceId = globalThis.process.argv[5]

const stdio = {
    stdio: "inherit"
}

const rootDirectoryPath = '../../../Reports'
const supportedVersionDirectoryPath = '../../../Webpage'

const reportsDirectoryPath = `${rootDirectoryPath}/${packageJson.dependencies["react-native"]}`
const supportedVersionsJsonPath = `${supportedVersionDirectoryPath}/supportedVersions.json`

const oldArchcitectureReportPathAndroid = `/storage/emulated/0/Android/data/${packageName}/files/oldarch.json`
const newArchitectureReportPathAndroid = `/storage/emulated/0/Android/data/${packageName}/files/newarch.json`

const oldArchitectureReportPathIos = `Documents/oldarch.json`
const newArchitectureReportPathIos = `Documents/newarch.json`

const commandToGetIosReports = `xcrun simctl get_app_container booted ${packageName} data`;

const pathToDumpData = `${reportsDirectoryPath}/${platform}`

validateInput()
runMaestroScript()
createDirectoryForReport()
writeSupportedVersions()

function validateInput() {
    if (!platform) {
        console.log('Platform (android / ios) must be specified to run automation script.')
        globalThis.process.exit(1)
    } else if (!packageName) {
        console.log("App id must be specified to run automation script.")
        globalThis.process.exit(1)
    } else if (!iterationCount) {
        console.log("Iterations must be specified to run automation script.")
        globalThis.process.exit(1)
    }
}

function runMaestroScript() {
    if (!deviceId) {
        execSync(`maestro test -e APP_ID=${packageName} -e ITERATIONS=${iterationCount} ../automation/renderFlow.yaml`, stdio)
    } else {
        execSync(`maestro --device ${deviceId} test -e APP_ID=${packageName} -e ITERATIONS=${iterationCount} ../automation/renderFlow.yaml`, stdio)
    }    
}

function createDirectoryForReport() {
    
    if (!fs.existsSync(rootDirectoryPath)) {
        fs.mkdirSync(rootDirectoryPath)
    }

    if (!fs.existsSync(reportsDirectoryPath)) {
        fs.mkdirSync(reportsDirectoryPath)
    }

    if (platform === "android") {
        getReportForAndroid(oldArchcitectureReportPathAndroid)
        getReportForAndroid(newArchitectureReportPathAndroid)
    } else {
        getReportForIos(oldArchitectureReportPathIos)
        getReportForIos(newArchitectureReportPathIos)
    }

    
}

function getReportForAndroid(filePath: string) {
    try {
        execSync(`adb shell ls ${filePath}`, stdio)
        console.log(`${filePath} found.`)

        if (!fs.existsSync(pathToDumpData)) {
            fs.mkdirSync(pathToDumpData)
        }

        execSync(`adb pull ${filePath} ${pathToDumpData}`, stdio)
    } catch(_error) {}
}


function getReportForIos(filePath: string) {
    try {
        
        const result = execSync(commandToGetIosReports, { encoding: 'utf-8' });

        if (!fs.existsSync(pathToDumpData)) {
            fs.mkdirSync(pathToDumpData)
        }

        execSync(`cp ${result.trim()}/${filePath} ${pathToDumpData}`, stdio)
    } catch(_error) {

    }
}

function writeSupportedVersions() {
    const supportedVersions: Record<string, any> = {
        versions: []
    }

    const files: Array<string> | undefined = fs.readdirSync(rootDirectoryPath)

    if (files?.length) {
        for (let i  = 0; i < files.length; i++) {
            const stats = fs.statSync(`${rootDirectoryPath}/${files[i]}`)
            if (stats.isDirectory()) {
                supportedVersions.versions.push(files[i])
            }
        }

        if (!fs.existsSync(supportedVersionDirectoryPath)) {
            fs.mkdirSync(supportedVersionDirectoryPath)
        }
    
        fs.writeFileSync(supportedVersionsJsonPath, JSON.stringify(supportedVersions))
    }
}

