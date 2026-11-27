# One-Man Team: app shell for Android and iOS

An Expo app (SDK 58, React Native 0.88) with one screen: a full-screen WebView that runs the game from
`../one-man-team/`, fully offline. The same project builds for Google Play and for the App Store. The shell adds
what a web page cannot do on its own: it keeps the save in native storage, turns the game's vibration requests into
real haptics, handles the Android back button, pauses when the app is backgrounded, and opens outside links in the
system browser.

No navigation library, no state library. The whole shell is `App.tsx` plus four small files in `src/`.

Store paperwork lives in `store/`: `release-checklist.md` (every step and every decision, in order, for both
stores), `app-store-listing.md`, `play-store-listing.md`, the graphics and `screenshots/`.

---

## READ THIS FIRST: two identifiers are permanent

`app.json` sets both of these to **`com.ollywoodgames.onemanteam`**. That is a PLACEHOLDER until you confirm it.

| Store | Field in `app.json` | Becomes permanent |
| --- | --- | --- |
| Google Play | `android.package` | at the first upload of any build to Play Console |
| App Store | `ios.bundleIdentifier` | when the first build is uploaded to App Store Connect (Apple's help page: "You can't change this property after you upload a build") |

**Neither can ever be changed afterwards, not even if the game is renamed.** A different identifier is a different
app, with a new listing, no reviews and no installs carried over.

Before the first `eas build --profile production` for either platform:

1. Decide the identifier (lowercase, dots, no hyphens or underscores, so that one string is valid for both stores).
   Check it against your other titles so the studio prefix is the same everywhere. The two stores may use the same
   string, and usually do.
2. If it changes, edit `android.package` and `ios.bundleIdentifier` in `app.json` and the two matching lines in
   `tests/shell.test.js`.
3. Do not upload anything to either store until you are sure.

The display name ("One-Man Team") is a different thing and can be changed at any time; see "Where the name lives".

---

## From a fresh Codespace to an Android preview APK

Everything runs from the `app/` folder. A Codespace (Linux) is enough for both platforms.

```bash
cd app
npm ci                      # installs exactly what package-lock.json pins
npm run sync-game           # rebuilds the game into src/game-html.js (needs python3)
npm run check               # typecheck + lint + tests; must pass before any build
npm run check-native        # generates both native projects in a scratch folder and checks the manifests

npm install -g eas-cli      # once per Codespace
eas login                   # your Expo account
eas init                    # once ever: creates the EAS project and links it (see note below)

eas build --profile preview --platform android
```

The last command builds in Expo's cloud and finishes with a link and a QR code. Open it on the phone, download the
APK and install it (allow "install unknown apps" for the browser when asked). This APK is a release build signed with
the same keystore as the store build, so it installs over itself and behaves like the real thing.

Note on `eas init`: it stores `extra.eas.projectId` (and `owner`) in the config. Because this project also has an
`app.config.js`, the CLI may not be able to write it for you and will print the lines to paste into `app.json`
under `expo`. Commit that change.

## From a fresh Codespace to a TestFlight build

You need a paid Apple Developer Program membership and an app record in App Store Connect first; those are steps
A1 to A6 in `store/release-checklist.md` and only you can do them. Then, in the same Codespace:

```bash
cd app
npm ci && npm run sync-game && npm run check && npm run check-native
git add -A && git commit -m "iOS 1.0.0 (1)"          # EAS builds what is committed

eas build --profile production --platform ios        # asks for your Apple ID; let EAS manage signing
eas submit --profile production --platform ios       # uploads the finished build to App Store Connect
```

- `eas build` signs in to Apple with your Apple ID (two-factor code included), registers the bundle identifier if
  needed, and creates the distribution certificate and provisioning profile. Say yes to each; EAS stores them.
- `eas submit` reads `submit.production.ios` in `eas.json`. It ships with three placeholders
  (`REPLACE_WITH_YOUR_APPLE_ID_EMAIL`, `REPLACE_WITH_APP_STORE_CONNECT_APP_ID`, `REPLACE_WITH_APPLE_TEAM_ID`).
  Until you replace them the command stops and names them; builds are not affected.
- After the upload Apple processes the build for ten minutes to half an hour. It then appears under TestFlight in
  App Store Connect. Add yourself as an internal tester, install Apple's TestFlight app on the iPhone, and install
  the build from there. Internal testers need no review.
- **Every upload needs a higher `ios.buildNumber`** in `app.json` ("1", "2", "3" ...). `version` is shared with
  Android.

### What needs a Mac, and what EAS does in the cloud

| Task | Where it runs | Mac needed |
| --- | --- | --- |
| Compiling the iOS app (Xcode) | EAS Build, on Expo's Macs | No |
| Signing: certificate, provisioning profile | EAS, using your Apple login | No |
| Uploading to App Store Connect / TestFlight | `eas submit`, from the Codespace | No |
| Every App Store Connect form | A browser | No |
| Installing on an iPhone | TestFlight app, or the link from a `preview` build | No (an iPhone, yes) |
| Running in the iOS Simulator | `development-simulator` build + Xcode's Simulator | **Yes** |
| Inspecting the web view (Safari Web Inspector) | Safari on a Mac, cable to the iPhone, development build | **Yes** |
| Reading native crash logs | Xcode Organizer, or the Feedback section of TestFlight in a browser | Xcode: yes. TestFlight feedback: no |

So a Mac is useful for debugging and is not on the path to release.

### Other iOS builds

```bash
eas device:create                                          # once per iPhone: registers it for direct installs
eas build --profile preview --platform ios                 # release build installed from a link, no TestFlight
eas build --profile development --platform ios             # dev client for a registered iPhone
eas build --profile development-simulator --platform ios   # dev client for the Simulator (needs a Mac to run)
```

`preview` on iOS is "ad hoc" distribution: it installs only on iPhones registered with `eas device:create` before
the build was made. Use it when you want a build on your own phone without waiting for Apple's processing;
use TestFlight for anyone else.

### A development build (optional)

Only needed when you want to change the shell itself with live reload:

```bash
eas build --profile development --platform android     # install the APK once (or --platform ios, see above)
npm start -- --tunnel                                  # then open the dev build and scan the QR code
```

`npm start` runs `sync-game` first. Edits to the game need `npm run sync-game` and a reload (press `r`).
In a development build, the Android WebView can be inspected from desktop Chrome at `chrome://inspect`, and the
iOS one from Safari's Develop menu on a Mac (iOS 16.4 or later).

## To a production AAB and Google Play

```bash
npm run sync-game && npm run check
git add -A && git commit -m "Release 1.0.0 (1)"        # EAS builds what is committed
eas build --profile production --platform android      # produces a signed .aab
```

- **First release:** download the `.aab` from the build page and upload it by hand in Play Console (Testing, then
  Internal testing, then Create new release). Google requires the first upload of a new app to be manual.
- **Later releases:** `eas submit --profile production --platform android` sends the latest build to the internal
  track as a draft. It needs a Google service-account key, which `eas submit` walks you through once. Never commit
  that key (`.gitignore` already excludes `google-service-account*.json`).
- **Every upload needs a higher `android.versionCode`** in `app.json` (1, 2, 3 ...). Play rejects a repeat.
  `version` ("1.0.0") is the label players see; change it when you like, and keep `package.json` in step (a test
  checks they match).

Signing: on the first build EAS offers to generate the Android keystore and keeps it on its servers. Say yes. In
Play Console accept Play App Signing (the default). You then never handle a key file. To keep your own backup, run
`eas credentials` and download the keystore to somewhere safe that is not this repository.

---

## What you must decide or supply before the first upload

The full ordered list for both stores, with a rough time for each step, is `store/release-checklist.md`. The table
below is the Android part as first written; the Apple equivalents (membership, App Store Connect record, age rating,
App Privacy, export compliance) are in that checklist and in `store/app-store-listing.md`.

| # | Decision | Where it goes | Notes |
| --- | --- | --- | --- |
| 1 | **Package name** | `app.json` `android.package` | Permanent. See the top of this file. |
| 2 | Expo account and EAS project | `eas login`, `eas init` | Use the account your other games build under, so the credentials sit together. |
| 3 | Signing | Automatic | Let EAS generate the keystore; accept Play App Signing. |
| 4 | Play Console app | Play Console, Create app | Type Game, free. Listing text is in `store/play-store-listing.md` (the description there replaces the one in `docs/marketing/play-store-listing.md`). Free cannot be changed to paid later. |
| 5 | Privacy policy URL | Play Console, App content | `https://aaliyaanwaja.github.io/ollywoodgames.github.io/privacy.html`. The game's Options screen links to the same page. Check that the page is live and describes this game. |
| 6 | Data safety form | Play Console, App content | Answers for this build are below. |
| 7 | Content rating | Play Console, App content | IARC questionnaire: no violence, no sexual content, no bad language, no gambling, no user-to-user communication, no location sharing, no purchases. See the expectations in the listing document. |
| 8 | Target audience | Play Console, App content | Your call. Choosing only 13 and over is the simple route. Including under-13s brings in the Families policy. |
| 9 | Ads declaration | Play Console, App content | "No, my app does not contain ads" for this build. |
| 10 | Store graphics | Play Console, Main store listing | Icon and feature graphic are in `app/store/`; the eight phone screenshots are in `app/store/screenshots/android/` (`npm run screenshots` regenerates them). |
| 11 | Testing requirement | Play Console | Personal accounts created after 13 November 2023 must run a closed test with 12 testers opted in for 14 days before production is unlocked (Google's help page, read 21 Nov 2026; details and source in the release checklist, step G6). Play Console tells you on the Dashboard whether yours is one. |
| 12 | Support email | Play Console, Store settings | Shown publicly on the listing. |

### Data safety answers for the current build

Build 0.5.0 adds anonymous play statistics (`privacy.html`, "Anonymous play statistics"), but **no statistics address is
set** (`one-man-team/js/config.js`, `statsUrl: ''`), so this build still collects, keeps and sends nothing. The store build
is still compiled **without the INTERNET permission** (see "Permissions"), contains no advert SDK, no crash reporter and
no account. The Daily Move's first 90 days are bundled; the app does not fetch later ones while it has no INTERNET
permission (the web build does).

- Does your app collect or share any of the required user data types? **No.**
- That single answer ends the form: nothing collected, nothing shared.
- Progress and settings are stored only on the device (and in the player's own Google device backup, which Google
  does not count as collection by the developer).
- Advertising ID: **the app does not use one.** The manifest carries no `AD_ID` permission.

### Data safety answers once the statistics address is set (same release as the switch)

Switching statistics on is three changes in one release: set `statsUrl` in `one-man-team/js/config.js`; delete the
INTERNET line in `app/app.config.js` (and the matching assertion in `scripts/check-native.js`); fill in the form as
below. Also add the collected type to the iOS privacy manifest (`app.json`, `NSPrivacyCollectedDataTypes`:
`NSPrivacyCollectedDataTypeProductInteraction`, not linked, not tracking, purpose `NSPrivacyCollectedDataTypePurposeAnalytics`)
and change the App Store privacy label to "Data Not Linked to You: Usage Data". Our reading of the forms, not legal advice.

- Does your app collect or share any of the required user data types? **Yes.**
- Is all of the user data collected by your app encrypted in transit? **Yes** (the endpoint must be HTTPS).
- Do you provide a way for users to request that their data is deleted? **No**: the messages carry no identifier, so
  no message can be tied to a user. Say so in the explanation field; the in-game switch stops all sending.
- Data types: **App activity, App interactions** ("levels started and won, takes, failure reasons, drills, daily played,
  help offers, shares, last screen") only. Not device or other IDs, not location, not personal info.
  - Collected: **Yes**. Shared: **No**. Processed ephemerally: **No**.
  - Required or optional: **Users can choose whether this data is collected** (the Options switch; off by default in
    the UK and EU, where the game asks once).
  - Purpose: **Analytics**.
- Advertising ID: still **not used**.

---

## Checklist on a real phone (Android)

None of this could be tested where the shell was written (no Android SDK, no emulator, no EAS login). Run all of it
on the **preview APK**, on at least one phone with gesture navigation and, if you can, one with the three-button bar
and one with a camera cut-out. The iPhone list follows it.

**First launch (both platforms)**
- [ ] A new install opens on the programme cover. "Kick off" starts the four practice drills; "Skip practice" goes
      to fixture 1. After the drills, fixture 1 starts.
- [ ] Options has Practice drills and Slow aim. Slow aim on: time slows for a moment while the aim button is held.
      It stays on after a restart.
- [ ] Winning a fixture shows stars, the move time and the number of takes. Retrying does not reduce the stars.

**Start-up**
- [ ] The splash is cream with the round felt badge, then the game appears. No white flash, no blank screen.
- [ ] First launch shows the cover; the first level is playable. (If the screen stays blank, see "If the preview
      APK shows a blank screen".)
- [ ] Fonts are the game's own (Anton titles, Barlow text), not a system fallback.

**Sound**
- [ ] The first tap produces sound, with the phone's media volume up. Nothing is expected before the first tap:
      the game only creates its audio after a touch.
- [ ] Turning Sound off in Options silences everything; it stays off after a restart.

**Vibration**
- [ ] Kicks and touches give a short tick; the whistle, a goal and a refused action give a rhythm.
- [ ] Turning Vibration off in Options stops all of it.
- [ ] With the phone's own "touch feedback" setting off, note whether short ticks still fire. If anything feels
      wrong, note the phone model; the mapping is one function (`hapticPlan` in `src/page-script.js`).

**Back button / back gesture**
- [ ] During a move: back opens the pause sheet. Back again closes it.
- [ ] On a result or briefing screen: back returns to the fixtures.
- [ ] On the fixtures screen: back sends the app to the background. Reopening it from Recents returns to the same
      screen instantly, without the splash.
- [ ] Back never closes the app in the middle of a level.

**Progress**
- [ ] Complete a level, force-stop the app (App info, Force stop), reopen: the stars are there.
- [ ] Complete a level and immediately swipe the app away from Recents, reopen: the stars are there.
- [ ] Install a newer APK over the old one (bump `versionCode`, build preview again): progress is kept.
- [ ] Uninstall and reinstall: progress is gone unless Google's device backup restores it (it may, hours later
      or on a new phone; that is expected and good).
- [ ] Options, then Reset progress (if the game offers it) really resets after a restart.

**Screen edges**
- [ ] Nothing sits under the status bar or the camera cut-out; the clock and battery are readable (dark icons on
      cream).
- [ ] Nothing sits under the gesture bar or the three-button bar; the PASS button and the run pad are fully
      reachable. The bar area is cream, not black.
- [ ] Switch between gesture and three-button navigation in system settings while the app is open: the layout
      adjusts without restarting.
- [ ] Rotating the phone does nothing (portrait lock).

**Backgrounding**
- [ ] Press Home in the middle of a move: the crowd noise stops at once. Return: the move is frozen and continues
      on the next touch.
- [ ] Take a phone call or pull the notification shade mid-move: no input is lost, nothing runs on by itself.
- [ ] Lock the screen mid-move, wait a minute, unlock: same as Home.
- [ ] Leave the app in the background for an hour with other heavy apps open, come back: the game is either where
      you left it or has restarted on the fixtures screen with progress intact (never blank).

**Touch behaviour**
- [ ] No text can be selected anywhere; long-press never shows a menu or a magnifier.
- [ ] Pinch does not zoom; double-tap does not zoom.
- [ ] Dragging at the top or bottom of a list shows no blue overscroll glow and no stretch.
- [ ] Two thumbs work together: run with the left while aiming with the right.
- [ ] With the system font size set to Largest, the layout is unchanged.

**Links**
- [ ] Options, then Privacy policy opens the phone's browser. Coming back, the game is where it was.

**Offline**
- [ ] Everything above works in aeroplane mode.

## Checklist on a real iPhone

Nothing here has run on iOS: there was no Mac, no Simulator and no device. Run all of it on the **TestFlight build**
(or an iOS `preview` build), on at least one iPhone with a Dynamic Island or notch and, if you can, one older model
with a Home button (iPhone SE). Items marked (*) are the ones most likely to need a change to the shell.

**Start-up**
- [ ] The launch screen is cream with the round felt badge, then the game appears. No white flash, no blank screen.
- [ ] The Home-screen icon has no black or white corners and the name under it is not cut short ("One-Man Team").
- [ ] Fonts are the game's own (Anton titles, Barlow text).
- [ ] (*) The game's save loads: complete a fixture, close the app from the app switcher, reopen: the stars are there.

**Sound**
- [ ] (*) The first tap produces sound, with the ring/silent switch set to ring and the volume up. One touch must be
      enough: no second tap to "unlock" audio.
- [ ] With the switch set to silent, the game is silent. That is deliberate (it is what iPhone owners expect of a
      game, and `ignoreSilentHardwareSwitch` is left off). Music from another app keeps playing over the game: note
      whether it does, and whether the game's effects mix with it or stop it.
- [ ] Sound off in Options silences everything and stays off after a restart.
- [ ] (*) Take a phone call or trigger Siri mid-move, then return: sound works again on the next touch.

**Haptics**
- [ ] Kicks and first touches give a light or medium tap; a tackle gives a heavy one.
- [ ] (*) The whistle, a goal and a refused action feel like two or three quick taps in a rhythm, not one long buzz.
- [ ] Vibration off in Options stops all of it. With Settings, Sounds & Haptics, System Haptics off, nothing fires;
      that is the system's choice and correct.

**Screen edges and gestures**
- [ ] (*) Nothing sits under the Dynamic Island, notch or status bar; the clock and battery are dark on cream.
- [ ] (*) Nothing sits under the home indicator; the PASS button and the run pad are fully reachable and the area
      behind the indicator is cream.
- [ ] (*) Dragging from the left edge of the screen to run does not slide the page, go "back" or show an edge glow.
- [ ] Dragging up from the bottom edge while running: note how easily the home gesture fires by accident. (The shell
      cannot defer that gesture without a native module; if it is a problem, say so.)
- [ ] Rotating the phone does nothing (portrait lock), including upside down.
- [ ] On an iPhone SE: the layout fits, with nothing clipped (the smallest screen the game supports is 360 by 640
      points; the SE is 375 by 667).

**Touch behaviour**
- [ ] (*) Holding the PASS button for two seconds while dragging keeps aiming. Nothing cancels the touch, no menu,
      no magnifier, no text selection, no "Copy / Look Up" bubble anywhere in the game.
- [ ] Pinch does not zoom; double-tap does not zoom.
- [ ] (*) Dragging the fixture list past its top or bottom does not bounce or rubber-band, and the whole page never
      slides to show a gap.
- [ ] Two thumbs work together: run with one while aiming with the other.
- [ ] With Settings, Display, Text Size at the largest, the layout is unchanged.

**Backgrounding**
- [ ] (*) Swipe up to the app switcher mid-move: the crowd noise stops at once. Return: the move is frozen and
      continues on the next touch.
- [ ] Pull down Notification Centre or Control Centre mid-move: same.
- [ ] Lock the phone mid-move, wait a minute, unlock: same.
- [ ] (*) Leave the app in the background for an hour with other heavy apps open, come back: the game is either where
      you left it or has restarted on the fixtures with progress intact. Never a blank cream screen.

**Progress**
- [ ] Install a newer TestFlight build over the old one: progress is kept.
- [ ] Delete the app and reinstall: progress is gone. (It returns only when the whole phone is restored from an
      iCloud or computer backup; the save is included in those.)
- [ ] Options, Reset progress really resets after a restart.

**Links and offline**
- [ ] (*) Options, Privacy policy opens Safari, not a page inside the game. Coming back, the game is where it was.
- [ ] Everything above works in aeroplane mode.

**On an iPad, if you have one** (App Review may try it): the app opens in the iPhone-sized window and is playable.

### If the preview APK shows a blank screen

The most likely cause is the one thing here that is deliberate and could not be tested: the store build has no
INTERNET permission. If the WebView refuses to show the page without it, open `app.config.js`, delete the line
`if (offlineBuild) blocked.add('android.permission.INTERNET');`, and rebuild. The game still makes no network
request, so the Data safety answers stay the same.

---

## How it works

```
app/
  App.tsx               the one screen: WebView + lifecycle (save loading, back, background, insets)
  index.ts              registers App
  app.json              static config: name, both identifiers, version, icons, splash, permissions, iOS privacy manifest
  app.config.js         store builds drop the INTERNET permission (Android) and the dev-only local-network keys (iOS)
  eas.json              build profiles (development, development-simulator, preview, production) and submit profiles
  src/
    game-html.js        GENERATED by `npm run sync-game`: the whole game as one string. Commit it.
    page-script.js      the JavaScript the shell runs inside the page, and the pure message helpers
    bridge.ts           one handler per message type
    storage.ts          the save, in AsyncStorage
  scripts/
    sync-game.js        runs ../tools/build-single.py and writes src/game-html.js; --check verifies it
    make-art.py         draws every icon, the splash and the feature graphic
    make-screenshots.py plays the real game with the bots and lays out the store screenshots for both stores
    check-native.js     runs `expo prebuild` for both platforms in a scratch folder and checks the generated files
    count-listing.py    counts every length-limited text in the store listings
  tests/
    shell.test.js       Node: message parsing, haptic mapping, link allow-list, config facts
    bridge_test.py      Playwright: the embedded game with a fake native side, played by the bots
  assets/               generated app icons and splash
  store/                listings, release checklist, Play Console graphics, screenshots/android and screenshots/ios
```

### Why the game is embedded as a JS module, not as an asset file

Two ways were considered.

- **An asset** (`game.html` bundled through Metro, then loaded with expo-asset / expo-file-system). In a release
  build Android packs assets as resources inside the APK, not as files. The app would have to copy the file out to
  storage on first run, wait for that, then either load it from a `file://` URL (which needs file access switched
  on in the WebView and gives the page a file origin, where storage and some web features behave differently) or
  read it back into a string anyway. It behaves differently in development (served by Metro over HTTP) and in
  release, which is exactly where surprises hide. It also adds two dependencies.
- **A generated JS module** that exports the HTML as a string (chosen). The string is part of the compiled
  JavaScript bundle. It is available synchronously, in the same way in development and in release, with no file
  copying, no extra permission and no extra dependency. `sync-game --check` proves the embedded string is
  byte-for-byte the output of `tools/build-single.py`, and that check runs in `npm test` and before every EAS
  build.

The cost is about 360 KB of text inside the bundle, held in memory once. That is small next to the WebView itself.

`src/game-html.js` is generated but **must be committed**: EAS builds from the repository, and the build should
not depend on Python being present on the build machine. The EAS pre-install hook re-runs the check anyway; if
Python and the game sources are there it fails the build on a stale embed, and if they are not it says so and
carries on with the committed file.

### The page's origin (`baseUrl`)

The WebView is given the HTML string together with `baseUrl: 'https://app.ollywoodgames.invalid/'`.

- Without a base URL, an HTML string loads at `about:blank` with an opaque origin. There `localStorage` throws,
  and the page is not a secure context.
- With an `https://` base URL the page has a normal, stable, secure origin. `localStorage` works and persists
  between launches (the game keeps its own copy of the save there, which is the fallback if native storage ever
  fails), Web Audio and fonts behave as on the web, and relative links resolve predictably.
- The host is deliberately one that cannot exist. `.invalid` is reserved for exactly this, so nothing can ever be
  served from it and no request the page makes can reach a real server. The game's real web address was not used
  because the web build registers a service worker on its own https origin, and the app must not start caching the
  website over itself. (The shell also disables service worker registration inside the app.)
- **Do not change this URL after release.** The page's `localStorage` belongs to the origin. The native save would
  survive a change; the fallback copy would not.

### The bridge

Web to native: `window.ReactNativeWebView.postMessage(JSON.stringify(msg))`. Every message is an object with a
string `t`. Handlers live in one table in `src/bridge.ts`; unknown types are ignored.

| `t` | Sent by | Payload | What the shell does |
| --- | --- | --- | --- |
| `save` | game | `v`: the whole save as a JSON string | Validates it (a JSON object, under 512 KB) and writes it to AsyncStorage under `omt.save.v1`. A bad value never replaces a good one. Writes are queued so they cannot land out of order. |
| `haptic` | game | `p`: milliseconds, or `[buzz, gap, buzz, ...]` | A single value becomes a tuned impact: up to 12 ms light, up to 30 ms medium, longer heavy (raw 8 to 20 ms motor pulses are weak or silent on many phones). A pattern stays a rhythm: on Android through React Native's Vibration, each part capped at 400 ms; on iOS as one Taptic impact per buzz at the moment that buzz would start (see "iOS behaviour"). |
| `open` | shell's page script | `url` | Opens the system browser, only for https links to hosts on the allow-list in `src/page-script.js` (the studio site, Google Play and the App Store). |
| `back` | shell's page script | `handled` | The answer to the back button; see below. |
| `log` | shell's page script | `level`, `m` | Printed in development builds only. |

Native to web, before the page's scripts run:

```js
window.__OMT_NATIVE__ = { save: <stored string or null>, version: "1.0.0", platform: "android" | "ios" }
```

The stored save is read from AsyncStorage **before the WebView is created**; the splash stays up meanwhile. The
bootstrap script is delivered two ways at once:

1. spliced into the HTML string as the first thing in `<head>`, in memory, when the app starts. This is the one
   that is guaranteed to run before the game's scripts, because it is simply earlier in the same document.
2. through `injectedJavaScriptBeforeContentLoaded`, as the brief asked.

Both are sent because of what the installed react-native-webview (14.0.1) does on Android: it runs
`injectedJavaScriptBeforeContentLoaded` from `onPageStarted` with an asynchronous `evaluateJavascript`, so it can
lose the race against the page's own scripts. Losing that race here would mean the game boots with no save and then
overwrites the real one. The script is written so the second arrival does nothing. On iOS the same library installs
it as a `WKUserScript` at document start, which WebKit runs before any script of the page, so there either route
would do; the splice is kept on both platforms so that there is one behaviour to reason about.

The same script adds a small stylesheet of its own (`SHELL_CSS` in `src/page-script.js`): no overscroll on any
scroller, no long-press callout, no double-tap zoom. The WebView's own switches reach only the page as a whole; the
fixture list and the programme pages scroll inside it.

The same script also installs `window.__omtShell`, which the shell calls later:

- `insets({top,right,bottom,left})` writes the system-bar and cut-out sizes over the page's `--st`, `--sr`, `--sb`,
  `--sl` CSS variables. The page already pads itself with those variables (from `env(safe-area-inset-*)`); native
  measurements are used instead because older Android WebViews report zero for the system bars.
- `setActive(false|true)` on background/foreground: makes `document.hidden` true and fires `visibilitychange` (the
  game freezes on that), and suspends every `AudioContext` the page created; on return it undoes both. This does
  not rely on the WebView firing `visibilitychange` itself, which the WebView library does not guarantee (its
  pause/resume hooks are empty).
- `back()` calls `window.__omt.back()` and posts `{ t: 'back', handled }`.
- `receive(msg)` dispatches a `window` event named `omt:native` with `msg` as `detail`. Nothing uses it yet; it is
  the return path for adverts and purchases.

Things the shell relies on in the game (checked by `sync-game`, which refuses to embed a page that lacks them):
`window.__OMT_NATIVE__`, `ReactNativeWebView`, the `--st`/`--sb` variables, `window.__omt.back()`,
a `visibilitychange` listener and a `<head>` tag.

### Android behaviour

- **Portrait:** `orientation: "portrait"` in `app.json` (becomes `screenOrientation="portrait"` in the manifest).
- **Edge to edge:** SDK 58 is always edge to edge. The WebView fills the whole screen; system bars are transparent
  with dark icons over the cream page; the page pads itself using the injected insets. The bars stay visible on
  purpose (a short-session game where people want to see the time). To hide them instead, add `"hidden": true` to
  the `expo-status-bar` and `expo-navigation-bar` plugin options in `app.json`.
- **Back:** the press is always taken by the shell, which asks the page. If the page answers `handled: false`, or
  does not answer within half a second, the shell calls `BackHandler.exitApp()`. On Expo's Android activity that
  moves the app to the background; it does not kill it. Predictive back is switched off so the press always
  reaches the game.
- **Audio:** `mediaPlaybackRequiresUserAction={false}`, so sound needs no gesture beyond the one the game itself
  waits for.
- **No zoom, selection, overscroll or long-press menu:** zoom controls off, `textZoom={100}` (system font size
  cannot break the layout), `overScrollMode="never"`, and `contextmenu` / `selectstart` / `dragstart` are cancelled
  in the page. The game's CSS already disables selection and callouts.
- **Hardware acceleration:** on by default for the app; the WebView is also set to a hardware layer.
- **Renderer crash:** if Android kills the WebView's renderer, the shell rebuilds the page with the newest save it
  has seen.
- **Outside links:** intercepted in the page (click), again in `onShouldStartLoadWithRequest`, and if a foreign
  page ever loaded regardless the WebView is thrown away and the game restarted.

### iOS behaviour

Read from the installed react-native-webview 14.0.1: the JSDoc on its props (`src/WebViewTypes.ts`; the package
ships no `docs/` folder) and its native code (`apple/RNCWebViewImpl.m`). **None of it has been run on iOS.**

| Concern | What the shell does | Why |
| --- | --- | --- |
| Audio without a second gesture | `mediaPlaybackRequiresUserAction={false}` | The library's default on iOS is to require a gesture for all media; with the prop it sets `mediaTypesRequiringUserActionForPlayback` to none. The game still creates its audio on the first touch. |
| Inline playback | `allowsInlineMediaPlayback`, AirPlay and picture-in-picture off | There is no video today; this stops any future media element from taking over the screen. |
| Silent switch | left alone | Web Audio in WKWebView follows the ring/silent switch. `ignoreSilentHardwareSwitch` (a hidden looping audio element) is not used: a game that plays through silent mode gets complaints. |
| Bounce and overscroll | `bounces={false}`, `scrollEnabled={false}`, `pullToRefreshEnabled={false}`, plus `SHELL_CSS` for inner lists | The page is a fixed layout; nothing should rubber-band. |
| Text selection, callouts, link previews | `textInteractionEnabled={false}` (iOS 14.5+; the minimum here is 16.4), `allowsLinkPreview={false}`, `dataDetectorTypes="none"`, and the page-side `contextmenu`/`selectstart` cancel | `dataDetectorTypes` defaults to turning phone-number-like text into links. |
| **`menuItems` must not be set** | not set | Passing even an empty list makes the library add a 0.4-second long-press recogniser with `cancelsTouchesInView`, which would cancel hold-to-aim. |
| Safe area (notch, Dynamic Island, home indicator) | `contentInsetAdjustmentBehavior="never"`, `automaticallyAdjustContentInsets={false}`; insets measured by react-native-safe-area-context and written over `--st/--sb/--sl/--sr` | The web view runs edge to edge and the page pads itself. On iOS the page's own `env(safe-area-inset-*)` should give the same numbers; the native ones win so both platforms take one path. |
| Swipe-back | `allowsBackForwardNavigationGestures={false}` | Also the library's default. There is no navigation controller, so the system has no back swipe either. |
| Backgrounding | When `AppState` is anything but `active` (iOS reports `inactive` first), `setActive(false)`: `visibilitychange`, every `AudioContext` suspended. On return they are resumed, including any that iOS put into its `interrupted` state. | The script is injected at `inactive`, while the app can still run it. WebKit also suspends the page's timers itself in the background. |
| Web-content process killed | `onContentProcessDidTerminate` rebuilds the page with the newest save | iOS's equivalent of Android's renderer crash; without it the player returns to a blank view. |
| Save bridge | unchanged: `postMessage`, then AsyncStorage | On iOS `window.ReactNativeWebView.postMessage` is defined by a document-start user script. `RCTAsyncStorageExcludeFromBackup` is set to false in Info.plist so the save is part of the phone's own backup, like `allowBackup` on Android. The page's `localStorage` copy (WebKit's data store) is the fallback. |
| Haptics | expo-haptics for everything | iOS cannot vibrate for a chosen number of milliseconds; React Native's `Vibration` with a pattern would play the long system buzz once per entry. So a pattern becomes timed impacts (`hapticPlan(p, 'ios')` returns `kind: 'sequence'`). No permission is involved. |
| Privacy link | page click, `open` message, `Linking.openURL`, Safari | Same allow-list as Android. `onShouldStartLoadWithRequest` is the second line of defence. |
| Back button | none | `BackHandler` never fires on iOS. Every screen of the game has its own way back. |
| Debugging | `webviewDebuggingEnabled={__DEV__}` | Makes the web view inspectable from Safari (iOS 16.4+) in development builds only. |

Config (`app.json`, checked by `npm run check-native` in the generated project):

- **iPhone only:** `supportsTablet: false` gives `TARGETED_DEVICE_FAMILY = 1`. The layout is a phone layout; an
  iPad would show it letterboxed in any case, and iPhone-only means no iPad screenshots and no iPad review.
- **Portrait:** `orientation: "portrait"`. Expo writes portrait and portrait-upside-down into Info.plist; an iPhone
  does not rotate upside down, so the result is portrait only.
- **Info.plist:** nothing is added beyond `RCTAsyncStorageExcludeFromBackup`. The store build contains **no
  usage-description string**: the app uses no camera, microphone, photos, location, contacts, Bluetooth, tracking
  or notifications. expo-dev-client adds `NSLocalNetworkUsageDescription` and `NSBonjourServices` so development
  builds can find Metro; `app.config.js` removes both from `preview` and `production` builds.
- **`ITSAppUsesNonExemptEncryption: false`** (`ios.config.usesNonExemptEncryption`). Truthful: the app has no
  encryption code and opens no network connection.
- **Privacy manifest** (`ios.privacyManifests`): required. Ten manifests ship inside the installed packages (React
  Native core, its bundled glog, boost and Folly, expo-constants, expo-file-system, expo-system-ui, AsyncStorage),
  declaring four required-reason API categories between them: user defaults (CA92.1), file timestamps (C617.1,
  0A2A.1, 3B52.1), disk space (E174.1, 85F4.1) and system boot time (35F9.1). The app-level manifest repeats
  exactly those, with tracking false and nothing collected. A test reads every installed manifest and fails if a
  dependency starts declaring something the app's manifest lacks.
- **Icon:** `assets/icon.png`, 1024 by 1024, RGB with no alpha channel (a test reads the PNG header). iOS applies
  its own corner mask. No dark or tinted variants are supplied; iOS derives them.
- **Splash:** the same expo-splash-screen settings as Android: cream background, the felt badge at 250 points.
- **Minimum iOS:** 16.4, the SDK's default.

### Permissions

| Permission | Store build | Why |
| --- | --- | --- |
| `VIBRATE` | yes | Haptics. Granted at install, no prompt. |
| `INTERNET` | **removed** | The game needs no network. Development builds keep it to reach Metro. |
| `SYSTEM_ALERT_WINDOW`, `READ/WRITE_EXTERNAL_STORAGE` | removed | Present in Expo's template; not needed. |

iOS: no permission of any kind, so no prompt is ever shown.

Checked by `npm run check-native`, which generates both native projects in a scratch copy (`expo prebuild`) and
reads the Android manifest, the iOS Info.plist, the entitlements and the privacy manifest.

### Where the name lives

- `app.json` `name`: the label under the launcher icon.
- `scripts/make-art.py` `TITLE`: the words on the feature graphic (the icons carry no text). Run `npm run art`.
- The game itself: `<title>` in `one-man-team/index.html` and `GAME_NAME` in `one-man-team/js/game.js`.
- `slug` in `app.json` is the EAS project's identifier. Leave it alone after `eas init`.
- The package name contains `onemanteam`. It is never shown to players.

---

## Icons, splash and store graphics

All drawn by `scripts/make-art.py` (`npm run art`; needs Python with Playwright and Pillow). It follows
`docs/ART_DIRECTION.md` and the briefs in `docs/marketing/store-assets-plan.md`: one tabletop figure with the
mustard ring, squad number 1, on felt in the palette greens, with one chalk ghost of the same figure behind it joined
by a dashed run. The numeral is the Barlow Condensed 700 glyph stored as an outline, so the icon needs no font.

| File | Use |
| --- | --- |
| `assets/icon.png` (1024, no alpha) | iOS app icon; launcher icon on old Android versions |
| `assets/adaptive-foreground.png`, `adaptive-background.png` | Adaptive icon layers; the art stays inside the safe zone for any mask shape |
| `assets/adaptive-monochrome.png` | Themed icon (Android 13 and later) |
| `assets/splash-icon.png` | Felt badge shown on the cream splash |
| `store/play-icon-512.png` | Play Console icon (512, 32-bit PNG) |
| `store/feature-graphic-1024x500.png` | Play Console feature graphic (24-bit PNG) |
| `store/preview-*.png` | Check sheets: icon at 48 to 192 px on white and dark, adaptive masks, splash on a phone, feature graphic with the outer 15 per cent dimmed. Not for upload. |
| `../one-man-team/icons/*` | The web manifest's icons, same artwork, same file names as before |
| `store/screenshots/android/*.png` | Eight Google Play phone screenshots, 1080 by 1920 |
| `store/screenshots/ios/*.png` | Ten App Store screenshots, 1320 by 2868 (6.9-inch iPhone; Apple scales the smaller sizes from it) |
| `store/screenshots/index.json`, `preview-*.png` | Captions, alt text and sizes; contact sheets. Not for upload. |

### Store screenshots

`npm run screenshots` (`scripts/make-screenshots.py`; add `-- --sheet` for the contact sheets). It opens the real
`one-man-team/index.html` in headless Chromium, takes control of the clock, and lets the bots from `tools/` play to
real moments: the goal, a pass being aimed, a run onto a recorded pass, a full-back dragged out of position, a
decoy run, the offside line, the result sheet, the fixture list, the end-of-season report and a practice drill.
Each capture is placed untouched on a page laid out like the game's matchday programme. Levels are chosen by name
("The overlap", "Last-minute winner"), so adding packs does not change them; the star total on the fixture list
follows whatever the game loads, so **regenerate once the game has all 60 fixtures**. What each one shows and its
caption follow `docs/marketing/store-assets-plan.md`, with the differences listed at the top of the script.

---

## Adding adverts or a purchase later

The shell was laid out so that neither needs a rewrite. The pattern is the same for both: the page asks, native
does the work, native answers.

**In the game (page side)**

```js
// ask
window.ReactNativeWebView.postMessage(JSON.stringify({ t: 'ad', kind: 'rewarded', id: 'hint-42' }));
// hear the answer
window.addEventListener('omt:native', e => {
  const m = e.detail;                       // e.g. { t: 'ad', id: 'hint-42', ok: true }
  if (m.t === 'ad' && m.ok) giveHint();
});
```

`window.__OMT_NATIVE__` can carry more at boot (for example `entitlements: ['unlimited-hints']`), so the game knows
what is owned before its first frame. In a browser there is no `ReactNativeWebView`, so the web build simply never
offers these.

**In the shell**

1. Add a handler to the table in `src/bridge.ts`:

   ```ts
   ad(msg, ctx) {
     showRewarded().then(ok => ctx.reply({ t: 'ad', id: msg.id, ok }));
   },
   purchase(msg, ctx) {
     buy(String(msg.sku)).then(owned => ctx.reply({ t: 'purchase', sku: msg.sku, owned }));
   },
   ```

   `ctx.reply` already exists and delivers the `omt:native` event.
2. Rewarded adverts: `react-native-google-mobile-ads` (the AdMob library your other Expo titles use), installed
   with `npx expo install`, with its config plugin and AdMob app id in `app.json`. Load the advert ahead of time;
   pause the game with the existing `setActive(false)` while it plays.
3. One purchase: `react-native-iap` or RevenueCat's `react-native-purchases`. Read what is owned at start-up,
   before the WebView is created (next to `loadSave()` in `App.tsx`), and pass it into `bootstrapScript`. Offer
   "Restore purchase" in Options through a `restore` message.
4. **Delete the INTERNET line in `app.config.js`.** Both need the network. On iOS add the advert SDK's own
   Info.plist keys (AdMob needs `GADApplicationIdentifier`, `SKAdNetworkItems` and, if adverts are personalised,
   `NSUserTrackingUsageDescription`), and extend `ios.privacyManifests` with what the SDK collects.
5. Both need a new native build; neither can be delivered by a JavaScript-only update.

**Outside the code, in the same release**

- Redo the Data safety form (advert SDKs collect device identifiers; purchases involve purchase history), and
  Apple's App Privacy answers and age-rating "Advertising" answer.
- Remove "No adverts, no purchases, no account" and "Plays without a connection" from both store descriptions.
- Answer "Contains ads: yes"; the advertising-ID declaration changes; the privacy policy page must name the SDKs.
- Show Google's consent form (UMP) before the first advert where the law requires it.
- Set the advert content rating filter to match the game's rating.
- Add the "Lines to add once decisions are made" from `docs/marketing/play-store-listing.md`.

---

## Verified here / not verified here

Re-run on 22 November 2026 in a Linux sandbox: Node 22, Python 3 with Playwright (Chromium only), **no Android SDK,
no Mac, no Xcode, no Simulator or emulator, no device, no EAS login, no store account.**

Verified:

| Command | Result |
| --- | --- |
| `npm ci` | 713 packages installed from the lock file. |
| `npm run sync-game` | Rebuilt the embed after the game changed (practice drills, new star rule, slow aim, packs 4 to 6): about 409 KB of HTML (the game was still changing; run it again last thing before a build). Nothing in the shell needed fixing for those changes; the contract checks in `sync-game` all still pass. |
| `npx tsc --noEmit` | No errors. |
| `npx expo lint` | No errors, no warnings. |
| `npm test` | `sync-game --check` byte-identical; `shell.test.js` 13 checks passed; `bridge_test.py` 35 of 35 checks passed (now including the cover and practice-drill flow, slow aim through the save bridge, the move time in the posted result, `platform: "ios"`, and the shell stylesheet). |
| `npx expo-doctor` | 18 of 20 checks passed. The other two need Expo's servers (config schema, React Native Directory), which the sandbox cannot reach (`ENOTFOUND exp.host`). Run it once in the Codespace. |
| `npx expo export --platform android` and `--platform ios` (in a scratch copy) | Both bundle: Hermes bytecode, 2.4 MB each (626 and 628 modules). |
| `npm run check-native` | 11 checks passed on projects generated by `expo prebuild` in a scratch folder outside the repository, with `EAS_BUILD_PROFILE=production` and again with `development`. Store build, iOS: bundle identifier, version and build number from `app.json`; `TARGETED_DEVICE_FAMILY = 1`; portrait only; **no key ending in `UsageDescription` and no `NSBonjourServices`**; `ITSAppUsesNonExemptEncryption` false; `NSAllowsArbitraryLoads` false; light appearance; dark status-bar text; launch storyboard; empty entitlements; `PrivacyInfo.xcprivacy` written and in the Xcode project; one 1024 by 1024 icon without alpha. Store build, Android: package, versionCode, portrait, backup on, predictive back off, `VIBRATE` the only permission. Development build: keeps the local-network keys and `INTERNET`. |
| `eas.json` against the `@expo/eas-json` 27.11.0 schema (the one eas-cli uses), in a scratch folder | All four build profiles resolve for both platforms; the Android submit profile resolves; the iOS submit profile is rejected with messages naming the three placeholders, as intended. |
| `npm run check-listing` | Every counted text within its limit. It also reports that the game loads 44 fixtures while the listings say 60. |
| `npm run screenshots` | 8 Android and 10 iOS images written and looked at one by one. |

Not verified:

- **No APK, AAB or IPA was built. The app has never run on Android or on iOS.**
- Everything in the two real-device checklists. For iOS in particular: that sound starts on the first touch; that
  WebKit gives the page a working `localStorage` and secure context at the `.invalid` base URL; that nothing
  bounces; that hold-to-aim is never cancelled; safe-area insets; the backgrounding path; the timed Taptic
  sequences; that the privacy link opens Safari.
- The page-side tests ran in Chromium. Playwright's WebKit build could not be downloaded here, so no test has run
  in Apple's browser engine, let alone in WKWebView.
- That the dev-launcher's Xcode build phase and the `app.config.js` plugin agree in a compiled Release build
  (the generated Info.plist was read; the compiled one was not).
- That the Android WebView shows the page with the INTERNET permission removed.
- Signing, `eas build`, `eas submit`, TestFlight and both consoles.
- The Xcode version on EAS's default image for SDK 58 (Apple requires Xcode 26 or later for uploads).
- The two network-only expo-doctor checks.
