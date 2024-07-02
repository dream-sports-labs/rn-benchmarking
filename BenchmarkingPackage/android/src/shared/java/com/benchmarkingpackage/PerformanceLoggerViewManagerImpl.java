package com.benchmarkingpackage;

class PerformanceLoggerViewManagerImpl {

    public static final String REACT_CLASS = "PerformanceLoggerView";

    PerformanceLoggerStorage storage = new PerformanceLoggerStorage();

    public void onDraw(String tagName) {
        String endTime = String.valueOf(System.currentTimeMillis());
        storage.logEndTime(tagName, endTime);
    }
}