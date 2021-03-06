package co.ello.ElloApp;

import android.Manifest;
import android.app.ProgressDialog;
import android.content.BroadcastReceiver;
import android.content.ComponentCallbacks2;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.drawable.ColorDrawable;
import android.hardware.SensorManager;
import android.net.ConnectivityManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AlertDialog;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.ValueCallback;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.nispok.snackbar.Snackbar;
import com.nispok.snackbar.SnackbarManager;
import com.nispok.snackbar.enums.SnackbarType;
import com.nispok.snackbar.listeners.ActionClickListener;
import com.orhanobut.hawk.Hawk;
import com.squareup.seismic.ShakeDetector;

import org.xwalk.core.JavascriptInterface;
import org.xwalk.core.XWalkActivity;
import org.xwalk.core.XWalkPreferences;
import org.xwalk.core.XWalkResourceClient;
import org.xwalk.core.XWalkUIClient;
import org.xwalk.core.XWalkView;

import java.util.Date;

import co.ello.ElloApp.PushNotifications.RegistrationIntentService;
import hotchemi.android.rate.AppRate;
import hotchemi.android.rate.OnClickButtonListener;

// Using a 3rd party Snackbar because we can't extend
// AppCompatActivity, thanks a lot XWalkActivity
public class MainActivity
        extends XWalkActivity
        implements SwipeRefreshLayout.OnRefreshListener, ShakeDetector.Listener
{
    private final static String TAG = MainActivity.class.getSimpleName();
    private final static int MY_PERMISSIONS_REQUEST_CAMERA = 333;

    protected Reachability reachability;

    private static final int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;
    public static Boolean inBackground = true;
    public XWalkView xWalkView;
    private ElloUIClient xWalkClient;
    private SwipeRefreshLayout swipeLayout;
    public String elloDomain;
    public String authDomain;
    public String clientId;
    public String clientSecret;
    private ProgressDialog progress;
    private Boolean shouldReload = false;
    private Boolean webAppReady = false;
    private Boolean isDeepLink = false;
    private BroadcastReceiver registerDeviceReceiver;
    private BroadcastReceiver pushReceivedReceiver;
    private Boolean isXWalkReady = false;
    private Date lastReloaded;
    private SensorManager sensorManager;
    private ShakeDetector shakeDetector;
    private Boolean showingWebappDomainDialog = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Hawk.init(getApplicationContext()).build();

        elloDomain = Hawk.get(ElloPreferences.WEBAPP_DOMAIN, BuildConfig.PROD_ELLO_DOMAIN);
        authDomain = Hawk.get(ElloPreferences.WEBAPP_AUTH_DOMAIN, BuildConfig.PROD_AUTH_DOMAIN);
        clientId = Hawk.get(ElloPreferences.WEBAPP_AUTH_CLIENT_ID, BuildConfig.PROD_AUTH_CLIENT_ID);
        clientSecret = Hawk.get(ElloPreferences.WEBAPP_AUTH_CLIENT_SECRET, BuildConfig.PROD_AUTH_CLIENT_SECRET);

        ConnectivityManager manager = (ConnectivityManager) getApplication().getSystemService(Context.CONNECTIVITY_SERVICE);
        reachability = new Reachability(manager);

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        shakeDetector = new ShakeDetector(this);
        registerSensorListener();

        lastReloaded = new Date();
        setContentView(R.layout.activity_main);
        swipeLayout = (SwipeRefreshLayout) findViewById(R.id.container);
        swipeLayout.setOnRefreshListener(this);

        setupWebView();
        setupRegisterDeviceReceiver();
        setupPushReceivedReceiver();
    }

    protected void onXWalkReady() {
        isXWalkReady = true;
        xWalkView.getSettings().setUserAgentString(userAgentString());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            if (0 != (getApplicationInfo().flags &= ApplicationInfo.FLAG_DEBUGGABLE)){
                XWalkPreferences.setValue(XWalkPreferences.REMOTE_DEBUGGING, true);
            }
        }

        xWalkView.addJavascriptInterface(this, "AndroidInterface");
        displayScreenContent();
        deepLinkWhenPresent();
        setupRatePrompt();
    }

    @Override
    public void onRefresh() {
        if(!reachability.isNetworkConnected()) {
            displayScreenContent();
        }
        if(isXWalkReady) {
            reloadXWalk();
            progress.show();
        }
        swipeLayout.setRefreshing(false);
    }

    @Override
    protected void onStop() {
        super.onStop();
        inBackground = true;
    }

    @Override
    protected void onResume() {
        super.onResume();
        String updateFromReact = Hawk.get(ElloPreferences.UPDATE_FROM_REACT, null);
        if(updateFromReact != null && updateFromReact.equals("true")) {
            updateWebappState();
            Hawk.delete(ElloPreferences.UPDATE_FROM_REACT);
        }

        if(shouldHardRefresh()) {
            shouldReload = true;
            progress.show();
        }

        inBackground = false;
        if(isXWalkReady) {
            xWalkView.resumeTimers();
            xWalkView.onShow();
            registerForGCM();
        }

        if(!reachability.isNetworkConnected() || xWalkView == null) {
            displayScreenContent();
        }
        else if(shouldReload && isXWalkReady) {
            shouldReload = false;
            reloadXWalk();
        }

        registerSensorListener();
        deepLinkWhenPresent();
    }

    private void registerSensorListener() {
        shakeDetector.start(sensorManager);
    }

    private void unregisterSensorListener() {
        shakeDetector.stop();
    }

    private boolean shouldHardRefresh() {
        Date now = new Date();
        Date thirtyMinutesFromLastReloaded = new Date(lastReloaded.getTime() + (30 * 60 * 1000));
        return now.compareTo(thirtyMinutesFromLastReloaded) > 0;
    }

    private void reloadXWalk() {
        lastReloaded = new Date();
        xWalkView.reload(XWalkView.RELOAD_IGNORE_CACHE);
    }

    protected boolean cameraGranted() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED;
    }

    protected boolean writeExternalGranted() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                == PackageManager.PERMISSION_GRANTED;
    }

    protected boolean checkPermissions() {
        if (!cameraGranted() || !writeExternalGranted()) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.CAMERA,
                            Manifest.permission.WRITE_EXTERNAL_STORAGE},
                    MY_PERMISSIONS_REQUEST_CAMERA);
        } else {
            return true;
        }
        return false;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           String permissions[], int[] grantResults) {
        switch (requestCode) {
            case MY_PERMISSIONS_REQUEST_CAMERA: {
                // If request is cancelled, the result arrays are empty.
                if (grantResults.length > 0) {

                    if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                        xWalkClient.openFileChooser();
                    }
                    else if (grantResults[0] == PackageManager.PERMISSION_DENIED) {

                        if (ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.this, Manifest.permission.CAMERA)) {
                            Alert.showCameraDenied(MainActivity.this);
                        }
                        else {
                            Alert.showCameraDenied(MainActivity.this);
                        }
                    }
                }
                return;
            }
        }
    }

    @Override
    protected void onPause() {
        if (isXWalkReady) {
            xWalkView.pauseTimers();
            xWalkView.onHide();
        }
        super.onPause();
        unregisterSensorListener();
    }

    @Override
    protected void onDestroy() {
        xWalkView.onDestroy();
        if (registerDeviceReceiver != null) {
            unregisterReceiver(registerDeviceReceiver);
        }
        if (pushReceivedReceiver != null) {
            unregisterReceiver(pushReceivedReceiver);
        }
        super.onDestroy();
    }

    @Override
    public void onTrimMemory(int level) {
        super.onTrimMemory(level);
        if (level >= ComponentCallbacks2.TRIM_MEMORY_MODERATE) {
            shouldReload = true;
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        Uri data = intent.getData();
        if (data != null) {
            elloDomain = data.toString();
            isDeepLink = true;
        }

        if (isXWalkReady) {
            xWalkView.onNewIntent(intent);
        }
    }

    @JavascriptInterface
    public void webAppLoaded() {
        webAppReady = true;
        if (progress != null) {
            progress.dismiss();
        }
        registerForGCM();
    }

    @JavascriptInterface
    public void setIsStaff(String isStaffString) {
        Boolean isStaff = isStaffString.equals("true");
        Hawk.put(ElloPreferences.IS_STAFF, isStaff);
    }

    @JavascriptInterface
    public void launchEditor(String jsState, String post, String isComment, String comment) {
        if (webAppReady) {
            Hawk.put(ElloPreferences.JS_STATE, jsState);
            Hawk.put(ElloPreferences.WEBAPP_AUTH_DOMAIN, authDomain);
            Hawk.put(ElloPreferences.WEBAPP_AUTH_CLIENT_ID, clientId);
            Hawk.put(ElloPreferences.WEBAPP_AUTH_CLIENT_SECRET, clientSecret);
            Hawk.put("comment", comment);
            Hawk.put("isComment", isComment);
            Hawk.put("post", post);
            Hawk.put("initialRoute", "editor");
            Intent intent = new Intent(this, ReactNativeActivity.class);
            startActivity(intent);
        }
    }

    @JavascriptInterface
    public void launchEditor(String jsState, String post, String isComment, String comment, String text) {
        if (webAppReady) {
            Hawk.put("text", text);
            this.launchEditor(jsState, post, isComment, comment);
        }
    }

    @JavascriptInterface
    public void launchImagePicker(String jsState, String kind) {
        if (webAppReady) {
            Hawk.put(ElloPreferences.JS_STATE, jsState);
            Hawk.put(ElloPreferences.WEBAPP_AUTH_DOMAIN, authDomain);
            Hawk.put(ElloPreferences.WEBAPP_AUTH_CLIENT_ID, clientId);
            Hawk.put(ElloPreferences.WEBAPP_AUTH_CLIENT_SECRET, clientSecret);
            Hawk.put("kind", kind);
            Hawk.put("initialRoute", "imagePicker");
            Intent intent = new Intent(this, ReactNativeActivity.class);
            startActivity(intent);
        }
    }

    private void updateWebappState() {
        String jsState = Hawk.get(ElloPreferences.JS_STATE);
        String updateStateFunctionCall = "javascript:updateStateFromNative(" + jsState + ")";
        Hawk.delete(ElloPreferences.JS_STATE);
        if(jsState != null) {
            xWalkView.load(updateStateFunctionCall, null);
        }
    }

    private void track(String name) {
        if(name != null && isXWalkReady) {
            String trackFunctionCall =
                    "javascript:trackAndroidEvent(\"" + name + "\")";
            xWalkView.load(trackFunctionCall, null);
        }
    }

    private void setupRegisterDeviceReceiver() {
        registerDeviceReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Bundle extras = intent.getExtras();
                if (extras == null) { return; }
                String reg_id = extras.getString("GCM_REG_ID");
                if(reg_id != null) {
                    String registerFunctionCall =
                        "javascript:registerAndroidNotifications(\"" +
                                reg_id + "\", \"" +
                                packageName() + "\", \"" +
                                versionName() + "\", \"" +
                                versionCode() + "\")";
                    xWalkView.load(registerFunctionCall, null);
                }
            }
        };

        registerReceiver(registerDeviceReceiver, new IntentFilter(ElloPreferences.REGISTRATION_COMPLETE));
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
                                    MainActivity.this.xWalkView.load(webUrl, null);
                                }
                            });
                    SnackbarManager.show(snackbar);
                }
            }
        };
        registerReceiver(pushReceivedReceiver, new IntentFilter(ElloPreferences.PUSH_RECEIVED));
    }

    private void setupRatePrompt(){
        AppRate.with(this)
            .setInstallDays(7)
            .setLaunchTimes(3)
            .setRemindInterval(7)
            .setShowLaterButton(true)
            .setOnClickButtonListener(new OnClickButtonListener() {
                @Override
                public void onClickButton(int which) {
                    switch (which) {
                        case -1: track("rate prompt user attempted to rate app");
                            break;
                        case -2: track("rate prompt user declined to rate app");
                            break;
                        case -3: track("rate prompt remind me later");
                            break;
                        default:
                                break;
                    }
                }
            })
            .monitor();

        Boolean showRateDialog = AppRate.showRateDialogIfMeetsConditions(this);
        if(showRateDialog) {
            track("rate prompt shown");
        }
    }

    private void deepLinkWhenPresent(){
        if (progress == null) {
            progress = createProgressDialog(MainActivity.this);
        }

        Uri data = getIntent().getData();
        Intent get = getIntent();
        String webUrl = get.getStringExtra("web_url");
        String webURLFromReact = Hawk.get(ElloPreferences.PUSH_PATH_FROM_REACT, null);

        if (webURLFromReact != null) {
            elloDomain = webURLFromReact;
            Hawk.put(ElloPreferences.PUSH_PATH_FROM_REACT, null);
            isDeepLink = true;
        }
        if (isXWalkReady && webUrl != null) {
            elloDomain = webUrl;
            loadPage(elloDomain);
        } else if (isXWalkReady && data != null) {
            elloDomain = data.toString();
            getIntent().setData(null);
            loadPage(elloDomain);
        } else if (isXWalkReady && isDeepLink) {
            isDeepLink = false;
            loadPage(elloDomain);
        }
    }

    private void loadPage(String page) {
        xWalkView.load(page, null);
        progress.show();
    }

    private void displayScreenContent() {
        if(reachability.isNetworkConnected()) {
            loadPage(elloDomain);
        } else {
            setupNoInternetView();
        }
    }

    private void setupNoInternetView() {
        Intent intent = new Intent(this, NoInternetActivity.class);
        startActivity(intent);
        finish();
    }

    private void setupWebView() {
        xWalkView = (XWalkView) findViewById(R.id.activity_main_webview);
        xWalkView.setResourceClient(new ElloResourceClient(xWalkView));
        xWalkClient = new ElloUIClient(xWalkView);
        xWalkView.setUIClient(xWalkClient);
    }

    private String versionName() {
        PackageInfo pInfo;
        String versionName = "";
        try {
            pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            versionName = pInfo.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return versionName;
    }

    private String versionCode() {
        PackageInfo pInfo;
        String versionCode = "";
        try {
            pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            versionCode = Integer.valueOf(pInfo.versionCode).toString();
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return versionCode;
    }

    private String packageName() {
        PackageInfo pInfo;
        String packageName = "";
        try {
            pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            packageName = pInfo.packageName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return packageName;
    }

    private String userAgentString() {
        return xWalkView.getSettings().getUserAgentString() + " Ello Android/" + versionName() + " (" + versionCode() + ")";
    }

    private ProgressDialog createProgressDialog(Context mContext) {
        ProgressDialog dialog = new ProgressDialog(mContext);
        try {
            dialog.show();
        } catch (WindowManager.BadTokenException e) {}
        dialog.setCancelable(false);
        dialog.getWindow().setBackgroundDrawable(new ColorDrawable(android.graphics.Color.TRANSPARENT));
        dialog.setContentView(R.layout.progress_dialog);
        return dialog;
    }

    private boolean checkPlayServices() {
        GoogleApiAvailability apiAvailability = GoogleApiAvailability.getInstance();
        int resultCode = apiAvailability.isGooglePlayServicesAvailable(this);
        if (resultCode != ConnectionResult.SUCCESS) {
            if (apiAvailability.isUserResolvableError(resultCode)) {
                apiAvailability.getErrorDialog(this, resultCode, PLAY_SERVICES_RESOLUTION_REQUEST)
                        .show();
            } else {
                Log.i(TAG, "This device is not supported.");
                finish();
            }
            return false;
        }
        return true;
    }

    private void registerForGCM() {
        if (checkPlayServices() && webAppReady) {
            Intent intent = new Intent(this, RegistrationIntentService.class);
            startService(intent);
        }
    }

    class ElloResourceClient extends XWalkResourceClient {

        public ElloResourceClient(XWalkView xwalkView) {
            super(xwalkView);
        }

        @Override
        public boolean shouldOverrideUrlLoading(XWalkView view, String url) {
            if (ElloURI.shouldLoadInApp(url)) {
                return false;
            }
            else {
                MainActivity.this.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                return true;
            }
        }
    }

    // ShakeDetector.Listener methods, should only be available to staff users
    public void hearShake() {
        Boolean isStaff = Hawk.get(ElloPreferences.IS_STAFF, false);
        if (isStaff && !showingWebappDomainDialog) {
            launchWebappDomainDialog();
        }
    }

    protected void launchWebappDomainDialog() {
        showingWebappDomainDialog = true;
        AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(this);
        final CharSequence[] domainNames = {"Stage 1", "Stage 2", "Ninja", "Prod"};
        final String[] webappDomains = {BuildConfig.STAGE_1_ELLO_DOMAIN,
                BuildConfig.STAGE_2_ELLO_DOMAIN, BuildConfig.NINJA_ELLO_DOMAIN, BuildConfig.PROD_ELLO_DOMAIN};
        final String[] webappAuthDomains = {BuildConfig.STAGE_1_AUTH_DOMAIN,
                BuildConfig.STAGE_2_AUTH_DOMAIN, BuildConfig.NINJA_AUTH_DOMAIN, BuildConfig.PROD_AUTH_DOMAIN};
        final String[] webappClientIds = {BuildConfig.STAGE_1_AUTH_CLIENT_ID,
                BuildConfig.STAGE_2_AUTH_CLIENT_ID, BuildConfig.NINJA_AUTH_CLIENT_ID, BuildConfig.PROD_AUTH_CLIENT_ID};
        final String[] webappClientSecrets = {BuildConfig.STAGE_1_AUTH_CLIENT_SECRET,
                BuildConfig.STAGE_2_AUTH_CLIENT_SECRET, BuildConfig.NINJA_AUTH_CLIENT_SECRET, BuildConfig.PROD_AUTH_CLIENT_SECRET};
        alertDialogBuilder.setItems(domainNames, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int which) {
                elloDomain = webappDomains[which];
                authDomain = webappAuthDomains[which];
                clientId = webappClientIds[which];
                clientSecret = webappClientSecrets[which];
                Hawk.put(ElloPreferences.IS_STAFF, false);
                Hawk.put(ElloPreferences.WEBAPP_DOMAIN, elloDomain);
                Hawk.put(ElloPreferences.WEBAPP_AUTH_DOMAIN, authDomain);
                Hawk.put(ElloPreferences.WEBAPP_AUTH_CLIENT_ID, clientId);
                Hawk.put(ElloPreferences.WEBAPP_AUTH_CLIENT_SECRET, clientSecret);
                showingWebappDomainDialog = false;
                loadPage(elloDomain);
            }
        });
        alertDialogBuilder.setCancelable(false);
        alertDialogBuilder.create().show();
    }

    class ElloUIClient extends XWalkUIClient {
        public ElloUIClient(XWalkView xwalkView) {
            super(xwalkView);
        }

        private XWalkView view;
        private ValueCallback<Uri> uploadMsg;
        private String acceptType;
        private String capture;

        @Override
        public void openFileChooser(
                XWalkView view,
                ValueCallback<Uri> uploadMsg,
                String acceptType,
                String capture)
        {
            boolean hasPermission = checkPermissions();
            if(hasPermission) {
                super.openFileChooser(view, uploadMsg, acceptType, capture);
            }
            else {
                this.view = view;
                this.uploadMsg = uploadMsg;
                this.acceptType = acceptType;
                this.capture = capture;
            }
        }

        public void openFileChooser() {
            this.openFileChooser(this.view, this.uploadMsg, this.acceptType, this.capture);
        }

    }
}
