/* Node checks for the pure parts of the shell: message parsing, save validation, haptic mapping, link allow-list,
   script escaping, and the few facts in the config that must not drift. Run by `npm test`. */
const assert = require('assert');
const path = require('path');
const S = require('../src/page-script.js');
const { GAME_HTML } = require('../src/game-html.js');
const app = require('../app.json').expo;
const eas = require('../eas.json');
const fs = require('fs');

/* PNG facts read straight from the file: size, and whether any pixel can be transparent (colour type with alpha,
   or a tRNS chunk). Apple rejects an app icon that has an alpha channel. */
function png(file) {
  const b = fs.readFileSync(file);
  assert.strictEqual(b.toString('latin1', 1, 4), 'PNG', file + ' is not a PNG');
  const colourType = b[25];
  let trns = false;
  for (let at = 8; at < b.length;) { const len = b.readUInt32BE(at), type = b.toString('latin1', at + 4, at + 8); if (type === 'tRNS') trns = true; if (type === 'IDAT') break; at += 12 + len; }
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), alpha: colourType === 4 || colourType === 6 || trns };
}

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('  ok  ' + name); };

t('parseMessage accepts only JSON objects with a string type', () => {
  assert.deepStrictEqual(S.parseMessage('{"t":"save","v":"{}"}'), { t: 'save', v: '{}' });
  for (const bad of ['', 'x', '[]', 'null', '{"t":1}', '{"v":1}', 42, null, undefined, '"save"']) assert.strictEqual(S.parseMessage(bad), null);
  assert.strictEqual(S.parseMessage('{"t":"save","v":"' + 'x'.repeat(S.MAX_SAVE_CHARS + 2048) + '"}'), null);
});

t('validSave accepts a JSON object string and nothing else', () => {
  assert.ok(S.validSave('{"done":{}}'));
  for (const bad of ['', '[]', 'null', '1', '{', undefined, null, {}, '"x"']) assert.ok(!S.validSave(bad));
});

t('hapticPlan maps every value the game sends today', () => {
  assert.deepStrictEqual(S.hapticPlan(8), { kind: 'impact', style: 'light' });        // first touch
  assert.deepStrictEqual(S.hapticPlan(10), { kind: 'impact', style: 'light' });       // softest kick
  assert.deepStrictEqual(S.hapticPlan(24), { kind: 'impact', style: 'medium' });      // hardest kick
  assert.deepStrictEqual(S.hapticPlan(50), { kind: 'impact', style: 'heavy' });       // thud
  assert.deepStrictEqual(S.hapticPlan([18, 40, 18]), { kind: 'pattern', pattern: [0, 18, 40, 18] });
  assert.deepStrictEqual(S.hapticPlan([40, 50, 40, 50, 140]), { kind: 'pattern', pattern: [0, 40, 50, 40, 50, 140] });
  assert.deepStrictEqual(S.hapticPlan([9000, 10]), { kind: 'pattern', pattern: [0, 400, 10] });
  for (const bad of [0, -5, NaN, Infinity, 'x', null, undefined, {}, [], ['a'], [0, 50], [-1]]) assert.deepStrictEqual(S.hapticPlan(bad), { kind: 'none' });
});

t('hapticPlan on iOS: taps are the same, rhythms become timed Taptic impacts (never the long system buzz)', () => {
  assert.deepStrictEqual(S.hapticPlan(8, 'ios'), { kind: 'impact', style: 'light' });
  assert.deepStrictEqual(S.hapticPlan(50, 'ios'), { kind: 'impact', style: 'heavy' });
  assert.deepStrictEqual(S.hapticPlan([18, 40, 18], 'ios'), { kind: 'sequence', steps: [{ at: 0, style: 'medium' }, { at: 58, style: 'medium' }] });                 // denied
  assert.deepStrictEqual(S.hapticPlan([30, 60, 60], 'ios'), { kind: 'sequence', steps: [{ at: 0, style: 'medium' }, { at: 90, style: 'heavy' }] });                  // whistle
  assert.deepStrictEqual(S.hapticPlan([40, 50, 40, 50, 140], 'ios'),
    { kind: 'sequence', steps: [{ at: 0, style: 'heavy' }, { at: 90, style: 'heavy' }, { at: 180, style: 'heavy' }] });                                             // goal
  assert.deepStrictEqual(S.hapticPlan([20, 30, 40], 'ios'), { kind: 'sequence', steps: [{ at: 0, style: 'medium' }, { at: 50, style: 'heavy' }] });                  // third star
  assert.deepStrictEqual(S.hapticPlan([18], 'ios'), { kind: 'impact', style: 'medium' });
  for (const bad of [0, [], [0, 50], 'x', null]) assert.deepStrictEqual(S.hapticPlan(bad, 'ios'), { kind: 'none' });
  // every vibration call in the game's own audio code maps to something on both platforms
  const audio = fs.readFileSync(path.join(__dirname, '..', '..', 'one-man-team', 'js', 'audio.js'), 'utf8');
  const literals = [...audio.matchAll(/buzz\((\[[\d, ]+\]|\d+)\)/g)].map(m => JSON.parse(m[1]));
  assert.ok(literals.length >= 6, 'expected to find the game\'s buzz() calls');
  for (const p of literals) for (const os of ['android', 'ios']) assert.notStrictEqual(S.hapticPlan(p, os).kind, 'none', os + ' ' + JSON.stringify(p));
});

t('externalUrl allows the privacy policy and refuses look-alikes', () => {
  assert.strictEqual(S.externalUrl('https://ollywoodgames.github.io/privacy.html'), 'https://ollywoodgames.github.io/privacy.html');
  assert.ok(S.externalUrl('https://apps.apple.com/app/id1234567890') && S.externalUrl('https://play.google.com/store/apps/details?id=com.ollywoodgames.onemanteam'));
  for (const bad of ['http://ollywoodgames.github.io/privacy.html', 'https://ollywoodgames.github.io.evil.com/', 'https://x@ollywoodgames.github.io/',
    'https://ollywoodgames.github.io@evil.com/', 'javascript:alert(1)', 'intent://scan/#Intent;end', 'file:///etc/hosts', S.BASE_URL, '', null]) {
    assert.strictEqual(S.externalUrl(bad), null, String(bad));
  }
});

t('shareText passes a daily result and refuses anything that is not plain text of a sane length', () => {
  const ok = 'One-Man Team \u00b7 Daily 34\nBend the run \u00b7 6.8 s \u00b7 3 takes\nGaffer\u2019s time 6.4 s. Your turn:\nhttps://ollywoodgames.github.io/one-man-team/?daily=34';
  assert.strictEqual(S.shareText(ok), ok);
  assert.strictEqual(S.shareText('  a\u0000b\u0007  '), 'ab');
  for (const bad of ['', '   ', 'x'.repeat(601), null, undefined, 42, {}, ['a']]) assert.strictEqual(S.shareText(bad), null, String(bad));
});

t('isOwnUrl recognises only the page itself', () => {
  assert.ok(S.isOwnUrl(S.BASE_URL)); assert.ok(S.isOwnUrl('about:blank')); assert.ok(S.isOwnUrl(S.BASE_URL + '#x'));
  assert.ok(!S.isOwnUrl('https://ollywoodgames.github.io/privacy.html')); assert.ok(!S.isOwnUrl(undefined));
});

t('a hostile save cannot break out of the inline script', () => {
  const save = JSON.stringify({ done: { '</script><script>alert(1)</script>': { stars: 3 }, '<!--': 1, 'line\u2028sep': 1 } });
  const script = S.bootstrapScript({ save, version: '1.0.0', insets: { top: 24, right: 0, bottom: 16, left: 0 } });
  assert.ok(!/<\/script/i.test(script) && !script.includes('<!--') && !script.includes('\u2028'));
  const html = S.withBootstrap(GAME_HTML, script);
  assert.strictEqual(html.length, GAME_HTML.length + script.length + '<script></script>'.length);
  assert.ok(html.indexOf(script) < html.indexOf('<script>\n'), 'bootstrap must come before the game scripts');
  // the script must evaluate, and hand back exactly the save it was given
  const win = { addEventListener() {} };
  const made = [];
  const doc = { documentElement: { style: { setProperty() {} }, appendChild(el) { made.push(el); } }, addEventListener() {}, getElementById() { return null; }, createElement() { return {}; } };
  new Function('window', 'document', 'Event', 'CustomEvent', script)(win, doc, function () {}, function () {});
  assert.strictEqual(win.__OMT_NATIVE__.save, save);
  assert.ok(made.length === 1 && made[0].id === 'omt-shell-css' && made[0].textContent === S.SHELL_CSS, 'the shell stylesheet is added');
  assert.strictEqual(win.__OMT_NATIVE__.version, '1.0.0');
  assert.strictEqual(win.__OMT_NATIVE__.platform, 'android');
  assert.strictEqual(typeof win.__omtShell.back, 'function');
});

t('the bootstrap script tells the page which platform it is on', () => {
  for (const [given, expected] of [['ios', 'ios'], ['android', 'android'], [undefined, 'android'], ['web', 'android']]) {
    const win = { addEventListener() {} }, doc = { documentElement: null, addEventListener() {}, getElementById() { return null; } };
    new Function('window', 'document', 'Event', 'CustomEvent', S.bootstrapScript({ save: null, version: '1.0.0', insets: {}, platform: given }))(win, doc, function () {}, function () {});
    assert.strictEqual(win.__OMT_NATIVE__.platform, expected);
  }
  assert.ok(/overscroll-behavior:none!important/.test(S.SHELL_CSS) && /-webkit-touch-callout:none/.test(S.SHELL_CSS));
});

t('no save means save: null (the game then uses its own localStorage copy)', () => {
  const win = { addEventListener() {} }, doc = { documentElement: null, addEventListener() {} };
  new Function('window', 'document', 'Event', 'CustomEvent', S.bootstrapScript({ save: null, version: '1.0.0', insets: {} }))(win, doc, function () {}, function () {});
  assert.strictEqual(win.__OMT_NATIVE__.save, null);
});

t('config: version, package, permissions and build types are what the README says', () => {
  assert.strictEqual(app.version, '1.0.0');
  assert.strictEqual(app.android.versionCode, 1);
  assert.strictEqual(app.android.package, 'com.ollywoodgames.onemanteam');
  assert.strictEqual(app.orientation, 'portrait');
  assert.deepStrictEqual(app.android.permissions, ['android.permission.VIBRATE']);
  assert.strictEqual(require('../package.json').version, app.version);
  assert.strictEqual(eas.build.preview.android.buildType, 'apk');
  assert.strictEqual(eas.build.production.android.buildType, 'app-bundle');
  assert.strictEqual(eas.build.development.developmentClient, true);
  const cfg = require('../app.config.js');
  const blocked = profile => { process.env.EAS_BUILD_PROFILE = profile; return cfg({ config: JSON.parse(JSON.stringify(app)) }).android.blockedPermissions; };
  assert.ok(blocked('production').includes('android.permission.INTERNET'));
  assert.ok(blocked('preview').includes('android.permission.INTERNET'));
  assert.ok(!blocked('development').includes('android.permission.INTERNET'));
  delete process.env.EAS_BUILD_PROFILE;
  for (const f of [app.icon, app.android.adaptiveIcon.foregroundImage, app.android.adaptiveIcon.backgroundImage, app.android.adaptiveIcon.monochromeImage,
    app.plugins.find(p => Array.isArray(p) && p[0] === 'expo-splash-screen')[1].image]) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', f)), 'missing asset ' + f);
  }
});

t('config: iOS identifiers, portrait, iPhone only, no encryption claim, privacy manifest, icon without alpha', () => {
  const ios = app.ios;
  assert.deepStrictEqual(app.platforms, ['android', 'ios']);
  assert.strictEqual(ios.bundleIdentifier, 'com.ollywoodgames.onemanteam');   // PLACEHOLDER until the owner confirms; permanent after the first upload
  assert.ok(/^[1-9]\d*$/.test(ios.buildNumber), 'ios.buildNumber must be a whole number in a string');
  assert.strictEqual(ios.supportsTablet, false);
  assert.strictEqual(ios.config.usesNonExemptEncryption, false);
  assert.strictEqual(ios.infoPlist.RCTAsyncStorageExcludeFromBackup, false);
  // no permission prompt of any kind: the config asks for no usage-description string
  const plistText = JSON.stringify(ios.infoPlist) + JSON.stringify(app.plugins);
  assert.ok(!/UsageDescription/.test(plistText), 'no NS...UsageDescription key belongs in this app');
  assert.ok(!ios.entitlements && !ios.associatedDomains && !ios.usesAppleSignIn && !ios.usesIcloudStorage);
  // privacy manifest: no tracking, nothing collected, and a reason for every required-reason API category that an
  // installed dependency declares in its own PrivacyInfo.xcprivacy
  const pm = ios.privacyManifests;
  assert.strictEqual(pm.NSPrivacyTracking, false);
  assert.deepStrictEqual(pm.NSPrivacyTrackingDomains, []);
  assert.deepStrictEqual(pm.NSPrivacyCollectedDataTypes, []);
  const declared = {};
  pm.NSPrivacyAccessedAPITypes.forEach(e => { declared[e.NSPrivacyAccessedAPIType] = new Set(e.NSPrivacyAccessedAPITypeReasons); });
  const nm = path.join(__dirname, '..', 'node_modules');
  const found = [];
  (function walk(dir, depth) {
    if (depth > 7) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (!/^(android|windows|macos|__tests__|docs|build|lib|dist|src)$/.test(e.name) || depth < 2) walk(p, depth + 1); }
      else if (e.name === 'PrivacyInfo.xcprivacy' && !/template/i.test(p)) found.push(p);
    }
  })(nm, 0);
  assert.ok(found.length >= 5, 'expected to find the dependencies\' privacy manifests (run npm ci first)');
  for (const f of found) {
    const xml = fs.readFileSync(f, 'utf8');
    assert.ok(!/<key>NSPrivacyTracking<\/key>\s*<true\/>/.test(xml), f + ' declares tracking');
    for (const m of xml.matchAll(/<key>NSPrivacyAccessedAPIType<\/key>\s*<string>(\w+)<\/string>\s*<key>NSPrivacyAccessedAPITypeReasons<\/key>\s*<array>([\s\S]*?)<\/array>/g)) {
      assert.ok(declared[m[1]], 'app.json privacy manifest is missing ' + m[1] + ' (declared by ' + path.relative(nm, f) + ')');
      for (const r of m[2].matchAll(/<string>([\w.]+)<\/string>/g)) assert.ok(declared[m[1]].has(r[1]), 'app.json privacy manifest is missing reason ' + r[1] + ' for ' + m[1] + ' (' + path.relative(nm, f) + ')');
    }
  }
  const icon = png(path.join(__dirname, '..', ios.icon));
  assert.deepStrictEqual(icon, { width: 1024, height: 1024, alpha: false }, 'the iOS icon must be 1024 x 1024 with no alpha channel');
});

t('config: store builds drop the dev-only local-network keys from the iOS Info.plist', () => {
  const cfg = require('../app.config.js');
  const build = profile => { if (profile) process.env.EAS_BUILD_PROFILE = profile; else delete process.env.EAS_BUILD_PROFILE; return cfg({ config: JSON.parse(JSON.stringify(app)) }); };
  for (const profile of ['preview', 'production']) {
    const out = build(profile);
    assert.strictEqual(typeof out.plugins[0], 'function', 'the stripping plugin must be first in the list (it then runs last)');
    assert.strictEqual(out.plugins.length, app.plugins.length + 1);
  }
  for (const profile of ['development', 'development-simulator', undefined]) assert.deepStrictEqual(build(profile).plugins, app.plugins);
  delete process.env.EAS_BUILD_PROFILE;
});

t('eas.json: iOS profiles for simulator, device, internal testing and the store; submit profiles for both stores', () => {
  assert.strictEqual(eas.cli.appVersionSource, 'local');
  assert.strictEqual(eas.build.development.ios.simulator, false);
  assert.strictEqual(eas.build['development-simulator'].extends, 'development');
  assert.strictEqual(eas.build['development-simulator'].ios.simulator, true);
  assert.strictEqual(eas.build.preview.distribution, 'internal');
  assert.strictEqual(eas.build.preview.ios.simulator, false);
  assert.ok(!eas.build.production.distribution && !eas.build.production.developmentClient, 'production is a plain store build');
  assert.deepStrictEqual(Object.keys(eas.submit.production).sort(), ['android', 'ios']);
  assert.strictEqual(eas.submit.production.android.track, 'internal');
  assert.strictEqual(eas.submit.production.android.releaseStatus, 'draft');
  // the key file named here must be one .gitignore refuses to commit
  assert.ok(/^\.\/google-service-account[\w.-]*\.json$/.test(eas.submit.production.android.serviceAccountKeyPath));
  // each iOS value is either still the placeholder or already in the shape Apple issues
  const i = eas.submit.production.ios, ph = v => /^REPLACE_WITH_/.test(v);
  assert.ok(ph(i.appleId) || /^[^@\s]+@[^@\s]+$/.test(i.appleId));
  assert.ok(ph(i.ascAppId) || /^\d+$/.test(i.ascAppId));
  assert.ok(ph(i.appleTeamId) || /^[\dA-Z]{10}$/.test(i.appleTeamId));
});

console.log('shell.test.js: ' + n + ' checks passed');
