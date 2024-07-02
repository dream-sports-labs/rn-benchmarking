package com.benchmarkingpackage;

import com.facebook.react.bridge.Promise;

import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class PerformanceLoggerModuleImpl {
    public static final String NAME = "PerformanceLoggerModule";

    PerformanceLoggerStorage storage = new PerformanceLoggerStorage();

    public void logStartTime(String tagName, String timestamp) {
        storage.logStartTime(tagName, timestamp);
    }

    public void logEndTime(String tagName, String timestamp) {
        storage.logEndTime(tagName, timestamp);
    }

    public void getLogs(Promise promise) {
        WritableMap writableMap = new WritableNativeMap();

        for (Map.Entry<String, ArrayList<HashMap<String, Double>>> entry : storage.getLogs().entrySet()) {
            String key = entry.getKey();
            ArrayList<HashMap<String, Double>> valueList = entry.getValue();

            WritableArray writableArray = new WritableNativeArray();

            for (HashMap<String, Double> innerMap : valueList) {
                WritableMap innerWritableMap = new WritableNativeMap();

                for (Map.Entry<String, Double> innerEntry : innerMap.entrySet()) {
                    String innerKey = innerEntry.getKey();
                    Double innerValue = innerEntry.getValue();
                    innerWritableMap.putDouble(innerKey, innerValue);
                }

                writableArray.pushMap(innerWritableMap);
            }

            writableMap.putArray(key, writableArray);
        }

        promise.resolve(writableMap);
    }

    public void resetLogs() {
        storage.resetLogs();
    }
}