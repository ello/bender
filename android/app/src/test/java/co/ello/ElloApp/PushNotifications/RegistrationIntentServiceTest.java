package co.ello.ElloApp.PushNotifications;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Build;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowApplication;
import org.robolectric.util.ServiceController;

import javax.inject.Inject;

import co.ello.ElloApp.BuildConfig;
import co.ello.ElloApp.Dagger.TestElloApp;
import co.ello.ElloApp.Dagger.TestNetComponent;
import co.ello.ElloApp.ElloPreferences;

import static junit.framework.Assert.assertEquals;
import static junit.framework.Assert.assertFalse;
import static junit.framework.Assert.assertTrue;
import static org.mockito.Mockito.when;

@Config(constants = BuildConfig.class, sdk = Build.VERSION_CODES.LOLLIPOP)
@RunWith(RobolectricTestRunner.class)
public class RegistrationIntentServiceTest {

    private RegistrationIntentService service;

    @Inject
    protected SharedPreferences sharedPreferences;

    private Intent serviceIntent;

    @Before
    public void setUp() {
        serviceIntent = new Intent(RuntimeEnvironment.application, RegistrationIntentService.class);

        ((TestNetComponent)((TestElloApp) RuntimeEnvironment.application).getNetComponent()).inject(this);
        ShadowApplication.getInstance().startService(serviceIntent);

        ServiceController<RegistrationIntentService> serviceController = Robolectric.buildService(RegistrationIntentService.class);
        serviceController.attach()
                .create()
                .startCommand(0, 1);
        service = serviceController.get();
    }
    
    @Test
    public void testTokenReceived() {
        TokenRetriever tokenRetrieverMock = Mockito.mock(TokenRetriever.class);
        when(tokenRetrieverMock.getToken()).thenReturn("123456");
        service.tokenRetriever = tokenRetrieverMock;
        service.onHandleIntent(serviceIntent);

        Boolean stored = sharedPreferences.getBoolean(ElloPreferences.SENT_TOKEN_TO_SERVER, false);

        assertTrue("Mark token sent to sever if token retrieved", stored);
    }

    @Test
    public void testTokenNotReceived() {
        TokenRetriever tokenRetrieverMock = Mockito.mock(TokenRetriever.class);
        when(tokenRetrieverMock.getToken()).thenReturn(null);
        service.tokenRetriever = tokenRetrieverMock;
        service.onHandleIntent(serviceIntent);

        Boolean stored = sharedPreferences.getBoolean(ElloPreferences.SENT_TOKEN_TO_SERVER, true);

        assertFalse("Mark token NOT sent to sever if token NOT retrieved", stored);
    }

    @Test
    public void testRegistrationCompleteBroadcastReceived() {
        TokenRetriever tokenRetrieverMock = Mockito.mock(TokenRetriever.class);
        when(tokenRetrieverMock.getToken()).thenReturn("123456");
        service.tokenRetriever = tokenRetrieverMock;

        final String[] tokens = new String[1];
        final BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                tokens[0] = intent.getExtras().getString("GCM_REG_ID");
            }
        };
        service.registerReceiver(receiver, new IntentFilter(ElloPreferences.REGISTRATION_COMPLETE));
        service.onHandleIntent(serviceIntent);

        assertEquals(tokens[0], "123456");
        service.unregisterReceiver(receiver);
    }

    @After
    public void tearDown() {}

}
