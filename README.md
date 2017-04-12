![Ello + Android = Love](https://cloud.githubusercontent.com/assets/12459/13925727/0dc96a7a-ef4f-11e5-9fb0-b23a73551e7f.jpg)

# Bender
Ello's open source Android app

The app is a very simple wrapper around our React based web application. We handle a few of the rough edge cases but leave nearly all the functionality of the web app intact. Over time we will likely move portions of the experience over to native Android UI.

## Notes

When creating the apk to upload to the Google Play Store it must be aligned.
`zipalign -f -v 4 app-release-unaligned.apk app-release-aligned.apk`

### Google Cloud Messages
There are two GCM applications, production and staging. API token registration on production links the device token to production, API token registrations on staging servers links the device token to staging.

To test GCM in development use AWS' [Publish a message](https://console.aws.amazon.com/sns/v2/home?region=us-east-1#/publish) tool. 
* Find the target ARN by searching for your device token in the corresponding SNS application's endpoint list
* Use JSON as the message format
* Bender expects a `body`, `title` and `web_url` paramaters in the payload.
```
{
"GCM":"{\"data\":{\"title\":\"Fake Title\",\"body\":\"fake body\",\"web_url\":\"http://fake.url\"}}"
}
```

This project was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).

Below you'll find information about performing common tasks. The most recent version of this guide is available [here](https://github.com/react-community/create-react-native-app/blob/master/react-native-scripts/template/README.md).

## Project Setup

* Make sure you have yarn installed `brew install yarn`
* Run `yarn`
* Get a correct `.env` setup and update for the server you want to test against
* Connect an android device in debug mode to your machine or launch an emulator
* Run `yarn android`
* If you see an error about the target SDK being off you may need to go and
  update the build.gradle files for the associated 3rd party projects to match
  your main app's buildToolsVersion in your project's build.gradle and run `yarn
  android` again
* You might get asked to allow overlays when initially launching the react
  native view.. you should allow this and then hit back to get to the actual
  view underneath.
* While in a React Native view, shake the device or press `cmd+m` on the emulator
  to launch the react-native debug tools. We recommend using Live Reload and the
  remote JS debugger.

## Generating a signed APK for the play store
* Follow the instructions in the `ello-android-release-key.keystore` entry in the 1Password Engineering vault
* Copy the `ello-android-release-key.keystore` file from related items in the 1Password note above to your `bender/android/app` direcotry.
* Add keys to `~/.gradle/gradle.properties`
  - ELLO_RELEASE_STORE_FILE=XXXXXX
  - ELLO_RELEASE_KEY_ALIAS=XXXXXX
  - ELLO_RELEASE_STORE_PASSWORD=XXXXXX
  - ELLO_RELEASE_KEY_PASSWORD=XXXXXX
* From the root of this project `cd android && ./gradlew assembleRelease`
