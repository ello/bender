package co.ello.ElloApp;


import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.orhanobut.hawk.Hawk;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;


public class RNHawkWrapperModule extends ReactContextBaseJavaModule {

    public RNHawkWrapperModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "HawkWrapper";
    }

    @ReactMethod
    public void put(String key, String value, Callback successCallback) {
        Hawk.put(key, value);
        successCallback.invoke();
    }

    @ReactMethod
    public void get(String key, Callback successCallback) {
        String value = Hawk.get(key);
        successCallback.invoke(value);
    }

    @ReactMethod
    public void getItems(ReadableArray keys, Callback successCallback) {
        WritableNativeArray data = new WritableNativeArray();
        for(int i=0; i<keys.size(); i++) {
            String key = keys.getString(i);
            String value = Hawk.get(key);
            data.pushString(value);
        }
        successCallback.invoke(data);
    }

    @ReactMethod
    public void contains(String key, Callback successCallback) {
        boolean value = Hawk.contains(key);
        successCallback.invoke(value);
    }

    @ReactMethod
    public void count(Callback successCallback) {
        long value = Hawk.count();
        successCallback.invoke(value);
    }

    @ReactMethod
    public void delete(String key) {
        Hawk.delete(key);
    }

    @ReactMethod
    public void deleteItems(ReadableArray keys) {
        for(int i=0; i<keys.size(); i++) {
            String key = keys.getString(i);
            Hawk.delete(key);
        }
    }

    @ReactMethod
    public void deleteAll(){
        Hawk.deleteAll();
    }
}
