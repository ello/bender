package co.ello.ElloApp;

import android.os.Build;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;

import static junit.framework.Assert.assertFalse;
import static junit.framework.Assert.assertTrue;

@Config(constants = BuildConfig.class, sdk = Build.VERSION_CODES.LOLLIPOP)
@RunWith(RobolectricTestRunner.class)
public class ElloURITest {

    // leaving this in for future reference even though it is empty
    @Before
    public void setup() {
    }

    @Test
    public void testShouldLoadInAppSucceeds() {
        assertTrue("https://ello.co should load in app", ElloURI.shouldLoadInApp("https://ello.co"));
        assertTrue("https://ello.ninja should load in app", ElloURI.shouldLoadInApp("https://ello.ninja"));
        assertTrue("https://ello-webapp-epic.herokuapp.com should load in app", ElloURI.shouldLoadInApp("https://ello-webapp-epic.herokuapp.com"));
        assertTrue("https://ello-webapp-rainbow.herokuapp.com should load in app", ElloURI.shouldLoadInApp("https://ello-webapp-rainbow.herokuapp.com"));
        assertTrue("https://ello.co/sean should load in app", ElloURI.shouldLoadInApp("https://ello.co/sean"));
        assertTrue("https://preview.ello.co should load in app", ElloURI.shouldLoadInApp("https://preview.ello.co"));
        assertTrue("/sean should load in app", ElloURI.shouldLoadInApp("/sean"));
    }

    @Test
    public void testShouldLoadInAppFails() {
        assertFalse("https://hello.co should NOT load in app", ElloURI.shouldLoadInApp("https://hello.co"));
        assertFalse("https://www.google.com should NOT load in app", ElloURI.shouldLoadInApp("https://www.google.com"));
        assertFalse("yo/sean should NOT load in app", ElloURI.shouldLoadInApp("yo/sean"));
    }
}
