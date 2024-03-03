package com.benchmarkingpackage;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class PerformanceLoggerModule extends ReactContextBaseJavaModule {


    PerformanceLoggerModuleImpl impl = new PerformanceLoggerModuleImpl();

    public PerformanceLoggerModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return PerformanceLoggerModuleImpl.NAME;
    }

    @ReactMethod
    void logStartTime(String tagName, String timestamp) {
        impl.logStartTime(tagName, timestamp);
    }

    @ReactMethod
    void logEndTime(String tagName, String timestamp) {
        impl.logEndTime(tagName, timestamp);
    }

    @ReactMethod
    void getLogs(Promise promise) {
     impl.getLogs(promise);   
    }

    @ReactMethod
    void resetLogs() {
        impl.resetLogs();
    }
}
