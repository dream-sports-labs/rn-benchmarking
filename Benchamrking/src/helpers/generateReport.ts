import { Platform } from "react-native"
import RNFS from "react-native-fs"
import { IS_NEW_ARCHITECTURE_ENABLED, NEW_ARCHITECTURE_FILE_NAME, OLD_ARCHITECTURE_FILE_NAME, PAINT_END_TIME, PAINT_START_TIME } from "../Constants"
import { GenerateHtmlTemplate, generateHtmlTemplate } from "./generateHtmlTemplate"

export async function generateReport(logs: Record<string, Array<Record<string, number>>> | undefined) {
    if (!logs || !Object.entries(logs).length) {
        return
    }

    const labels = []
    const dataForLables = []

    const reportParams: GenerateHtmlTemplate | any = {}

    reportParams.heading = IS_NEW_ARCHITECTURE_ENABLED ? `${NEW_ARCHITECTURE_FILE_NAME}` : `${OLD_ARCHITECTURE_FILE_NAME}`

    for (const key in logs) {
        const values = logs[key]
        labels.push(`${key}`)
        let mean = 0
        let sum = 0

        values.forEach((value) => {
            if (value[PAINT_START_TIME] && value[PAINT_END_TIME]) {
                sum = sum + (value[PAINT_END_TIME] - value[PAINT_START_TIME]) / 1000
            }
        })

        mean = sum / values.length
        reportParams[key] = mean
        dataForLables.push(mean)
    }

    reportParams.labels = labels
    reportParams.dataForLables = dataForLables


    const report = generateHtmlTemplate(reportParams)

    try {
        const directoryPath = Platform.OS === "android" ? RNFS.ExternalDirectoryPath : RNFS.DocumentDirectoryPath
        const filePath = `${directoryPath}/${reportParams.heading}.html`
        await RNFS.write(filePath, report)
        return true
    } catch(error) {
        console.log("An error occured while writing to file: ", error)
        return false
    }
}

