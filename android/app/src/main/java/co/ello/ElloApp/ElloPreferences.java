package co.ello.ElloApp;

public class ElloPreferences {

    private final static String TAG = ElloPreferences.class.getSimpleName();

    public static final String PUSH_PATH_FROM_REACT = "pushPathFromReact";
    public static final String RELOAD_FROM_REACT = "reloadFromReact";
    public static final String SENT_TOKEN_TO_SERVER = "sentTokenToServer";
    public static final String REGISTRATION_COMPLETE = "registrationComplete";
    public static final String PUSH_RECEIVED = "pushReceived";
    // oddly this is hard coded into react-native-shared-preferences so we need it here
    public static final String PREFERENCES_KEY = "wit_player_shared_preferences";
}
