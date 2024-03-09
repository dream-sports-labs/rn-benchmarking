package com.benchmarkingpackage;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

public class PerformanceLoggerViewManager extends SimpleViewManager<PerformanceLoggerView> {


    ReactApplicationContext mCallerContext;
    @NonNull
    @Override
    public String getName() {
        return PerformanceLoggerViewManagerImpl.REACT_CLASS;
    }

    public PerformanceLoggerViewManager(ReactApplicationContext reactContext) {
        mCallerContext = reactContext;
    }

    @NonNull
    @Override
    protected PerformanceLoggerView createViewInstance(@NonNull ThemedReactContext themedReactContext) {
        return new PerformanceLoggerView(themedReactContext);
    }

    @ReactProp(name = "tagName")
    public void setTagName(PerformanceLoggerView performanceLoggerView, String tagName) {
        performanceLoggerView.tagName = tagName;
        performanceLoggerView.reactApplicationContext = this.mCallerContext;
    }
}
