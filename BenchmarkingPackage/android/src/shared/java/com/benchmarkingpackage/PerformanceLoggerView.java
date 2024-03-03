package com.benchmarkingpackage;

import android.content.Context;
import android.graphics.Canvas;
import android.os.SystemClock;
import android.util.Log;
import android.view.View;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class PerformanceLoggerView extends View {

    String tagName = "";
    ReactApplicationContext reactApplicationContext;

    PerformanceLoggerViewManagerImpl impl = new PerformanceLoggerViewManagerImpl();
    
    public PerformanceLoggerView(Context context) {
        super(context);
    }

    public void onDraw(Canvas canvas) {
        super.onDraw(new Canvas());

        if(getParent() != null) {
            impl.onDraw(tagName);
            // this.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            //         .emit("onDrawComplete", this.tagName);
        }

    }
}
