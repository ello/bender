package co.ello.ElloApp;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;

public class ReactNativeActivity extends ReactActivity {

    @Override
    protected String getMainComponentName() {
        return "Ello";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected Bundle getLaunchOptions() {
                Intent intent = getIntent();
                Bundle initialProps = new Bundle();
                initialProps.putString("AUTH_JSON", intent.getExtras().getString("AUTH_JSON"));
                return initialProps;
            }
        };
    }
}
