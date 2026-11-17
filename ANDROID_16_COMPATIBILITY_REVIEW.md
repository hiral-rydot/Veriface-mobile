# Android 16 (API 36) Compatibility Review

**Project:** veriface (React Native)
**Date:** 2026-11-17
**Branch:** `veriface_android15`
**Scope:** Code review + Android 16 (API 36) build/dependency compatibility.

---

## 0. Status update (issues fixed)

The following review findings have been resolved:

- ✅ **AGP 8.7.2 → 8.10.1** (`android/build.gradle`) + removed `android.suppressUnsupportedCompileSdk` (`android/gradle.properties`).
- ✅ **`MainApplication.java`** — `DefaultNewArchitectureEntryPoint.load()` is now guarded by `if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED)`; the `DefaultTurboModuleManagerDelegate` override was removed (the `DefaultReactNativeHost` default provides it).
- ✅ **`MainActivity.java`** — removed the `super.onCreate(null)` workaround (restores normal Activity state restoration).
- ✅ **`react-native-maps`** — pinned `1.29.11` in `package.json`, and regenerated the patch so it contains only the 9 codegen source hunks (build artifacts removed).
- ✅ **`@react-native-community/cli`** — pinned `15.0.1` (was `21.0.0`, which is the RN 0.8x line) and ran `npm install`.

> ⚠️ **New Architecture is now enabled** (`newArchEnabled=true` in
> `gradle.properties`). This is a significant runtime change — see §1.1 below.

---

## 1. Executive summary

The app is already configured to **compile against and target Android 16 (API 36)**:

- `compileSdkVersion = 36`, `targetSdkVersion = 36`, `buildToolsVersion = "36.0.0"`
- `minSdkVersion = 24`, NDK `27.1.12297006` (16 KB page-size capable), Java 17

There was **one genuine Android 16 build-tool gap**: the Android Gradle Plugin was
`8.7.2`, below the minimum required for API 36 (`8.9.0-rc01`), and the project was
hiding the resulting warning with `android.suppressUnsupportedCompileSdk=34,36`.
This review updates AGP to **`8.10.1`** (the first AGP line that fully supports
API 36 without the suppression workaround). No other dependency needed a version
bump for Android 16; all remaining concerns are flagged below as risks (not
version updates).

### 1.1 ⚠️ New Architecture impact (after `newArchEnabled=true`)

Enabling the New Architecture (Fabric + TurboModules + bridgeless) requires every
native module/UI component to be new-arch compatible. Several of this app's
native libraries **predate the New Architecture** and will not work under it:

| Library | Version | New-arch status |
|---|---|---|
| `react-native-camera` | 3.44.3 | ❌ **Old-arch only / abandoned.** Does not support Fabric/TurboModules. The camera feature will break. Migration path: `react-native-vision-camera`. |
| `realm` | 12.15.0 | ⚠️ Deprecated/EOL; new-arch support uncertain — verify before shipping. |
| `react-native-material-dropdown` (git) | old | ❌ Old-arch native UI. |
| `react-native-material-textfield` | old | ❌ Old-arch native UI. |
| `react-native-search-box` | 0.0.20 | ⚠️ Old-arch. |
| `react-native-swipeview` | 1.0.3 | ⚠️ Old-arch. |
| `navigationbar-react-native` | 0.0.5 | ⚠️ Old-arch. |

**Recommendation:** either (a) keep `newArchEnabled=false` until these libraries
are migrated/verified, or (b) proceed with the migration (starting with
`react-native-camera` → `react-native-vision-camera`) and test each screen on a
new-arch build. This is the highest-risk item in the current branch.

---

## 2. Android 16 (API 36) requirements vs. current state

| Requirement | Minimum for API 36 | Current value | Status |
|---|---|---|---|
| `compileSdk` | 36 | 36 | ✅ |
| `targetSdk` | 36 (for Play policy) | 36 | ✅ |
| Android Gradle Plugin | **8.9.0-rc01+** (8.10+ for no warning) | **8.10.1** (was 8.7.2) | ✅ **updated** |
| Gradle | 8.11.1 (for AGP 8.10) | 8.11.1 | ✅ |
| JDK | 17 | 17 (`sourceCompatibility/targetCompatibility 17`) | ✅ |
| SDK Build Tools | 36.0.0 | 36.0.0 | ✅ |
| NDK (16 KB page size) | r27 | 27.1.12297006 | ✅ |
| `minSdk` | ≥ 21 (24 recommended for modern libs) | 24 | ✅ |
| 16 KB page size (Play requirement, targetSdk ≥ 35) | arm64-v8a + x86_64 aligned | RN 0.77.3 supports it | ✅ (see §5) |
| Edge-to-edge (enforced, targetSdk ≥ 35) | handle window insets | `SafeAreaProvider` added in `index.js` | ⚠️ verify per-screen |
| Predictive back | opt in | `android:enableOnBackInvokedCallback="true"` | ✅ |
| Notifications | `POST_NOTIFICATIONS` runtime permission | present + handled in `useFcmHook` | ✅ |
| Media permissions | `READ_MEDIA_*` (API 33+) | present | ✅ |

### Change applied

`android/build.gradle`:

```diff
-        classpath('com.android.tools.build:gradle:8.7.2')
+        classpath('com.android.tools.build:gradle:8.10.1')
```

`android/gradle.properties` (removed the now-unneeded suppression):

```diff
-# Suppress unsupported compileSdk warning for 34/36 on AGP
-android.suppressUnsupportedCompileSdk=34,36
```

**Related/dependent packages were checked and require no change** because they
already meet AGP 8.10.x requirements: Gradle wrapper `8.11.1`, JDK 17, Kotlin
Gradle Plugin `2.0.21`, Build Tools `36.0.0`, NDK `27.1.12297006`, and
`google-services:4.4.2` are all compatible.

> Note: AGP 9.x is *not* recommended here — it would force Gradle 9.x and
> Kotlin 2.2.x, an unnecessary jump for an app still on RN 0.77 / new-arch-off.

---

## 3. Dependency review

### 3.1 Already compatible with API 36 (no change)

These were upgraded earlier in the branch and are current enough for API 36:

- `react-native` 0.77.3 + `react` 18.3.1 (16 KB page-size support)
- `react-native-screens` 3.37.0, `react-native-safe-area-context` 5.11.1
- `react-native-gesture-handler` 2.22.1, `react-native-reanimated` 3.17.5
- `react-native-maps` 1.29.11, `@react-native-firebase/*` 21.14.0
- `react-native-webview` 13.17.0, `react-native-device-info` 14.1.1
- `react-native-image-picker` 7.2.3, `react-native-permissions` 4.1.5

### 3.2 Updated for Android 16

- **`com.android.tools.build:gradle` 8.7.2 → 8.10.1** — the only required change.

### 3.3 Flagged risks (no version-bump path; need migration/verification)

| Dependency | Version | Issue |
|---|---|---|
| `react-native-camera` | 3.44.3 | **Deprecated/unmaintained.** Bundles old native `.so` files whose 16 KB page-size alignment is unverified. No newer version exists — the fix is a migration to `react-native-vision-camera`. |
| `realm` | 12.15.0 | **Deprecated (Atlas Device SDK EOL).** Prebuilt native binary 16 KB alignment is unverified; no newer 12.x release exists. Plan a migration off Realm. |

---

## 4. Code review findings

### 4.1 `MainApplication.java` — new-architecture entry point loaded unconditionally

```java
DefaultNewArchitectureEntryPoint.load(true, false, false);
```

In RN 0.77.3 the signature is
`load(turboModulesEnabled, fabricEnabled, bridgelessEnabled)`, so this call means
`turboModules=true, fabric=false, bridgeless=false` — i.e. **TurboModules-only**
(a deprecated interop mode). It is called **unconditionally even though
`newArchEnabled=false`** in `gradle.properties`, so it force-overrides React
feature flags on an old-architecture build.

**Recommendation:** guard it (or remove it entirely for the old-architecture path):

```java
if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
  DefaultNewArchitectureEntryPoint.load();
}
```

### 4.2 `MainActivity.java` — `super.onCreate(null)`

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
  super.onCreate(null);
}
```

This is a known workaround that discards `savedInstanceState` to avoid a React
Native / `react-native-screens` state-restore crash. It works, but disables
Activity state restoration after process death. Acceptable short-term; document
it and remove once the underlying screens issue is resolved.

### 4.3 `react-native-maps` patch contains generated build artifacts

`patches/react-native-maps+1.29.11.patch` includes files under
`android/build/**` (e.g. `intermediates/.../R.jar`, merged manifests, build logs)
in addition to the real codegen `viewmanagers/*.java` sources. Generated build
output should not be in a patch — it is fragile and bloats the repo.

**Recommendation:** regenerate a clean patch (delete `node_modules/react-native-maps/android/build`
first), and **pin the version** in `package.json` from `^1.20.1` to `1.29.11` so
the patch always matches the installed version.

### 4.4 Toolchain version skew (not Android-16-specific)

`package.json` pins `@react-native-community/cli` `^21.0.0`, while RN 0.77.3's
own CLI line is 15.x. This mismatch is why
`patches/@react-native+community-cli-plugin+0.77.3.patch` exists (it adds `??`
fallbacks because CLI 21's server API moved). Metro `0.81.5` itself is correct
for RN 0.77.3.

**Recommendation:** align `@react-native-community/cli` to the RN 0.77.x line
(15.x) and drop the now-unneeded plugin patch. This is a build-tooling fix, not
an Android 16 requirement.

### 4.5 Positive findings (already handled correctly)

- AsyncStorage migrated from the deprecated `@react-native-community/async-storage`
  to `@react-native-async-storage/async-storage` across screens.
- `react-native-image-picker` 5.x → 7.x API migration (`launchImageLibrary` /
  `launchCamera`, `assets[]`) done correctly in `select-image.js` and `profile.js`,
  including `didCancel`/`assets[0]` guards.
- Notification permission gating uses `Platform.Version >= 33` (correct for
  `POST_NOTIFICATIONS`) instead of the old `DeviceInfo.getSystemVersion()` string
  comparison.
- Storage permission gating uses `Platform.Version <= 32` (correct for the
  scoped-storage change).
- `GestureHandlerRootView` + `SafeAreaProvider` added at the root in `index.js`
  (required for gesture-handler 2.x and edge-to-edge insets).
- Realm patch reduced from a ~262 KB binary patch to a small error-message patch
  (much less fragile).

---

## 5. 16 KB page size — verification note

Google Play requires **new apps and updates targeting Android 15+ (API 35+)** to
support 16 KB page sizes. RN 0.77.3 and NDK r27 are 16 KB-capable, but the
requirement ultimately depends on **every native `.so` in the final APK**.

The two dependencies at risk are `react-native-camera` and `realm` (§3.3). After
building a release, verify alignment of the arm64-v8a libraries, e.g.:

```bash
zipalign -c -P 16 -v 4 app-release.apk
```

(`zipalign` is in `$ANDROID_HOME/build-tools/36.0.0`.) Any library reported as
not 16 KB-aligned must be rebuilt from source or the dependency migrated.

---

## 6. Pending / uncommitted file changes

These changes are currently uncommitted on branch `veriface_android15`:

**Modified (tracked):**

- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/assets/index.android.bundle`
- `android/app/src/main/java/com/veriface/mobile/MainActivity.java`
- `android/app/src/main/java/com/veriface/mobile/MainApplication.java`
- `android/build.gradle` *(AGP 8.7.2 → 8.10.1 — this review)*
- `android/gradle.properties` *(suppression removed — this review)*
- `index.js`
- `package-lock.json`
- `package.json`
- `patches/react-native+0.77.3.patch`
- `patches/realm+12.15.0.patch`
- `src/hooks/fcm/useFcmHook.js`
- `src/screens/check-inout.js`
- `src/screens/dashboard.js`
- `src/screens/login.js`
- `src/screens/offlineAttendance.js`
- `src/screens/profile.js`
- `src/screens/qrCodeGenerator.js`
- `src/screens/select-image.js`
- `src/utils/storage.js`
- `src/webservice/api.js`

**Untracked (new):**

- `android/.kotlin/`
- `android/app/src/main/res/drawable-{hdpi,mdpi,xhdpi,xxhdpi,xxxhdpi}/`
- `patches/@react-native+community-cli-plugin+0.77.3.patch`
- `patches/@react-native-community+image-editor+2.3.0.patch`
- `patches/metro+0.81.5.patch`
- `patches/react-native-maps+1.29.11.patch`

> `android/.kotlin/` and the Gradle `build/` outputs should be git-ignored, not
> committed.

---

## 7. Recommended next steps

1. **Verify the AGP bump** with a clean build:
   `cd android && ./gradlew clean :app:assembleDebug`
   (confirm no "unsupported compileSdk" warning appears).
2. Run a **release build** and the 16 KB `zipalign` check (§5).
3. Decide the fate of `react-native-camera` and `realm` (both deprecated).
4. Fix the `MainApplication` new-arch entry-point guard (§4.1).
5. Clean and pin the `react-native-maps` patch (§4.3).
6. Test on an Android 16 device/emulator: edge-to-edge insets, predictive back,
   notification permission, camera/gallery image pick.

## 8. References

- [Android 16 — Setup SDK](https://developer.android.com/about/versions/16/setup-sdk)
- [Android Gradle plugin release notes](https://developer.android.com/build/releases/gradle-plugin)
- [Android 16 behavior changes (all apps)](https://developer.android.com/about/versions/16/behavior-changes-all)
- [16 KB page sizes](https://developer.android.com/guide/practices/page-sizes)
