package com.rtnperformance;

import androidx.annotation.Nullable;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.TurboReactPackage;
import com.facebook.react.uimanager.ViewManager;

import java.util.Collections;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

public class PerformanceLoggerPackage extends TurboReactPackage {

  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactContext) {
        if (name.equals(PerformanceLogger.NAME)) {
          return new PerformanceLogger(reactContext);
      } else {
          return null;
      }
  }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.singletonList(new PerformanceLoggerViewManager(reactContext));
    }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
        return () -> {
          final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
          moduleInfos.put(
                  PerformanceLogger.NAME,
                  new ReactModuleInfo(
                          PerformanceLogger.NAME,
                          PerformanceLogger.NAME,
                          false, // canOverrideExistingModule
                          false, // needsEagerInit
                          true, // hasConstants
                          false, // isCxxModule
                          true // isTurboModule
          ));
          return moduleInfos;
      };
  }
}