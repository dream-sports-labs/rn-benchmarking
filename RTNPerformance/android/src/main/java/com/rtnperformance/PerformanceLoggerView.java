package com.rtnperformance;

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
    PerformanceLoggerStorage logger = new PerformanceLoggerStorage();
    
    public PerformanceLoggerView(Context context) {
        super(context);
    }

    public void onDraw(Canvas canvas) {
        super.onDraw(new Canvas());

        if(getParent() != null) {
            String endTime = String.valueOf(System.currentTimeMillis());
            logger.addEndTime(tagName, endTime);
            this.reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onDrawComplete", this.tagName);
        }

    }
}
