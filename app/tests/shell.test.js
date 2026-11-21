/* Node checks for the pure parts of the shell: message parsing, save validation, haptic mapping, link allow-list,
   script escaping, and the few facts in the config that must not drift. Run by `npm test`. */
const assert = require('assert');
const path = require('path');
const S = require('../src/page-script.js');
const { GAME_HTML } = require('../src/game-html.js');
const app = require('../app.json').expo;
const eas = require('../eas.json');

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

t('externalUrl allows the privacy policy and refuses look-alikes', () => {
  assert.strictEqual(S.externalUrl('https://ollywoodgames.github.io/privacy.html'), 'https://ollywoodgames.github.io/privacy.html');
  for (const bad of ['http://ollywoodgames.github.io/privacy.html', 'https://ollywoodgames.github.io.evil.com/', 'https://x@ollywoodgames.github.io/',
    'https://ollywoodgames.github.io@evil.com/', 'javascript:alert(1)', 'intent://scan/#Intent;end', 'file:///etc/hosts', S.BASE_URL, '', null]) {
    assert.strictEqual(S.externalUrl(bad), null, String(bad));
  }
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
  const doc = { documentElement: { style: { setProperty() {} } }, addEventListener() {} };
  new Function('window', 'document', 'Event', 'CustomEvent', script)(win, doc, function () {}, function () {});
  assert.strictEqual(win.__OMT_NATIVE__.save, save);
  assert.strictEqual(win.__OMT_NATIVE__.version, '1.0.0');
  assert.strictEqual(typeof win.__omtShell.back, 'function');
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
  const fs = require('fs');
  for (const f of [app.icon, app.android.adaptiveIcon.foregroundImage, app.android.adaptiveIcon.backgroundImage, app.android.adaptiveIcon.monochromeImage,
    app.plugins.find(p => Array.isArray(p) && p[0] === 'expo-splash-screen')[1].image]) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', f)), 'missing asset ' + f);
  }
});

console.log('shell.test.js: ' + n + ' checks passed');
