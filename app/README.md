# One-Man Team: Android app shell

An Expo app (SDK 58, React Native 0.88) with one screen: a full-screen WebView that runs the game from
`../one-man-team/`, fully offline. The shell adds what a web page cannot do on its own: it keeps the save in native
storage, turns the game's vibration requests into real haptics, handles the Android back button, pauses when the app is
backgrounded, and opens outside links in the browser.

No navigation library, no state library. The whole shell is `App.tsx` plus four small files in `src/`.

---

## READ THIS FIRST: the package name is permanent

`app.json` sets `android.package` to **`com.ollywoodgames.onemanteam`**. That is a placeholder until you confirm it.

**Google Play fixes the package name at the first upload. It can never be changed afterwards, not even if the game is
renamed.** A different package name is a different app, with a new listing, no reviews and no installs carried over.

Before the first `eas build --profile production`:

1. Decide the package name (lowercase, dots, no hyphens). Check it against your other titles so the studio prefix is
   the same everywhere.
2. If it changes, edit `android.package` in `app.json` and the matching line in `tests/shell.test.js`.
3. Do not upload anything to Play until you are sure.

The display name ("One-Man Team") is a different thing and can be changed at any time; see "Where the name lives".

---

## From a fresh Codespace to an APK on your phone

Everything runs from the `app/` folder.

```bash
cd app
npm ci                      # installs exactly what package-lock.json pins
npm run sync-game           # rebuilds the game into src/game-html.js (needs python3)
npm run check               # typecheck + lint + tests; must pass before any build

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

### A development build (optional)

Only needed when you want to change the shell itself with live reload:

```bash
eas build --profile development --platform android     # install the APK once
npm start -- --tunnel                                  # then open the dev build and scan the QR code
```

`npm start` runs `sync-game` first. Edits to the game need `npm run sync-game` and a reload (press `r`).
In a development build, the WebView can be inspected from desktop Chrome at `chrome://inspect`.

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

| # | Decision | Where it goes | Notes |
| --- | --- | --- | --- |
| 1 | **Package name** | `app.json` `android.package` | Permanent. See the top of this file. |
| 2 | Expo account and EAS project | `eas login`, `eas init` | Use the account your other games build under, so the credentials sit together. |
| 3 | Signing | Automatic | Let EAS generate the keystore; accept Play App Signing. |
| 4 | Play Console app | Play Console, Create app | Type Game, free. Listing text is in `docs/marketing/play-store-listing.md`. Free cannot be changed to paid later. |
| 5 | Privacy policy URL | Play Console, App content | `https://ollywoodgames.github.io/privacy.html`. The game's Options screen links to the same page. Check that the page is live and describes this game. |
| 6 | Data safety form | Play Console, App content | Answers for this build are below. |
| 7 | Content rating | Play Console, App content | IARC questionnaire: no violence, no sexual content, no bad language, no gambling, no user-to-user communication, no location sharing, no purchases. See the expectations in the listing document. |
| 8 | Target audience | Play Console, App content | Your call. Choosing only 13 and over is the simple route. Including under-13s brings in the Families policy. |
| 9 | Ads declaration | Play Console, App content | "No, my app does not contain ads" for this build. |
| 10 | Store graphics | Play Console, Main store listing | Icon and feature graphic are in `app/store/`. Screenshots are still to be made (see `docs/marketing/store-assets-plan.md`). |
| 11 | Testing requirement | Play Console | Some personal developer accounts must run a closed test with a minimum number of testers before production is unlocked. Play Console tells you on the Dashboard whether yours is one. |
| 12 | Support email | Play Console, Store settings | Shown publicly on the listing. |

### Data safety answers for the current build

These are true for this build because it has no network access at all: the store build is compiled **without the
INTERNET permission** (see "Permissions"), contains no analytics, no advert SDK, no crash reporter and no account.

- Does your app collect or share any of the required user data types? **No.**
- That single answer ends the form: nothing collected, nothing shared.
- Progress and settings are stored only on the device (and in the player's own Google device backup, which Google
  does not count as collection by the developer).
- Advertising ID: **the app does not use one.** The manifest carries no `AD_ID` permission.

**These answers stop being true the moment adverts, purchases, analytics or crash reporting are added.** Redo the
form in the same release.

---

## Checklist on a real phone

None of this could be tested where the shell was written (no Android SDK, no emulator, no EAS login). Run all of it
on the **preview APK**, on at least one phone with gesture navigation and, if you can, one with the three-button bar
and one with a camera cut-out.

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
  app.json              static config: name, package, version, icons, splash, permissions
  app.config.js         one rule: store builds drop the INTERNET permission
  eas.json              development / preview (APK) / production (AAB) profiles
  src/
    game-html.js        GENERATED by `npm run sync-game`: the whole game as one string. Commit it.
    page-script.js      the JavaScript the shell runs inside the page, and the pure message helpers
    bridge.ts           one handler per message type
    storage.ts          the save, in AsyncStorage
  scripts/
    sync-game.js        runs ../tools/build-single.py and writes src/game-html.js; --check verifies it
    make-art.py         draws every icon, the splash and the feature graphic
  tests/
    shell.test.js       Node: message parsing, haptic mapping, link allow-list, config facts
    bridge_test.py      Playwright: the embedded game with a fake native side, played by the bots
  assets/               generated app icons and splash
  store/                generated Play Console graphics and preview sheets
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
| `haptic` | game | `p`: milliseconds, or `[buzz, gap, buzz, ...]` | A single value becomes a tuned impact: up to 12 ms light, up to 30 ms medium, longer heavy (raw 8 to 20 ms motor pulses are weak or silent on many phones). A pattern stays a rhythm through React Native's Vibration, each part capped at 400 ms. |
| `open` | shell's page script | `url` | Opens the system browser, only for https links to hosts on the allow-list in `src/page-script.js` (the studio site and Google Play). |
| `back` | shell's page script | `handled` | The answer to the back button; see below. |
| `log` | shell's page script | `level`, `m` | Printed in development builds only. |

Native to web, before the page's scripts run:

```js
window.__OMT_NATIVE__ = { save: <stored string or null>, version: "1.0.0", platform: "android" }
```

The stored save is read from AsyncStorage **before the WebView is created**; the splash stays up meanwhile. The
bootstrap script is delivered two ways at once:

1. spliced into the HTML string as the first thing in `<head>`, in memory, when the app starts. This is the one
   that is guaranteed to run before the game's scripts, because it is simply earlier in the same document.
2. through `injectedJavaScriptBeforeContentLoaded`, as the brief asked.

Both are sent because of what the installed react-native-webview (14.0.1) does on Android: it runs
`injectedJavaScriptBeforeContentLoaded` from `onPageStarted` with an asynchronous `evaluateJavascript`, so it can
lose the race against the page's own scripts. Losing that race here would mean the game boots with no save and then
overwrites the real one. The script is written so the second arrival does nothing.

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

### Permissions

| Permission | Store build | Why |
| --- | --- | --- |
| `VIBRATE` | yes | Haptics. Granted at install, no prompt. |
| `INTERNET` | **removed** | The game needs no network. Development builds keep it to reach Metro. |
| `SYSTEM_ALERT_WINDOW`, `READ/WRITE_EXTERNAL_STORAGE` | removed | Present in Expo's template; not needed. |

Checked by generating the native project in a scratch copy (`expo prebuild`) and reading its manifest.

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
| `assets/icon.png` (1024) | Launcher icon on old Android versions |
| `assets/adaptive-foreground.png`, `adaptive-background.png` | Adaptive icon layers; the art stays inside the safe zone for any mask shape |
| `assets/adaptive-monochrome.png` | Themed icon (Android 13 and later) |
| `assets/splash-icon.png` | Felt badge shown on the cream splash |
| `store/play-icon-512.png` | Play Console icon (512, 32-bit PNG) |
| `store/feature-graphic-1024x500.png` | Play Console feature graphic (24-bit PNG) |
| `store/preview-*.png` | Check sheets: icon at 48 to 192 px on white and dark, adaptive masks, splash on a phone, feature graphic with the outer 15 per cent dimmed. Not for upload. |
| `../one-man-team/icons/*` | The web manifest's icons, same artwork, same file names as before |

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
4. **Delete the INTERNET line in `app.config.js`.** Both need the network.
5. Both need a new native build; neither can be delivered by a JavaScript-only update.

**Outside the code, in the same release**

- Redo the Data safety form (advert SDKs collect device identifiers; purchases involve purchase history).
- Answer "Contains ads: yes"; the advertising-ID declaration changes; the privacy policy page must name the SDKs.
- Show Google's consent form (UMP) before the first advert where the law requires it.
- Set the advert content rating filter to match the game's rating.
- Add the "Lines to add once decisions are made" from `docs/marketing/play-store-listing.md`.

---

## Verified here / not verified here

Verified in the sandbox this was written in (Node 22, Python 3 with Playwright, no Android tooling):

- `npm ci` from the lock file installs cleanly.
- `npx tsc --noEmit` and `npx expo lint`: no errors, no warnings.
- `npx expo-doctor`: 18 of 20 checks pass. The other two need Expo's servers (config schema, React Native
  Directory), which the sandbox could not reach. Run `npx expo-doctor` once in the Codespace; if either reports
  something, it will name the field.
- `npx expo export --platform android` bundles (Hermes bytecode, about 2.3 MB). In a non-bytecode export the game
  string inside the minified bundle was extracted and matched the module exactly.
- `npx expo prebuild --platform android` in a scratch copy generates the native project; its manifest, styles and
  icon resources were read and match this document.
- `node scripts/sync-game.js --check`: embedded HTML byte-identical to `tools/build-single.py` output.
- `tests/bridge_test.py` (headless Chromium at 390 by 844, the embedded page prepared exactly as `App.tsx` prepares
  it, a fake `ReactNativeWebView`): the native save is read at boot and beats a stale `localStorage` copy; a bot
  completes a level and a `save` message carrying old and new progress is posted; haptic messages map to
  vibrations; insets, back, background/foreground with audio suspend and resume, and the privacy link all behave.

Not verified, because there is no Android SDK, emulator, device or EAS login here:

- **No APK or AAB was built. The app has never run on Android.**
- Everything in "Checklist on a real phone".
- That the WebView shows the page with the INTERNET permission removed.
- How the haptics feel on real motors.
- That the EAS builder has Python for the pre-install check (if not, the hook says so and continues).
- `eas.json` against the live EAS service, and `eas submit`.
- The two network-only expo-doctor checks.
