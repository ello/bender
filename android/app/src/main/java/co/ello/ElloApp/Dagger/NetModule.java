package co.ello.ElloApp.Dagger;

import android.app.Application;
import android.content.Context;
import android.net.ConnectivityManager;

import javax.inject.Singleton;

import co.ello.ElloApp.Reachability;
import dagger.Module;
import dagger.Provides;

@Module
public class NetModule {

    private final ElloApp application;

    public NetModule(ElloApp application) {
        this.application = application;
    }

    @Provides
    @Singleton
    ConnectivityManager providesConnectivityManager(Application application) {
        return (ConnectivityManager) application.getSystemService(Context.CONNECTIVITY_SERVICE);
    }

    @Provides
    @Singleton
    Reachability providesReachability(ConnectivityManager manager) {
        return new Reachability(manager);
    }
}
