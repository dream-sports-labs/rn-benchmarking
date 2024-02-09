import Foundation

@objc
public class PerformanceLoggerStorage: NSObject {
  
   @objc
   public static let logger = PerformanceLoggerStorage()

    let START_TIME = "Start"
    let END_TIME = "End"

    let MEAN = "Mean"
    let STANDARD_DEVIATION = "Standard Deviation"
    let ERROR_RATE = "Error Rate"

    let Z_VALUE = 1.97

    let FOLDER_NAME = "D11PerformanceLog"
    static var logs: [String: [String: [Double]]] = [:]
    static var result: [String: [String: Double]] = [:]

    @objc
    public func addStartTime(name: String, timestamp: String) {
        if var item = PerformanceLoggerStorage.logs[name] {
            item[START_TIME, default: []].append(Double(timestamp)!)
            PerformanceLoggerStorage.logs[name] = item
        } else {
            var item: [String: [Double]] = [:]
            item[START_TIME] = [Double(timestamp)!]
            item[END_TIME] = []
            PerformanceLoggerStorage.logs[name] = item
        }

        writeToFile(fileName: name, contentToWrite: "\(START_TIME) \(timestamp)")
    }

    @objc
    public func addEndTime(name: String, timestamp: String) {
        if var item = PerformanceLoggerStorage.logs[name] {
            item[END_TIME, default: []].append(Double(timestamp)!)
            PerformanceLoggerStorage.logs[name] = item
        } else {
            var item: [String: [Double]] = [:]
            item[START_TIME] = []
            item[END_TIME] = [Double(timestamp)!]
            PerformanceLoggerStorage.logs[name] = item
        }

        writeToFile(fileName: name, contentToWrite: "\(END_TIME) \(timestamp)")
    }

    func writeToFile(fileName: String, contentToWrite: String) {
        do {
            let fileManager = FileManager.default
            let documentsURL = try fileManager.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            let folderURL = documentsURL.appendingPathComponent(FOLDER_NAME)
            try fileManager.createDirectory(at: folderURL, withIntermediateDirectories: true, attributes: nil)

            let logFileURL = folderURL.appendingPathComponent("\(fileName).txt")

            if !fileManager.fileExists(atPath: logFileURL.path) {
                fileManager.createFile(atPath: logFileURL.path, contents: nil, attributes: nil)
            }

            let fileWriter = try FileHandle(forWritingTo: logFileURL)
            fileWriter.seekToEndOfFile()
            fileWriter.write(contentToWrite.data(using: .utf8)!)
            fileWriter.write("\n".data(using: .utf8)!)
            fileWriter.closeFile()
        } catch {
            print("Error writing to file: \(error)")
        }
    }

    @objc
    public func resetLogs() {
        PerformanceLoggerStorage.logs = [:]
        PerformanceLoggerStorage.result = [:]
    }

    @objc
    public func generateReport() -> [String: [String: Double]] {
        if PerformanceLoggerStorage.logs.isEmpty {
            return PerformanceLoggerStorage.result
        }

        for (key, value) in PerformanceLoggerStorage.logs {
            let startTime = value[START_TIME] ?? []
            let endTime = value[END_TIME] ?? []

            var difference: [Double] = []

            for i in 0..<startTime.count {
                difference.append(abs(endTime[i] - startTime[i]))
            }

            let mean = getAverage(timestamps: difference) / 1000.0
            let standardDeviation = getStandardDeviation(mean: mean, timestamps: difference) / 1000.0
            let errorRate = getErrorRate(standardDeviation: standardDeviation, size: difference.count) / 1000.0

            writeToFile(fileName: key, contentToWrite: "\(MEAN) \(mean)")
            writeToFile(fileName: key, contentToWrite: "\(STANDARD_DEVIATION) \(standardDeviation)")
            writeToFile(fileName: key, contentToWrite: "\(ERROR_RATE) \(errorRate)")

            PerformanceLoggerStorage.result[key] = [
                MEAN: mean,
                STANDARD_DEVIATION: standardDeviation,
                ERROR_RATE: errorRate
            ]
        }

        return PerformanceLoggerStorage.result
    }

    public func getStandardDeviation(mean: Double, timestamps: [Double]) -> Double {
        let squaredDifferences = timestamps.map { pow($0 - mean, 2) }
        let squaredDifferencesSum = squaredDifferences.reduce(0, +)
        let variance = squaredDifferencesSum / Double(timestamps.count)
        return sqrt(variance)
    }

    func getErrorRate(standardDeviation: Double, size: Int) -> Double {
        return (standardDeviation * Z_VALUE * 100) / sqrt(Double(size))
    }

    func getAverage(timestamps: [Double]) -> Double {
        let sum = timestamps.reduce(0, +)
        return sum / Double(timestamps.count)
    }

    @objc
    public func getLogs() -> String {
        return PerformanceLoggerStorage.logs.description
    }
}
