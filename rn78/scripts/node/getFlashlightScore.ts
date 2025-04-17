const packageJson = require("../../package.json")
const { execSync } = require("child_process")

globalThis.process.env.MAESTRO_RENDER_ANIMATION_BUTTON='render_animations'
globalThis.process.env.MAESTRO_ANIMATION_CONTAINER='animation_continer'

const appId = globalThis.process.argv[2]
const iterationCount = globalThis.process.argv[3] || 1


const stdio = {
    stdio: "inherit"
}

const rootDirectoryPath = '../../../Reports'
const reportsDirectoryPath = `${rootDirectoryPath}/${packageJson.dependencies["react-native"]}/android`

if (!appId) {
    console.log("App id must be specified to run automation script.")
    globalThis.process.exit(1)
}

execSync(`flashlight test --bundleId ${appId} \
--testCommand "maestro test -e APP_ID=${appId} ../automation/flashlightflow.yaml" \
--duration 10000 \
--resultsFilePath ${reportsDirectoryPath}/flashlightscore.json \
--iterationCount ${iterationCount}`, stdio)