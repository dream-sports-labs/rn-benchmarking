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
import com.benchmarkingpackage.NativePerformanceModuleSpec;

public class PerformanceLoggerModule extends NativePerformanceModuleSpec {

    PerformanceLoggerModuleImpl impl = new PerformanceLoggerModuleImpl();

    public PerformanceLoggerModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return PerformanceLoggerModuleImpl.NAME;
    }

    @Override
    public void logStartTime(String tagName, String timestamp) {
        impl.logStartTime(tagName, timestamp);
    }

    @Override
    public void logEndTime(String tagName, String timestamp) {
        impl.logEndTime(tagName, timestamp);
    }

    @Override
    public void getLogs(Promise promise) {
        impl.getLogs(promise);
    }

    @Override
    public void resetLogs() {
        impl.resetLogs();
    }
}
