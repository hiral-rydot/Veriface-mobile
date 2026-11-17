# Turnout Mobile: Functionality and Flow

## 1. Scope and current state

Turnout is an employee attendance and workplace-management application for Android and iOS. It supports employee authentication, attendance capture, leave and request workflows, team and visitor management, workplace administration, push notifications, and offline attendance capture.

This document describes the code currently in the repository. The JavaScript manifest and the native projects are not on one consistent React Native version: `package.json` and `package-lock.json` declare/install React Native `0.86.3`, while Android and the checked-in iOS Podfile lock resolve React Native `0.71.7`. This distinction is important when reproducing or upgrading builds.

## 2. Main functionality and modules

### Application entry and bootstrap

- `index.js` creates the Redux store, attaches `redux-saga`, starts `rootSaga`, wraps the application in `Provider`, and registers the `veriface` component.
- `App.js` creates the React Navigation container, installs the top-level `NavigationService` reference, registers the Firebase background-message handler, and monitors connectivity for offline attendance replay.
- `App.tsx` is the unused React Native template screen. The runtime entry point imports `App.js`.

### Authentication and account

- Login and session handling: `login.js`, `splash.js`, `forgotpwd.js`, `otp-code.js`, and `resetpwd.js`.
- Guest/demo signup and employee registration: `signup-guest.js` and `registration.js`.
- Profile and password management: `profile.js`.
- Authentication state is stored in Redux responses and tokens/profile data are persisted with AsyncStorage.

### Dashboard and attendance

- `dashboard.js` loads dashboard data, profile state, registration status, permissions, and role-based menu options.
- `check-inout.js` captures a camera image, obtains device location, and submits an attendance event.
- `attendance.js`, `attendance-detail.js`, `attendance-history.js`, and `attendance-history-details.js` show current attendance, details, and historical reports.
- `offlineAttendance.js` displays locally queued attendance records.

### Leave and requests

- Leave list, leave types, creation, and detail flow: `leave.js`, `leave-new.js`, and `leave-details.js`.
- Employee requests: `my-request.js`, `request-new.js`, and `request-details.js`.
- Team approval/review flows: `team.js` and `team-request.js`.

### Team, workplace, and visitor operations

- Team views and attendance: `my-team.js`, `team-attendance.js`, and `team-attendance-history.js`.
- Workplace list, tagging, and employee allotment: `workplace.js`, `workplace-tag.js`, and `empAllotment.js`.
- Visitor requests, attendance, history, and QR-related behavior: `visitor-request.js`, `my_visitor.js`, `visitor-attendance.js`, `visitor-attendance-history.js`, `visitor-history.js`, and `qrCodeGenerator.js`.

### Shared support modules

- `src/actions/index.js`: action creators for authentication, profile, dashboard, attendance, leave, request, workplace, team, visitor, and registration operations.
- `src/reducer/index.js`: one large reducer storing request payloads, response objects, loading state, and profile state.
- `src/sagas/index.js`: request workers and `actionChannel` watchers for API operations.
- `src/webservice/api.js`: authenticated JSON and multipart POST helpers, connectivity checks, common headers, response/error handling, and forced navigation to Login for invalid sessions or deleted/inactive companies.
- `src/webservice/constant.js`: API base URL, endpoint constants, storage keys, store URLs, and domain constants.
- `src/utils/storage.js` and `src/utils/utils.js`: persistence and platform utility functions.
- `src/components/`: reusable buttons, loading, overlay, radio, curve, and footer components.
- `src/styles/` and `src/assets/`: shared colors, styles, images, and fonts.
- `src/hooks/fcm/useFcmHook.js`: notification permission, FCM token registration, foreground messages, and notification-open navigation.

## 3. Application flow and screen navigation

### Startup flow

```text
Native application
  -> index.js
  -> Redux Provider + saga middleware
  -> App.js
  -> AppContainer (React Navigation stack)
  -> Login (configured initial route)
```

The stack contains `Splash`, but the configured `initialRouteName` is `Login`. Login success replaces the current route with `Splash`; Splash loads the stored client setting, optionally displays the remote intro image, waits three seconds, and replaces itself with `Dashboard`.

The Splash screen also activates the FCM hook. A notification opened from the background or a cold start navigates to `Attendance`; foreground notifications show an alert.

### Main navigation map

```text
Login
  -> ForgotPwd -> OtpCode -> ResetPwd -> Login
  -> Splash -> Dashboard
  -> Registration
  -> SignupGuest

Dashboard
  -> Profile
  -> CheckInOut
  -> AttendanceHistory -> AttendanceDetail
  -> OfflineAttendance
  -> Leave -> NewLeave
  -> MyRequest -> AddMyRequest / RequestDetails
  -> MyTeam -> TeamAttendance -> AttendanceHistory
  -> Team -> TeamRequest -> NewRequest / RequestDetails
  -> MyVisitor -> VisitorAttendance / VisitorHistory
  -> WorkplaceList -> Employeeallotment
  -> HolisdaysList
  -> AboutUs
  -> Login (logout/reset)
```

The complete stack is declared in `src/navigation/navigations.js`. It uses a single `createStackNavigator` with headers disabled. Navigation is normally performed through screen props; API-level session expiry uses `NavigationService` and a reset action so the user cannot return to an authenticated screen.

### Typical attendance flow

1. Dashboard opens `CheckInOut`.
2. The screen requests camera/location permissions, captures an image, and obtains high-accuracy coordinates.
3. With connectivity, it dispatches `checkinout`; the saga posts the event to the attendance endpoint.
4. Without connectivity, it writes the event to the Realm `Attendance` schema.
5. `App.js` listens for connectivity restoration, reads queued Realm records, dispatches them through the same check-in/out API, and deletes each record after a successful response.

## 4. Current architecture

The project uses a JavaScript-first, legacy React Native architecture:

```text
Screens and hooks
  -> action creators
  -> Redux store
  -> redux-saga action channels
  -> API helper / direct fetch
  -> REST backend
  -> saga response action
  -> reducer state
  -> screen rendering
```

Key characteristics:

- React function components with hooks are used throughout the screens.
- Redux is a single untyped store. There are no typed action or state contracts.
- Redux Saga uses one `actionChannel` watcher per operation and calls API workers serially for each channel.
- Some specialized team and visitor screens bypass the saga layer and call `fetch` directly using `apiUrl`, AsyncStorage tokens, and manually assembled headers.
- React Navigation v5 compatibility APIs are used: `createAppContainer`, `createStackNavigator`, `navigation.state.params`, `navigation.getParam`, `StackActions`, and `NavigationActions`.
- New Architecture is disabled in `android/gradle.properties` (`newArchEnabled=false`).
- Hermes is enabled on Android. The Android native host still contains the React Native 0.71-era template and manual imports, while `PackageList` is also used for autolinking.

## 5. API, Realm database, and native-module flow

### API flow

The active base URL is `https://tavm.it-av.support`. JSON requests use `postWithPayloadwithToken` in `src/webservice/api.js`; registration uses `postWithMultipart`. Requests:

1. Check NetInfo connectivity.
2. Read token, latitude, and longitude from AsyncStorage.
3. Add token, location, app build number, platform, brand, device ID, OS version, and IP address headers.
4. POST JSON or multipart data with `fetch`.
5. Parse the JSON response.
6. Handle common server errors: inactive/deleted company, expired token, unsupported app version, generic API errors, and connectivity failures.

The main saga endpoint groups include authentication, profile, dashboard, attendance, leave, requests, FCM device registration, registration, workplace/allotment, employee/company search, team leave, and specific attendance. Endpoint examples include:

- `/api/cms/auth/signin`
- `/api/cms/dashboard/mobile_dashboard`
- `/api/cms/attendance/employee_attendence_mobile_in_out_multiple_wp`
- `/api/cms/attendance/list`
- `/api/cms/leave-management/create`
- `/api/cms/mobile/request-list`
- `/api/cms/profile/updateDeviceInfo`

Team/visitor screens also directly call endpoints for visitor lists, team dashboards, remarks, change requests, and approval/status updates. This creates two API conventions that should be considered during future refactoring.

### Realm database flow

Realm is used as a local queue, not as the primary application data store. `CheckInOut` opens a Realm containing the `Attendance` schema:

```text
Attendance {
  id: string primary key
  lat: double
  long: double
  image_data: string
  time: string
  timedate: string
}
```

Offline check-ins are written locally. `offlineAttendance.js` reads and displays them. When NetInfo reports a connected and reachable network, `App.js` reads all `Attendance` objects, posts each record with `isOffline: true`, and deletes records after success. There is no visible schema version, migration strategy, retry limit, transaction queue abstraction, or explicit conflict/idempotency mechanism in the current code.

### Native module flow

- Firebase App/Messaging: FCM token acquisition, foreground/background messages, notification-open navigation, and native Android messaging services.
- AsyncStorage: token, profile/client settings, location, FCM marker, and other lightweight persistence.
- NetInfo: connectivity checks and online replay trigger.
- Camera and image tools: attendance/registration/profile images and QR-related features.
- Geolocation and permissions: workplace proximity and attendance coordinates.
- Realm: offline attendance queue.
- Maps, SVG, charts, date pickers, pager/tab view, WebView, share, Snackbar, vector icons, gradients, and device information provide UI and device integrations.

Android declares camera, storage/media, location, internet, and notification permissions. iOS declares camera, location, photo, notification/background, and other legacy usage descriptions in `Info.plist`; only selected permission pods are enabled in the Podfile.

## 6. Versions currently used

### JavaScript manifest and lockfile

The manifest declares:

| Component | `package.json` declaration | Lockfile result where verified |
|---|---:|---:|
| React | `18.2.0` | `18.2.0` |
| React Native | `^0.86.3` | `0.86.3` |
| React Navigation | `^5.0.0` | `5.0.0` |
| React Redux | `^7.2.1` | `7.2.9` |
| Redux Saga | `^1.1.3` | `1.2.3` |
| Realm | `^20.2.0` | `20.2.0` |
| Firebase App/Messaging | `^26.4.0` | package declaration is 26.x |
| React Native Gesture Handler | `^1.7.0` | legacy 1.x declaration |
| Reanimated | `^2.2.0` | legacy 2.x declaration |
| Screens | `^2.18.1` | legacy 2.x declaration |
| Safe Area Context | `^3.4.1` | legacy 3.x declaration |
| NetInfo | `^5.9.6` | legacy 5.x declaration |

Notable lockfile behavior: because several declarations use `^`, the lockfile resolves newer minor/patch versions than the manifest text. The lockfile currently resolves React Native `0.86.3` and its peer dependency metadata expects React `^19.2.3`.

### Native projects

- Android compile SDK: 34.
- Android target SDK: 34.
- Android minimum SDK: 21.
- Android build tools: 34.0.0.
- Android Gradle Plugin: 7.4.2.
- Gradle wrapper: 7.6.3.
- Android NDK: 23.1.7779620.
- Android native React Native/Hermes dependency: explicitly `0.71.7`.
- Android new architecture: disabled.
- Android Hermes: enabled.
- iOS Podfile platform: `12.4`.
- Checked-in `Podfile.lock`: React Native `0.71.7`, RealmJS `11.10.1`, RNFB App/Messaging `15.7.0`, Firebase iOS SDK `9.6.0`.
- iOS Xcode project: application build settings show marketing version `1.0.2`, build `7`, Swift `5.0`; test targets still contain deployment target `10.0`, and other project settings contain `11.0`.

## 7. Supported and compatible versions

There is no single fully supported version matrix encoded by the repository. The most defensible build baseline is the native baseline represented by the checked-in projects:

| Area | Practical compatibility assessment |
|---|---|
| React Native | Native files and Podfile.lock align with `0.71.7`; JavaScript package metadata does not. Use one version consistently before release builds. |
| React | `18.2.0` is appropriate for React Native `0.71.7` and the current test renderer. It is not the peer version expected by the installed React Native `0.86.3` lock entry. |
| React Navigation | Current code is written for React Navigation 5. Keep the v5 package family during maintenance, or migrate the code and packages together to modern `@react-navigation/*`. |
| Realm | Realm `20.2.0` declares React Native `>=0.71.0`, but the iOS lockfile still captures RealmJS `11.10.1`; reinstall CocoaPods after resolving the JS/native version strategy. |
| Android | SDK 34 and min SDK 21 are declared. The old native dependency mix may build only with the project’s existing Gradle/AGP assumptions; it is not a clean RN 0.86 toolchain. |
| iOS | Podfile declares iOS 12.4, which is the effective intended minimum for pods. The Xcode project contains older test/deployment values that should be normalized. |

For a low-risk maintenance build, pin React Native and React to the native `0.71.7`/React 18 generation, regenerate `node_modules`, Android dependencies, and Pods, and test every native module. For a modern upgrade, migrate to the React Native 0.86 toolchain as a coordinated change: React 19.2-compatible packages, the current Gradle plugin/build layout, updated navigation, Firebase, permissions, camera, gesture, Reanimated, screens, and Realm versions, plus a fresh Podfile lock.

## 8. Outdated, deprecated, or incompatible packages/configuration

### Confirmed or high-confidence issues

- `react-navigation@5.0.0` is deprecated in the lockfile. `react-navigation-stack@1.5.3` is also marked deprecated; the replacement is `@react-navigation/native` and `@react-navigation/stack`.
- React Native is internally inconsistent: JavaScript/lockfile `0.86.3` versus Android/iOS native `0.71.7`.
- React `18.2.0` does not satisfy the React Native `0.86.3` peer metadata, which expects React `^19.2.3`.
- `metro-react-native-babel-preset@0.59.0` is far older than both the declared RN 0.86 dependency tree and the native RN 0.71 baseline.
- `react-native-camera@3.x` is an old/deprecated camera library and is a significant risk for modern Android and iOS SDKs.
- `@react-native-firebase/app` and `messaging` are declared at `26.4.0`, while the checked-in iOS lockfile contains RNFB `15.7.0`; the native lockfile is stale relative to the manifest.
- Several native packages are legacy generations relative to RN 0.86: gesture handler 1.x, Reanimated 2.x, screens 2.x, safe-area-context 3.x, NetInfo 5.x, permissions 2.x, and masked-view 0.1.x.
- Android uses deprecated repository/configuration patterns such as `jcenter()`, `react.gradle`, manual native module includes, dynamic `play-services-gcm:12.+`, and old Firebase/Google Play Services versions.
- `MainApplication.java` contains duplicate imports for Reanimated and NetInfo and manually imports packages that may also be autolinked. This should be cleaned during a native upgrade.
- `ios/Info.plist` enables `NSAllowsArbitraryLoads`; the active API URL is HTTPS, so this broad exception should be removed unless a documented HTTP dependency remains.
- Android manifest includes `usesCleartextTraffic="true"` even though the active API URL is HTTPS; this broadens network exposure unnecessarily.
- Sensitive signing values are present in `android/gradle.properties`. They should be rotated and moved to protected CI/local configuration.

### Compatibility risks requiring device/build verification

- `react-native-maps`, `react-native-date-picker`, `react-native-image-picker`, Realm, Firebase, and the camera stack each have native SDK constraints that cannot be proven from JavaScript semver alone.
- The Podfile comments out many manual pods while relying on autolinking; this is correct only if the installed package versions expose compatible podspecs.
- iOS application, test, and Podfile deployment targets are inconsistent.
- API calls are not uniformly centralized, and some direct fetch paths do not visibly share the common timeout/error policy.

## 9. Android and iOS compatibility summary

### Android

The project targets API 34 and supports API 21 or newer according to Gradle. It requests runtime camera, location, notification, and media/storage permissions. Android 13+ notification and media permission behavior is partially handled, but legacy storage permissions and `requestLegacyExternalStorage` remain. The project is not a clean React Native 0.86 Android project because the app module explicitly depends on React Native/Hermes 0.71.7 while npm installs 0.86.3.

### iOS

The Podfile intends iOS 12.4 or newer. The project is portrait-only and has Firebase messaging background modes, camera/location/photo usage descriptions, and manually selected permission pods. The Xcode project retains older deployment settings for tests/other targets, so the final minimum OS should be confirmed in Xcode and normalized across all targets. The Podfile.lock reflects the React Native 0.71.7 ecosystem, not the package.json React Native 0.86.3 declaration.

## 10. Run commands

Run these commands from the project root:

### Start Metro

```bash
npm start
```

### Android

```bash
npm run android
```

Equivalent direct command:

```bash
npx react-native run-android
```

The Android build requires an Android SDK/Android Studio environment, an available emulator or connected device, and the configured Java/Gradle toolchain. The repository declares compile/target SDK 34 and minimum SDK 21.

### iOS

iOS builds require macOS, Xcode, and CocoaPods. Install pods first after dependency installation:

```bash
cd ios
pod install
cd ..
npm run ios
```

Equivalent direct command:

```bash
npx react-native run-ios
```

To select a simulator:

```bash
npx react-native run-ios --simulator="iPhone 15"
```

The iOS project currently intends deployment target 12.4 through the Podfile. Confirm the selected simulator/device and signing configuration in Xcode before a physical-device build.

## 11. Recommended next steps

1. Choose and document one React Native baseline. The current native files point to `0.71.7`; the package manifest points to `0.86.3`.
2. Remove the caret from the chosen React Native version and align React, Metro/Babel, React Native CLI, Hermes, Pods, and Gradle dependencies.
3. Run a clean dependency installation and regenerate `Podfile.lock` and Android generated artifacts from the chosen baseline.
4. Replace deprecated React Navigation packages, preferably as a dedicated migration because the screen API usage is extensive.
5. Replace `react-native-camera` and review permissions for Android 13/14 and current iOS privacy requirements.
6. Consolidate direct `fetch` calls behind the API service, add request timeouts, and centralize authentication/error handling.
7. Add tests for login/session expiry, notification-open navigation, offline Realm queue/replay/deletion, and attendance failure/retry behavior.
8. Remove broad cleartext/ATS exceptions and rotate exposed Android signing credentials.
