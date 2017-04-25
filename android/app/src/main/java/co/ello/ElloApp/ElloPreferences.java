package co.ello.ElloApp;

public class ElloPreferences {

    private final static String TAG = ElloPreferences.class.getSimpleName();

    public static final String PUSH_PATH_FROM_REACT = "pushPathFromReact";
    public static final String UPDATE_FROM_REACT = "updateFromReact";
    public static final String SENT_TOKEN_TO_SERVER = "sentTokenToServer";
    public static final String REGISTRATION_COMPLETE = "registrationComplete";
    public static final String PUSH_RECEIVED = "pushReceived";
    public static final String IS_STAFF = "isStaff";
    public static final String JS_STATE = "jsState";
    public static final String WEBAPP_DOMAIN = "webappDomain";
    // oddly this is hard coded into react-native-shared-preferences so we need it here
    public static final String PREFERENCES_KEY = "wit_player_shared_preferences";
}
