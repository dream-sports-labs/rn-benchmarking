package com.benchmarkingpackage;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.viewmanagers.PerformanceLoggerViewManagerInterface;
import com.facebook.react.viewmanagers.PerformanceLoggerViewManagerDelegate;

@ReactModule(name = PerformanceLoggerViewManagerImpl.REACT_CLASS)
public class PerformanceLoggerViewManager extends SimpleViewManager<PerformanceLoggerView>
        implements PerformanceLoggerViewManagerInterface<PerformanceLoggerView> {

    private final ViewManagerDelegate<PerformanceLoggerView> mDelegate;

    ReactApplicationContext mCallerContext;


    public PerformanceLoggerViewManager(ReactApplicationContext context) {
        mDelegate = new PerformanceLoggerViewManagerDelegate<>(this);
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
        return PerformanceLoggerViewManagerImpl.REACT_CLASS;
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