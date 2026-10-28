# Android Compatibility

## Project baseline

- React Native: `0.86.3`
- Android compile SDK: `36`
- Android target SDK: `34`
- Android minimum SDK: `24`
- Gradle wrapper: `8.13`
- Android Gradle Plugin: `8.12.0`
- Hermes: enabled

## Package updates

These packages are aligned with React Native 0.86:

| Package | Version | Reason |
| --- | --- | --- |
| `@react-native-community/art` | removed | Unused and incompatible with current React Native Android APIs |
| `react-native-screens` | `4.28.0` | Replaces the old `2.18.1` API usage |
| `react-native-svg` | `15.15.1` | Replaces removed React Native internal API usage |
| `react-native-reanimated` | `4.7.0` | Compatible with React Native 0.86 |
| `react-native-worklets` | `0.13.0` | Required by Reanimated 4 |

`babel.config.js` uses `react-native-worklets/plugin`.

## Installed NDK versions

The following versions were found under `/home/jigneshvaghela/Android/Sdk/ndk`:

- `23.1.7779620` (currently configured, incompatible with Worklets C++20 build)
- `27.0.12077973`
- `27.1.12297006` (recommended)
- `28.2.13676358`
- `30.0.15729638`

Change `android/build.gradle` to the recommended installed version:

```gradle
ndkVersion = "27.1.12297006"
```

No NDK installation is required because the recommended version is already installed.

If it is missing on another machine, install it with:

```bash
sdkmanager "platforms;android-36" "build-tools;35.0.0" "ndk;27.1.12297006" "cmake;3.22.1"
```

## ADB/device requirement

The system currently has an ADB client/server version mismatch. Use the same SDK `platform-tools/adb` for both client and server:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
adb kill-server
adb start-server
adb devices -l
```

The device must appear with state `device`, not `unauthorized` or `offline`.

## Validation commands

Run from the repository root:

```bash
npm install --legacy-peer-deps
cd android
./gradlew app:assembleDebug --no-daemon
cd ..
npm run android
```

Known remaining build blocker before switching NDK: Worklets fails under NDK `23.1.7779620` because its C++20 code uses `std::string` in a `constexpr` function. Use NDK `27.1.12297006` before rebuilding.
