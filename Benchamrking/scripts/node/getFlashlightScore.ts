const { execSync } = require("child_process")

globalThis.process.env.MAESTRO_RENDER_ANIMATION_BUTTON='render_animations'
globalThis.process.env.MAESTRO_ANIMATION_CONTAINER='animation_continer'

const appId = globalThis.process.argv[2]


const stdio = {
    stdio: "inherit"
}

const rootDirectoryPath = '../../../Reports'

if (!appId) {
    console.log("App id must be specified to run automation script.")
    globalThis.process.exit(1)
}

execSync(`flashlight test --bundleId ${appId} \
--testCommand "maestro test -e APP_ID=${appId} ../automation/flashlightflow.yaml" \
--duration 10000 \
--resultsFilePath ${rootDirectoryPath}/flashlightscore.json \
--iterationCount 1`, stdio)