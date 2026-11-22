#!/usr/bin/env node
/* Generates the native projects in a scratch copy OUTSIDE the repository and checks the files the stores care about.

     npm run check-native            store build (EAS profile "production") for android and ios
     npm run check-native -- --keep  the same, and leaves the scratch folder in place so the files can be read

   It runs `expo prebuild` (Continuous Native Generation: the same step EAS runs before compiling), so it needs no
   Android SDK, no Xcode and no Mac. It proves what is IN the generated Info.plist, PrivacyInfo.xcprivacy and
   AndroidManifest.xml. It does not compile anything and proves nothing about a running app. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { spawnSync } = require('child_process');

const APP = path.join(__dirname, '..');
const keep = process.argv.includes('--keep');
const app = require(path.join(APP, 'app.json')).expo;
const SKIP = new Set(['node_modules', '.expo', 'dist', 'android', 'ios', 'store']);

function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (from === APP && SKIP.has(e.name)) continue;
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copy(a, b); else fs.copyFileSync(a, b);
  }
}
function prebuild(profile) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'omt-native-'));
  const scratch = path.join(dir, 'app');
  copy(APP, scratch);
  fs.symlinkSync(path.join(APP, 'node_modules'), path.join(scratch, 'node_modules'), 'dir');
  const env = { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' };
  if (profile) env.EAS_BUILD_PROFILE = profile; else delete env.EAS_BUILD_PROFILE;
  for (const platform of ['android', 'ios']) {
    const r = spawnSync('npx', ['expo', 'prebuild', '--platform', platform, '--no-install'], { cwd: scratch, env, encoding: 'utf8' });
    if (r.status !== 0) { console.error(r.stdout + r.stderr); throw new Error('expo prebuild failed for ' + platform + ' (' + (profile || 'no profile') + ')'); }
  }
  return { dir, scratch };
}
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
/* The value that follows <key>name</key> in a plist, as raw XML. */
function plistValue(xml, key) {
  const m = new RegExp('<key>' + key + '</key>\\s*(<(\\w+)>[\\s\\S]*?</\\2>|<\\w+/>)').exec(xml);
  return m ? m[1].replace(/\s+/g, ' ') : null;
}
const keysOf = xml => [...xml.matchAll(/<key>([^<]+)<\/key>/g)].map(m => m[1]);

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('  ok  ' + name); };
const made = [];
try {
  console.log('store build (EAS_BUILD_PROFILE=production)');
  const store = prebuild('production'); made.push(store.dir);
  const iosDir = path.join(store.scratch, 'ios');
  const target = fs.readdirSync(iosDir).find(f => fs.existsSync(path.join(iosDir, f, 'Info.plist')));
  const plist = read(iosDir, target, 'Info.plist');
  const pbx = read(iosDir, target + '.xcodeproj', 'project.pbxproj');
  const privacy = read(iosDir, target, 'PrivacyInfo.xcprivacy');
  const manifest = read(store.scratch, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  const gradle = read(store.scratch, 'android', 'app', 'build.gradle');

  t('iOS: bundle identifier, version and build number come from app.json', () => {
    assert.ok(pbx.includes('PRODUCT_BUNDLE_IDENTIFIER = "' + app.ios.bundleIdentifier + '"') || pbx.includes('PRODUCT_BUNDLE_IDENTIFIER = ' + app.ios.bundleIdentifier + ';'));
    assert.strictEqual(plistValue(plist, 'CFBundleShortVersionString'), '<string>' + app.version + '</string>');
    assert.strictEqual(plistValue(plist, 'CFBundleVersion'), '<string>' + app.ios.buildNumber + '</string>');
    assert.strictEqual(plistValue(plist, 'CFBundleDisplayName'), '<string>' + app.name + '</string>');
  });
  t('iOS: iPhone only (TARGETED_DEVICE_FAMILY = 1), portrait only', () => {
    const fam = [...pbx.matchAll(/TARGETED_DEVICE_FAMILY = "?([\d,]+)"?;/g)].map(m => m[1]);
    assert.ok(fam.length > 0 && fam.every(f => f === '1'), 'device families: ' + fam);
    const o = plistValue(plist, 'UISupportedInterfaceOrientations');
    assert.ok(/UIInterfaceOrientationPortrait</.test(o) && !/Landscape/.test(o), o);
    assert.strictEqual(plistValue(plist, 'UISupportedInterfaceOrientations~ipad'), null);
  });
  t('iOS: no usage-description string and no Bonjour key in the store Info.plist', () => {
    const bad = keysOf(plist).filter(k => /UsageDescription$/.test(k) || k === 'NSBonjourServices');
    assert.deepStrictEqual(bad, []);
  });
  t('iOS: ITSAppUsesNonExemptEncryption is false; arbitrary network loads are not allowed', () => {
    assert.strictEqual(plistValue(plist, 'ITSAppUsesNonExemptEncryption'), '<false/>');
    assert.ok(/<key>NSAllowsArbitraryLoads<\/key>\s*<false\/>/.test(plist));
  });
  t('iOS: light appearance, dark status-bar text, launch storyboard, the save is included in device backups', () => {
    assert.strictEqual(plistValue(plist, 'UIUserInterfaceStyle'), '<string>Light</string>');
    assert.strictEqual(plistValue(plist, 'UIStatusBarStyle'), '<string>UIStatusBarStyleDarkContent</string>');
    assert.strictEqual(plistValue(plist, 'UILaunchStoryboardName'), '<string>SplashScreen</string>');
    assert.strictEqual(plistValue(plist, 'RCTAsyncStorageExcludeFromBackup'), '<false/>');
  });
  t('iOS: no entitlements (no push, iCloud, Sign in with Apple, associated domains)', () => {
    const ent = fs.readdirSync(path.join(iosDir, target)).filter(f => f.endsWith('.entitlements')).map(f => read(iosDir, target, f)).join('');
    assert.deepStrictEqual(keysOf(ent), []);
  });
  t('iOS: privacy manifest written with no tracking, nothing collected, four required-reason API categories', () => {
    assert.ok(/<key>NSPrivacyTracking<\/key>\s*<false\/>/.test(privacy));
    assert.ok(/<key>NSPrivacyCollectedDataTypes<\/key>\s*<array\/>/.test(privacy));
    for (const e of app.ios.privacyManifests.NSPrivacyAccessedAPITypes) {
      assert.ok(privacy.includes(e.NSPrivacyAccessedAPIType), e.NSPrivacyAccessedAPIType);
      for (const r of e.NSPrivacyAccessedAPITypeReasons) assert.ok(privacy.includes('<string>' + r + '</string>'), r);
    }
    assert.ok(pbx.includes('PrivacyInfo.xcprivacy'), 'the manifest must be part of the Xcode project');
  });
  t('iOS: one 1024 x 1024 app icon without alpha, and a splash logo', () => {
    const set = path.join(iosDir, target, 'Images.xcassets', 'AppIcon.appiconset');
    const icons = fs.readdirSync(set).filter(f => f.endsWith('.png'));
    assert.strictEqual(icons.length, 1);
    const b = fs.readFileSync(path.join(set, icons[0]));
    assert.deepStrictEqual([b.readUInt32BE(16), b.readUInt32BE(20)], [1024, 1024]);
    assert.ok(b[25] === 2 || b[25] === 0 || b[25] === 3, 'PNG colour type ' + b[25] + ' has an alpha channel');
    assert.ok(fs.existsSync(path.join(iosDir, target, 'Images.xcassets', 'SplashScreenLogo.imageset')));
    assert.ok(fs.existsSync(path.join(iosDir, target, 'SplashScreen.storyboard')));
  });
  t('Android: package, versionCode, portrait, backup on, predictive back off', () => {
    assert.ok(gradle.includes("applicationId '" + app.android.package + "'"));
    assert.ok(new RegExp('versionCode ' + app.android.versionCode + '\\b').test(gradle));
    assert.ok(gradle.includes('versionName "' + app.version + '"'));
    assert.ok(manifest.includes('android:screenOrientation="portrait"'));
    assert.ok(manifest.includes('android:allowBackup="true"'));
    assert.ok(manifest.includes('android:enableOnBackInvokedCallback="false"'));
  });
  t('Android: the only permission is VIBRATE; INTERNET and the template extras are removed', () => {
    const perms = [...manifest.matchAll(/<uses-permission android:name="([^"]+)"(\s+tools:node="remove")?\/>/g)];
    assert.deepStrictEqual(perms.filter(m => !m[2]).map(m => m[1]), ['android.permission.VIBRATE']);
    const removed = perms.filter(m => m[2]).map(m => m[1]);
    for (const p of ['INTERNET', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'SYSTEM_ALERT_WINDOW']) assert.ok(removed.includes('android.permission.' + p), p);
    assert.ok(!/AD_ID/.test(manifest));
  });

  console.log('development build (EAS_BUILD_PROFILE=development)');
  const dev = prebuild('development'); made.push(dev.dir);
  const devPlist = read(dev.scratch, 'ios', target, 'Info.plist');
  const devManifest = read(dev.scratch, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  t('development builds keep what the dev client needs (local network on iOS, INTERNET on Android)', () => {
    assert.ok(keysOf(devPlist).includes('NSLocalNetworkUsageDescription') && keysOf(devPlist).includes('NSBonjourServices'));
    assert.ok(!/android\.permission\.INTERNET" tools:node="remove"/.test(devManifest));
  });
  console.log('check-native.js: ' + n + ' checks passed');
  if (keep) console.log('kept: ' + made.join('  '));
} finally {
  if (!keep) for (const d of made) fs.rmSync(d, { recursive: true, force: true });
}
