
package com.reactlibrary;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class RNPerformanceModule extends ReactContextBaseJavaModule {
  PerformanceLoggerStorage logger = new PerformanceLoggerStorage();

  private final ReactApplicationContext reactContext;

  public RNPerformanceModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "RNPerformanceLogger";
  }

    @ReactMethod
    public void logTimeToStorage(String name, String timestamp) {
        logger.addStartTime(name, timestamp);
    }

    @ReactMethod
    public void printLogs() {
        Log.d(":::: Raw Logs: ", logger.getLogs());
    }

    @ReactMethod
    public void generateReport(Promise promise) {

        HashMap<String, HashMap<String, Double>> report =  logger.generateReport();


        WritableMap map = new WritableNativeMap();

        if (report.size() == 0) {
            promise.resolve(map);
        }


        Iterator<Map.Entry<String, HashMap<String, Double>>> iterator = report.entrySet().iterator();

        while (iterator.hasNext()) {
            Map.Entry<String, HashMap<String, Double>> entry = iterator.next();

            String key = entry.getKey();

            Iterator<Map.Entry<String, Double>> value = entry.getValue().entrySet().iterator();

            WritableMap nestedMap = new WritableNativeMap();

            while (value.hasNext()) {

                Map.Entry<String, Double> nestedEntry = value.next();

                String nestedKey = nestedEntry.getKey();
                Double nestedValue = nestedEntry.getValue();

                nestedMap.putDouble(nestedKey, nestedValue);
            }

            map.putMap(key, nestedMap);
        }

        promise.resolve(map);
    }

    @ReactMethod
    public void resetLogs() {
        logger.resetLogs();
    }
}