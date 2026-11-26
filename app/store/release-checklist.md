# One-Man Team: release checklist, both stores

Written 21 November 2026. One ordered list per store, from "accounts" to "submitted for review". Every step says
who does it: **YOU** means only the owner can (money, identity, legal declarations, or a decision); **CMD** is a
command anyone with the repository can run; **EAS** happens on Expo's build servers. Times are rough and assume
nothing goes wrong; waiting on Apple or Google is shown separately because nothing you do shortens it.

Nothing in this file has been done. No account was touched, no binary was built, and the app has never run on a
phone. See "Verified" at the end for what was checked.

## Decisions to make before anything else

These block both stores. Each is yours alone.

| # | Decision | Why it matters | Where it goes |
| --- | --- | --- | --- |
| D1 | **Android package name.** Placeholder: `com.ollywoodgames.onemanteam` | Permanent after the first upload to Play. | `app.json` `android.package`, `tests/shell.test.js` |
| D2 | **iOS bundle identifier.** Placeholder: `com.ollywoodgames.onemanteam` | Permanent after the first build is uploaded to App Store Connect. Usually the same string as D1, but it need not be. | `app.json` `ios.bundleIdentifier`, `tests/shell.test.js` |
| D3 | Enrol with Apple as an individual or as an organisation | An individual's legal name is shown as the seller. An organisation needs a legal entity and a D-U-N-S number and takes longer. | Apple Developer enrolment |
| D4 | Which Google Play developer account | An existing account with production access avoids the closed-test wait in step G6. A new personal account does not. | Play Console |
| D5 | Price | Free now; on Google Play a free app cannot later be made paid. | Both consoles |
| D6 | Contact address shown to the public | Both stores need one, and the privacy page needs one. | Support page, `privacy.html`, both consoles |
| D7 | Is "60 fixtures" true on the day you submit | The listings say 60. | `npm run check-listing -- --strict` |
| D8 | Target age group on Google Play | 13 and over keeps the app out of the Families policy. | Play Console, App content |
| D9 | Countries | All, unless you have a reason. | Both consoles |

## Before either store (about 1 hour, plus the phone testing)

1. **CMD** `cd app && npm ci && npm run sync-game && npm run check && npm run check-native && npm run check-listing -- --strict`. All must pass. `check-listing --strict` fails until the game loads 60 fixtures. (10 minutes)
2. **YOU** Confirm D1 and D2. If either changes, edit `app.json` and the matching line in `tests/shell.test.js`, and run step 1 again. (5 minutes, permanent)
3. **YOU** Put a contact address on the studio site and in `privacy.html`, remove the "Draft" notice from `privacy.html`, and check both pages are live. These files are outside `app/`, so this is not done. (20 minutes)
4. **YOU** `npm install -g eas-cli`, `eas login`, then `eas init` once in `app/`. Paste the `extra.eas.projectId` and `owner` lines it prints into `app.json` if it cannot write them itself, and commit. (10 minutes)
5. **CMD** If the art or levels changed: `npm run art` and `npm run screenshots`, then look at every image. (5 minutes)
6. **YOU** Commit everything. EAS builds what is committed. (2 minutes)

## Google Play

| # | Step | Who | Time |
| --- | --- | --- | --- |
| G1 | Play Console developer account: one-off registration fee, identity verification. Skip if you already have one (D4). | YOU | 30 minutes, then up to a few days for Google to verify identity |
| G2 | `eas build --profile preview --platform android`. On the first build accept "generate a new keystore": EAS keeps it. | CMD + EAS | 5 minutes of yours, 15 to 25 building |
| G3 | Install the APK on a real phone and work through "Checklist on a real phone" in `app/README.md`. **This is the first time the app runs on Android.** If the screen is blank, see the README note about the INTERNET permission. | YOU | 1 hour |
| G4 | Play Console: Create app. Name, default language English (United Kingdom), Game, Free (D5). Accept the declarations. | YOU | 10 minutes |
| G5 | App content, all of it: privacy policy URL; ads "No"; app access "all functionality available without special access"; content rating questionnaire (IARC); target audience (D8); data safety "No data collected" while `statsUrl` is empty; the full answers for the release that switches statistics on are in `app/README.md`; government, financial and health declarations "No"; news app "No". | YOU | 45 minutes |
| G6 | **Closed test, if your account needs it.** Google's help page "App testing requirements for new personal developer accounts" says that developers with personal accounts created after 13 November 2023 must run a closed test with at least 12 testers who have been opted in continuously for at least 14 days before they can apply for production access, and that the application is then reviewed, usually within seven days. The page speaks only of personal accounts; it does not mention organisation accounts. Play Console's Dashboard tells you whether your account is one of these. If it is: create a closed testing track, add 12 or more testers by email, send them the opt-in link, and keep them opted in for 14 days. | YOU | 1 hour to set up, then **14 days of waiting**, then **up to about 7 days** for Google to review the production application |
| G7 | `eas build --profile production --platform android` to make the signed `.aab`. | CMD + EAS | 5 minutes of yours, 15 to 25 building |
| G8 | Upload the `.aab` **by hand** to the track from G6 (or to Internal testing if G6 does not apply): Testing, Create new release. Accept Play App Signing. Google requires the first upload of a new app to be manual. The package name becomes permanent here. | YOU | 15 minutes |
| G9 | Main store listing: text from `app/store/play-store-listing.md`, icon `play-icon-512.png`, feature graphic, the eight files in `screenshots/android/` in order with their alt text. Add the English (United States) translation. | YOU | 30 minutes |
| G10 | Store settings: category Sports, tags, contact email (D6). Pricing and distribution: countries (D9). | YOU | 10 minutes |
| G11 | If G6 applied: after the 14 days, Dashboard, "Apply for production", and answer the questions about how you tested and what you changed. | YOU | 30 minutes, then Google's review |
| G12 | Production, Create new release, promote the tested build (or upload a new one with a higher `versionCode`), release notes from the listing document, **Send for review**. | YOU | 15 minutes, then Google's review (hours to several days for a new app) |
| G13 | For later releases only: create a Google service-account key (the `eas submit` prompt links to the steps), save it as `app/google-service-account.json` (ignored by git, never commit it), then `eas submit --profile production --platform android`. | YOU once, then CMD | 30 minutes once |

Google also requires new apps and updates to target Android 16 (API level 36) from 31 August 2026, according to
its "Target API level requirements" page. The generated Android project uses React Native 0.88's default, which
is 36 (read from `node_modules/react-native/gradle/libs.versions.toml`), so nothing needs doing.

## Apple App Store

| # | Step | Who | Time |
| --- | --- | --- | --- |
| A1 | Apple Account with two-factor authentication, in your legal name. | YOU | 10 minutes if you do not have one |
| A2 | **Apple Developer Program membership** (D3). Apple's enrolment page gives the fee as 99 US dollars a year, charged in local currency where available, and says to contact them if no confirmation arrives within 24 hours of purchase. It warns that using an alias instead of your legal name, or someone else's card, delays approval. | YOU | 20 minutes, then usually a day or two; longer for an organisation |
| A3 | Sign the current agreements in App Store Connect (Business). A free app needs only the free-apps agreement; tax and banking forms are needed before anything is sold. | YOU | 10 minutes |
| A4 | Register the bundle identifier (D2). `eas build` offers to do this for you when you sign in with your Apple ID; saying yes is the simple route. It becomes permanent at A9. | YOU (your Apple login) | included in A6 |
| A5 | **App Store Connect record:** Apps, New App. Platform iOS, name "One-Man Team: Football Puzzle" (must be unique on the store; if it is taken, that is a decision for you), primary language English (U.K.), the bundle ID from A4, and an SKU of your choice such as `onemanteam` (never shown, cannot be changed). Copy the numeric Apple ID of the app from App Information. | YOU | 15 minutes |
| A6 | Fill in `eas.json`, `submit.production.ios`: `appleId` (your Apple ID email), `ascAppId` (the number from A5), `appleTeamId` (ten characters, from developer.apple.com, Membership). Until then `eas submit --platform ios` stops with a message naming the three placeholders. Builds are not affected. | YOU | 5 minutes |
| A7 | For a build you can install directly: register your iPhone with `eas device:create` (open the link on the phone, install the profile), then `eas build --profile preview --platform ios`. Sign in with your Apple ID when asked and let EAS create the distribution certificate and provisioning profile. Optional if you go straight to TestFlight. | YOU + EAS | 15 minutes of yours, 20 to 30 building |
| A8 | `eas build --profile production --platform ios`. Let EAS manage signing. The build happens on Expo's Macs: you do not need one. | CMD (with your Apple login) + EAS | 5 minutes of yours, 20 to 30 building |
| A9 | `eas submit --profile production --platform ios`. This uploads the build to App Store Connect. **The bundle identifier is permanent from here.** Apple then processes the build. | CMD | 5 minutes, then 10 to 30 minutes of processing |
| A10 | TestFlight: add yourself as an internal tester, install the TestFlight app on an iPhone, install the build, and work through "Checklist on a real iPhone" in `app/README.md`. **This is the first time the app runs on iOS.** Internal testers need no review. | YOU | 1 hour |
| A11 | Fix anything A10 found. Each new upload needs a higher `ios.buildNumber` in `app.json`. Repeat A8 to A10. | YOU + CMD | varies |
| A12 | App Information: subtitle, category (Games, Sports), content rights, **age rating** questionnaire (answers in `app-store-listing.md`; expected 4+). | YOU | 20 minutes |
| A13 | **App Privacy:** privacy policy URL, then "Data Not Collected" (answers in `app-store-listing.md`). Publish the answers. | YOU | 10 minutes |
| A14 | Pricing and Availability: price (D5), countries (D9). | YOU | 5 minutes |
| A15 | The version page (1.0.0): promotional text, description, keywords, support URL, copyright, and the ten files in `screenshots/ios/` in order under the 6.9-inch iPhone size. Add the English (U.S.) localisation. | YOU | 30 minutes |
| A16 | Select the build from A9. No export-compliance question should appear, because the build declares that it uses no non-exempt encryption; if it does appear, the answer is that the app uses none. | YOU | 5 minutes |
| A17 | App Review Information: your contact details, sign-in not required, and the notes from `app-store-listing.md`. Choose manual or automatic release. | YOU | 10 minutes |
| A18 | **Add for Review**, then **Submit**. | YOU | 2 minutes, then Apple's review (often a day or two; no figure was checked for this document) |

Two Apple rules that affect dates:

- Since 28 April 2026, Apple's "Upcoming requirements" page says uploads must be built with Xcode 26 or later using
  the iOS 26 SDK. Expo's own note on that rule says the default EAS build image for SDK 54 and 55 already uses
  Xcode 26; it does not mention SDK 58 by name, so check the "Xcode" line in the first iOS build log.
- Apple's screenshot page says screenshots for the folding iPhone will be required from April 2027 for apps built
  with the iOS 27.1 SDK or later. Nothing to do today.

## What needs a Mac, and what does not

- **No Mac needed:** building (`eas build` runs on Expo's Macs), signing (EAS creates and stores the certificate
  and profile using your Apple login), uploading (`eas submit`), TestFlight, every App Store Connect form.
- **A Mac is needed only for:** running the app in the iOS Simulator (`development-simulator` profile), attaching
  Safari's Web Inspector to the web view in a development build, and reading device crash logs in Xcode. All three
  are for debugging; none is on the path to release.
- **An iPhone is needed** for A10. Nothing here substitutes for that.

## Verified, and not

Verified on 21 November 2026 in a Linux sandbox with no Android SDK, no Mac, no device and no EAS or store login
(commands and their output are in the final section of `app/README.md`):

- the shell and bridge tests, type check, lint, `expo export` for both platforms;
- `npm run check-native`: the generated store-build Info.plist has no usage-description string, declares no
  non-exempt encryption, is iPhone only and portrait; the privacy manifest is written; the Android manifest's only
  permission is VIBRATE;
- `eas.json` against the schema eas-cli uses (the `@expo/eas-json` package), without logging in;
- every listing length, by `npm run check-listing`.

Not verified: every step in the two tables above. In particular nobody has seen the app start on an iPhone or an
Android phone, the signing flow, `eas submit`, or either console's forms as they look today.

## Sources

All read on 21 November 2026.

- App testing requirements for new personal developer accounts, Google Play Console Help: https://support.google.com/googleplay/android-developer/answer/14151465?hl=en
- Add preview assets to showcase your app, Google Play Console Help: https://support.google.com/googleplay/android-developer/answer/9866151?hl=en-GB
- Target API level requirements for Google Play apps, Android Developers: https://developer.android.com/google/play/requirements/target-sdk
- Screenshot specifications, App Store Connect Help: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
- App information and Platform version information, App Store Connect Help: https://developer.apple.com/help/app-store-connect/reference/app-information/
- Age ratings, App Store Connect Help: https://developer.apple.com/help/app-store-connect/reference/age-ratings
- App privacy details on the App Store, Apple Developer: https://developer.apple.com/support/app-privacy-on-the-app-store
- Enrollment, Apple Developer Support: https://developer.apple.com/support/enrollment/
- SDK minimum requirements, Apple Developer, Upcoming requirements: https://developer.apple.com/news/upcoming-requirements/?id=04282026a
- App Store Connect minimum SDK 26, Expo blog: https://expo.dev/blog/app-store-connect-minimum-sdk-26.md
- The EAS submit and build profile schema: the `@expo/eas-json` package, version 27.11.0, read from npm

Not sourced, from general knowledge, check in the consoles: the Play registration fee, typical review times for
either store, the 500-character limit on Play release notes, and that Google requires a manual first upload.
