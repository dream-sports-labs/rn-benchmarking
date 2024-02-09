package com.rtnperformance;


import android.os.Environment;
import android.util.Log;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class PerformanceLoggerStorage {

    String START_TIME = "Start";
    String END_TIME = "End";

    String MEAN = "Mean";
    String STANDARD_DEVIATION = "Standard Deviation";

    String ERROR_RATE = "Error Rate";

    Double Z_VALUE = 1.97;

    String FOLDER_NAME = "D11PerformanceLog";
    static HashMap<String, HashMap<String, List<Double>>> logs =  new HashMap<>();
    static HashMap<String, HashMap<String, Double>> result = new HashMap<>();

    void addStartTime(String name, String timestamp) {
        if (logs.containsKey(name) == true) {
            HashMap<String, List<Double>> item = logs.get(name);
            List<Double> startTimeList = item.get(START_TIME);
            startTimeList.add(Double.parseDouble(timestamp));

        } else {
            HashMap<String, List<Double>> item = new HashMap<>();
            List<Double> startTimeList = new ArrayList<>();
            startTimeList.add(Double.parseDouble(timestamp));
            item.put(START_TIME, startTimeList);
            item.put(END_TIME, new ArrayList<>());
            logs.put(name, item);
        }

        writeToFile(name, START_TIME + " " + timestamp);
    }

    void addEndTime(String name, String timestamp) {
        if (logs.containsKey(name) == true) {
            HashMap<String, List<Double>> item = logs.get(name);
            List<Double> endTimeList = item.get(END_TIME);
            endTimeList.add(Double.parseDouble(timestamp));

        } else {
            HashMap<String, List<Double>> item = new HashMap<>();
            List<Double> endTimeList = new ArrayList<>();
            endTimeList.add(Double.parseDouble(timestamp));
            item.put(START_TIME, new ArrayList<>());
            item.put(END_TIME, endTimeList);
            logs.put(name, item);
        }

        writeToFile(name, END_TIME + " " + timestamp);
    }

    void writeToFile(String fileName, String contentToWrite) {
       try {
           File file = new File(Environment.getExternalStorageDirectory(), FOLDER_NAME);


           if (!file.exists()) {
               file.mkdirs();
           }

           File logFile = new File(Environment.getExternalStorageDirectory().toString() + "/" + FOLDER_NAME, fileName + ".txt");

           if (!logFile.exists()) {

               logFile.createNewFile();
           }

           BufferedWriter fileWriter = new BufferedWriter(new FileWriter(logFile, true));

           fileWriter.write(contentToWrite);
           fileWriter.newLine();
           fileWriter.close();

       } catch (Exception e) {
           Log.d(":::: Exception: ", e.toString());
       }
    }

    void resetLogs() {
        logs = new HashMap<>();
        result = new HashMap<>();
    }

    HashMap<String, HashMap<String, Double>> generateReport() {

        if (logs.size() == 0) {
            return result;
        }

        Iterator<Map.Entry<String, HashMap<String, List<Double>>>> iterator = logs.entrySet().iterator();

        while (iterator.hasNext()) {

            Map.Entry<String, HashMap<String, List<Double>>> entry = iterator.next();

            String key = entry.getKey();
            HashMap<String, List<Double>> value = entry.getValue();

            List<Double> startTime = value.get(START_TIME);
            List<Double> endTime = value.get(END_TIME);

            List<Double> difference = new ArrayList<>();

            int listSize = startTime.size();

            for (int i = 0; i < listSize; i++) {
                difference.add(Math.abs(endTime.get(i) - startTime.get(i)));
            }

            double mean = this.getAverage(difference) / 1000;
            double standardDeviation = this.getStandardDeviation(mean, difference) / 1000;
            double errorRate = this.getErrorRate(standardDeviation, difference.size()) / 1000;

            HashMap<String, Double> resultMap = new HashMap<>();

            writeToFile(key, MEAN + " " + mean);
            writeToFile(key, STANDARD_DEVIATION + " " + standardDeviation);
            writeToFile(key, ERROR_RATE + " " + errorRate);

            resultMap.put(MEAN, mean);
            resultMap.put(STANDARD_DEVIATION, standardDeviation);
            resultMap.put(ERROR_RATE, errorRate);

            result.put(key, resultMap);

        }
        return result;
    }

    Double getStandardDeviation(double mean, List<Double> timestamps) {
        List<Double> squaredDifferences = new ArrayList<>();
        int size = timestamps.size();

        for (int i = 0; i < size; i++) {
            squaredDifferences.add(Math.pow(timestamps.get(i) - mean, 2));
        }

        double squaredDifferencesSum = 0;

        for (int j = 0; j < squaredDifferences.size(); j++) {
            squaredDifferencesSum = squaredDifferencesSum + squaredDifferences.get(j);
        }

        double variance = squaredDifferencesSum / size;

        return  Math.sqrt(variance);

    }

    Double getErrorRate(double standardDeviation, int size) {
        return (standardDeviation * Z_VALUE * 100) / Math.sqrt(size);
    }

    Double getAverage(List<Double> timestamps) {

        double sum = 0;
        int size = timestamps.size();

        for (int i = 0; i < size; i++) {
            sum = sum + timestamps.get(i);
        }
        return (sum / size);
    }


    String getLogs() {
        return logs.toString();
    }

}
