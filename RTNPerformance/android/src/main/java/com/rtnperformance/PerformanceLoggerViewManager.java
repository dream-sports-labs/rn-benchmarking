package com.rtnperformance;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.viewmanagers.RTNPerformanceLoggerViewManagerInterface;
import com.facebook.react.viewmanagers.RTNPerformanceLoggerViewManagerDelegate;

@ReactModule(name = PerformanceLoggerViewManager.NAME)
public class PerformanceLoggerViewManager extends SimpleViewManager<PerformanceLoggerView>
        implements RTNPerformanceLoggerViewManagerInterface<PerformanceLoggerView> {

    private final ViewManagerDelegate<PerformanceLoggerView> mDelegate;

    ReactApplicationContext mCallerContext;

    static final String NAME = "RTNPerformanceLoggerView";

    public PerformanceLoggerViewManager(ReactApplicationContext context) {
        mDelegate = new RTNPerformanceLoggerViewManagerDelegate<>(this);
        mCallerContext = context;
    }

    @Nullable
    @Override
    protected ViewManagerDelegate<PerformanceLoggerView> getDelegate() {
        return mDelegate;
    }

    @NonNull
    @Override
    public String getName() {
        return PerformanceLoggerViewManager.NAME;
    }

    @NonNull
    @Override
    protected PerformanceLoggerView createViewInstance(@NonNull ThemedReactContext context) {
        return new PerformanceLoggerView(context);
    }

    @Override
    @ReactProp(name = "tagName")
    public void setTagName(PerformanceLoggerView performanceLoggerView, String tagName) {
        performanceLoggerView.tagName = tagName;
        performanceLoggerView.reactApplicationContext = this.mCallerContext;
    }
}