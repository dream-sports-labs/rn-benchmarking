package com.reactlibrary;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

public class RNPerformanceViewManager extends SimpleViewManager<RNPerformanceView> {

    public static final String REACT_CLASS = "RNPerformanceView";

    ReactApplicationContext mCallerContext;
    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    public RNPerformanceViewManager(ReactApplicationContext reactContext) {
        mCallerContext = reactContext;
    }

    @NonNull
    @Override
    protected RNPerformanceView createViewInstance(@NonNull ThemedReactContext themedReactContext) {
        return new RNPerformanceView(themedReactContext);
    }

    @ReactProp(name = "tagName")
    public void setTagName(RNPerformanceView performanceLoggerView, String tagName) {
        performanceLoggerView.tagName = tagName;
        performanceLoggerView.reactApplicationContext = this.mCallerContext;
    }
}
