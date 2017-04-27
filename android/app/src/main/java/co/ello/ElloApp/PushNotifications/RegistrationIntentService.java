package co.ello.ElloApp.PushNotifications;

import android.app.IntentService;
import android.content.Intent;

import com.orhanobut.hawk.Hawk;

import co.ello.ElloApp.ElloPreferences;

public class RegistrationIntentService extends IntentService {

    private static final String TAG = RegistrationIntentService.class.getSimpleName();

    protected TokenRetriever tokenRetriever = new TokenRetriever(this);

    public RegistrationIntentService() {
        super(TAG);
    }


    @Override
    protected void onHandleIntent(Intent intent) {
        String token = tokenRetriever.getToken();

        Intent registrationComplete = new Intent(ElloPreferences.REGISTRATION_COMPLETE);
        if(token != null) {
            registrationComplete.putExtra("GCM_REG_ID", token);
            Hawk.put(ElloPreferences.SENT_TOKEN_TO_SERVER, true);
        }
        else {
            Hawk.put(ElloPreferences.SENT_TOKEN_TO_SERVER, false);
        }

        sendBroadcast(registrationComplete);
    }
}
