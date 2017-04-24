package co.ello.ElloApp.Dagger;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.horcrux.svg.SvgPackage;
import com.imagepicker.ImagePickerPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;

import java.util.Arrays;
import java.util.List;

import co.ello.ElloApp.BuildConfig;
import co.ello.ElloApp.RNHawkWrapperPackage;
import in.sriraman.sharedpreferences.RNSharedPreferencesReactPackage;

public class ElloApp extends Application implements ReactApplication {

    private NetComponent netComponent;

    @Override
    public void onCreate() {
        super.onCreate();

        netComponent = DaggerNetComponent.builder()
                .appModule(new AppModule(this))
                .netModule(new NetModule(this))
                .build();

        SoLoader.init(this, /* native exopackage */ false);
    }
    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new ReactNativeConfigPackage(),
                    new ImagePickerPackage(),
                    new SvgPackage(),
                    new RNSharedPreferencesReactPackage(),
                    new RNHawkWrapperPackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    public NetComponent getNetComponent() {
        return netComponent;
    }
}
