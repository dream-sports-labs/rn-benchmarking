import { Platform } from "react-native"
import RNFS from "react-native-fs"
import { IS_NEW_ARCHITECTURE_ENABLED, NEW_ARCHITECTURE_FILE_NAME, OLD_ARCHITECTURE_FILE_NAME, PAINT_END_TIME, PAINT_START_TIME } from "../Constants"

export async function generateReport(logs: Record<string, Array<Record<string, number>>> | undefined) {
    if (!logs || !Object.entries(logs).length) {
        return
    }

    const report: Record<string, any> = {
        data: logs,
        means: {},
        labels: [],
        dataForLabels: []
    }

    const fileName = IS_NEW_ARCHITECTURE_ENABLED ? `${NEW_ARCHITECTURE_FILE_NAME}` : `${OLD_ARCHITECTURE_FILE_NAME}`

    for (const key in logs) {
        const values = logs[key]
        
        let mean = 0
        let sum = 0

        values.forEach((value) => {
            if (value[PAINT_START_TIME] && value[PAINT_END_TIME]) {
                sum = sum + (value[PAINT_END_TIME] - value[PAINT_START_TIME]) / 1000
            }
        })

        mean = sum / values.length
        report.means[key] = mean
        report.labels.push(`${key}`)
        report.dataForLabels.push(mean)
        
    }

    try {
        const directoryPath = Platform.OS === "android" ? RNFS.ExternalDirectoryPath : RNFS.DocumentDirectoryPath
        const filePath = `${directoryPath}/${fileName}.json`
        await RNFS.write(filePath, JSON.stringify(report))
        return true
    } catch(error) {
        console.log("An error occured while writing to file: ", error)
        return false
    }
}

