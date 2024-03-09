package com.benchmarkingpackage;

import java.util.ArrayList;
import java.util.HashMap;

public class PerformanceLoggerStorage {

    final String PAINT_START_TIME = "PAINT_START_TIME";
    final String PAINT_END_TIME = "PAINT_END_TIME";

    static HashMap<String, ArrayList<HashMap<String, Double>>> logs = new HashMap<>();
    void logStartTime(String tagName, String timestamp) {
        if (!logs.containsKey(tagName)) {
            HashMap<String, Double> map = new HashMap<>();
            ArrayList<HashMap<String, Double>> list = new ArrayList<>();
            map.put(PAINT_START_TIME, Double.valueOf(timestamp));
            list.add(map);
            logs.put(tagName, list);
        } else {
            ArrayList<HashMap<String, Double>> list = logs.get(tagName);
            HashMap<String, Double> map = new HashMap<>();
            map.put(PAINT_START_TIME, Double.valueOf(timestamp));
            assert list != null;
            list.add(map);
        }
    }

    void logEndTime(String tagName, String timestamp) {
        if (logs.containsKey(tagName)) {
            ArrayList<HashMap<String, Double>> list = logs.get(tagName);
            assert list != null;
            HashMap<String, Double> map = list.get(list.size() - 1);
            map.put(PAINT_END_TIME, Double.valueOf(timestamp));
        }
    }

    void resetLogs() {
        logs = new HashMap<>();
    }

    HashMap<String, ArrayList<HashMap<String, Double>>> getLogs() {
        return logs;
    }
}
