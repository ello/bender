package co.ello.ElloApp;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.nispok.snackbar.Snackbar;
import com.nispok.snackbar.SnackbarManager;
import com.nispok.snackbar.enums.SnackbarType;
import com.nispok.snackbar.listeners.ActionClickListener;
import com.orhanobut.hawk.Hawk;

public class ReactNativeActivity extends ReactActivity {

    private final static String TAG = ReactNativeActivity.class.getSimpleName();
    private BroadcastReceiver pushReceivedReceiver;
    public static Boolean inBackground = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupPushReceivedReceiver();
    }

    @Override
    protected void onStop() {
        super.onStop();
        inBackground = true;
    }

    @Override
    protected void onResume() {
        super.onResume();
        inBackground = false;
    }

    @Override
    protected void onDestroy() {
        if (pushReceivedReceiver != null) {
            unregisterReceiver(pushReceivedReceiver);
        }
        super.onDestroy();
    }

    @Override
    protected String getMainComponentName() {
        return "Ello";
    }

    private void setupPushReceivedReceiver() {
        pushReceivedReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String title = intent.getExtras().getString("title");
                String body = intent.getExtras().getString("body");
                final String webUrl = intent.getExtras().getString("web_url");

                if (!inBackground && title != null && body != null && webUrl != null ) {
                    // Using a 3rd party Snackbar because we can't extend
                    // AppCompatActivity, thanks a lot XWalkActivity
                    Snackbar snackbar = Snackbar.with(context)
                            .type(SnackbarType.MULTI_LINE)
                            .text(title + " " + body)
                            .actionLabel(R.string.view)
                            .actionListener(new ActionClickListener() {
                                @Override
                                public void onActionClicked(Snackbar snackbar) {
                                    Hawk.put(ElloPreferences.PUSH_PATH_FROM_REACT, webUrl);
                                    finish();
                                }
                            });
                    SnackbarManager.show(snackbar);
                }
            }
        };
        registerReceiver(pushReceivedReceiver, new IntentFilter(ElloPreferences.PUSH_RECEIVED));
    }
}
