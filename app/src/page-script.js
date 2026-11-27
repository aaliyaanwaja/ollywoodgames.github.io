/* Everything the native shell says to the page, as plain strings of JavaScript, plus the pure helpers that
   decide what a message from the page means. No React Native imports here, so tests can load this file in Node
   and run the very same scripts in a desktop browser (tests/). Types are in page-script.d.ts. */

/* The origin the page is given. See README, "The page's origin". `.invalid` is reserved (RFC 2606) and can never
   resolve, so nothing the page does can reach a real server through it. */
const BASE_URL = 'https://app.ollywoodgames.invalid/';

const MAX_SAVE_CHARS = 512 * 1024;

/* JSON that is safe to paste inside an inline <script>: no "</script>", no "<!--", no raw line separators. */
function scriptJson(value) {
  return JSON.stringify(value === undefined ? null : value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function cleanInsets(i) {
  const n = v => (typeof v === 'number' && isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : 0);
  return { top: n(i && i.top), right: n(i && i.right), bottom: n(i && i.bottom), left: n(i && i.left) };
}

/* Rules the shell adds on top of the game's own stylesheet, on both platforms. `!important` because this sheet is
   inserted before the game's.
   - overscroll-behavior: none on every scroller: the fixtures list and the programme pages scroll inside the page,
     where the WebView's own bounce/overscroll switches do not reach. Without this an inner list rubber-bands on iOS
     and shows the stretch or glow on Android.
   - touch-action: manipulation on the root: no double-tap zoom anywhere (the game sets `none` on the pitch itself).
   - no callout, no tap highlight: WKWebView's long-press sheet and grey flash. */
const SHELL_CSS =
  '*{overscroll-behavior:none!important;-webkit-touch-callout:none!important;-webkit-tap-highlight-color:transparent!important}' +
  'html{touch-action:manipulation;-webkit-text-size-adjust:100%!important;text-size-adjust:100%!important}';

/* Runs in the page before any of the game's own scripts. It is delivered twice (spliced into the HTML and through
   injectedJavaScriptBeforeContentLoaded) and is written so that the second arrival does nothing.
   opts.platform is 'ios' or 'android' (React Native's Platform.OS); anything else is reported as 'android'. */
function bootstrapScript(opts) {
  const platform = opts.platform === 'ios' ? 'ios' : 'android';
  const native = { save: typeof opts.save === 'string' ? opts.save : null, version: String(opts.version), platform };
  return '(function(){' +
    'if(window.__omtShell)return;' +
    'var W=window,D=document;' +
    'W.__OMT_NATIVE__=' + scriptJson(native) + ';' +
    'var post=function(m){try{W.ReactNativeWebView.postMessage(JSON.stringify(m));}catch(e){}};' +

    /* system-bar and cutout insets, measured natively, written over the page's --st/--sr/--sb/--sl variables */
    'var insets=function(i){var el=D.documentElement;if(!el)return;var s=el.style;' +
      's.setProperty("--st",i.top+"px");s.setProperty("--sr",i.right+"px");s.setProperty("--sb",i.bottom+"px");s.setProperty("--sl",i.left+"px");' +
      'try{W.dispatchEvent(new Event("resize"));}catch(e){}};' +
    'var first=' + scriptJson(cleanInsets(opts.insets)) + ';insets(first);' +
    'D.addEventListener("DOMContentLoaded",function(){insets(first);});' +

    /* the shell's own style rules (see SHELL_CSS) */
    'var css=function(){if(D.getElementById("omt-shell-css"))return;var p=D.head||D.documentElement;if(!p)return;' +
      'var s=D.createElement("style");s.id="omt-shell-css";s.textContent=' + scriptJson(SHELL_CSS) + ';p.appendChild(s);};' +
    'try{css();}catch(e){}D.addEventListener("DOMContentLoaded",function(){try{css();}catch(e){}});' +

    /* every AudioContext the page makes is remembered, so the shell can silence it when the app is backgrounded */
    'var ctxs=[],paused=[];' +
    '["AudioContext","webkitAudioContext"].forEach(function(k){var A=W[k];if(typeof A!=="function"||typeof Proxy!=="function")return;' +
      'W[k]=new Proxy(A,{construct:function(T,a){var c=new T(...a);ctxs.push(c);return c;}});});' +

    /* foreground / background, driven by React Native's AppState */
    'var active=true;' +
    'var setActive=function(on){on=!!on;if(on===active)return;active=on;' +
      'try{if(on){delete D.hidden;delete D.visibilityState;}else{' +
        'Object.defineProperty(D,"hidden",{configurable:true,get:function(){return true;}});' +
        'Object.defineProperty(D,"visibilityState",{configurable:true,get:function(){return "hidden";}});}}catch(e){}' +
      'try{D.dispatchEvent(new Event("visibilitychange"));}catch(e){}' +
      /* on return: resume what the shell suspended, and anything iOS itself interrupted (a call, Siri, an alarm) */
      'if(on){ctxs.forEach(function(c){if(paused.indexOf(c)>=0||c.state==="interrupted"){try{c.resume().catch(function(){});}catch(e){}}});paused=[];}' +
      'else{ctxs.forEach(function(c){if(c.state==="running"){paused.push(c);try{c.suspend().catch(function(){});}catch(e){}}});}};' +

    /* hardware back: ask the game; tell the shell whether it did anything */
    'var back=function(){var h=false;try{h=!!(W.__omt&&W.__omt.back&&W.__omt.back()!==false);}catch(e){}post({t:"back",handled:h});};' +

    /* native -> page for anything added later (advert finished, purchase restored ...) */
    'var receive=function(m){try{W.dispatchEvent(new CustomEvent("omt:native",{detail:m}));}catch(e){}};' +

    'W.__omtShell={insets:insets,setActive:setActive,back:back,receive:receive};' +

    /* links that leave the page go to the system browser, never into the WebView */
    'D.addEventListener("click",function(e){var a=e.target&&e.target.closest?e.target.closest("a[href]"):null;if(!a)return;' +
      'var u;try{u=new URL(a.getAttribute("href"),location.href);}catch(x){return;}' +
      'if(u.origin===location.origin)return;e.preventDefault();e.stopPropagation();post({t:"open",url:u.href});},true);' +

    /* the web build registers a service worker on https origins; inside the app there is nothing to fetch */
    'try{if(navigator.serviceWorker)navigator.serviceWorker.register=function(){return Promise.reject(new Error("no service worker in the app"));};}catch(e){}' +

    /* no long-press menu, no text selection, no drag ghosts (pinch zoom is off in the WebView settings) */
    '["contextmenu","selectstart","dragstart"].forEach(function(n){D.addEventListener(n,function(e){' +
      'var t=e.target;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"))return;e.preventDefault();},true);});' +
    'W.addEventListener("error",function(e){post({t:"log",level:"error",m:String(e.message||e.error||"error").slice(0,300)});});' +
    '})();true;';
}

/* Puts the bootstrap script first in <head>, ahead of every script of the page. The embedded HTML itself is never
   changed on disk; this happens in memory when the app starts. */
function withBootstrap(html, script) {
  const tag = '<script>' + script.replace(/<\/script/gi, '<\\/script') + '</script>';
  const at = html.indexOf('<head>');
  if (at < 0) throw new Error('game HTML has no <head>');
  return html.slice(0, at + 6) + tag + html.slice(at + 6);
}

const call = body => '(function(){var s=window.__omtShell;if(s){' + body + '}})();true;';
const setActiveScript = active => call('s.setActive(' + (active ? 'true' : 'false') + ');');
const insetsScript = insets => call('s.insets(' + scriptJson(cleanInsets(insets)) + ');');
const receiveScript = msg => call('s.receive(' + scriptJson(msg) + ');');
/* If the shell object is missing (page not loaded yet), still answer, so the app can leave. */
const backScript = () =>
  '(function(){var s=window.__omtShell;if(s){s.back();}else{try{window.ReactNativeWebView.postMessage(\'{"t":"back","handled":false}\');}catch(e){}}})();true;';

/* A message from the page: a JSON object with a string `t`. Anything else is dropped. */
function parseMessage(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_SAVE_CHARS + 1024) return null;
  let msg;
  try { msg = JSON.parse(raw); } catch { return null; }
  if (!msg || typeof msg !== 'object' || Array.isArray(msg) || typeof msg.t !== 'string') return null;
  return msg;
}

/* A save is accepted only if it is a JSON object in a string, of sane size. A bad value never replaces a good one. */
function validSave(v) {
  if (typeof v !== 'string' || v.length < 2 || v.length > MAX_SAVE_CHARS) return false;
  try { const o = JSON.parse(v); return !!o && typeof o === 'object' && !Array.isArray(o); } catch { return false; }
}

/* The game speaks Vibration-API: a duration in ms, or [buzz, gap, buzz, gap, ...].
   - One short buzz is a tap. Raw 8 to 20 ms motor pulses are weak or silent on many phones, so these become
     tuned impact effects: up to 12 ms light, up to 30 ms medium, longer heavy.
   - A pattern is a rhythm (whistle, goal, denied) and is kept as a rhythm, with each part clamped.
     Android: the motor plays it as written; Android's pattern form starts with a wait, hence the leading 0.
     iOS: an iPhone cannot buzz for a chosen number of milliseconds. React Native's Vibration on iOS ignores the
     durations and plays the long system buzz once per entry, which would turn a 100 ms whistle into over a second
     of rattling. So on iOS a pattern becomes a `sequence`: one Taptic impact per buzz, at the moment that buzz
     would have started, its weight chosen from the buzz length exactly as for a single tap. */
const impactStyle = ms => (ms <= 12 ? 'light' : ms <= 30 ? 'medium' : 'heavy');
function hapticPlan(p, platform) {
  const ok = v => typeof v === 'number' && isFinite(v) && v >= 0;
  if (ok(p)) {
    if (p < 1) return { kind: 'none' };
    return { kind: 'impact', style: impactStyle(p) };
  }
  if (Array.isArray(p) && p.length > 0 && p.every(ok)) {
    const parts = p.slice(0, 12).map(v => Math.min(400, Math.round(v)));
    if (parts.length === 1) return hapticPlan(parts[0], platform);
    if (!parts.some((v, i) => i % 2 === 0 && v > 0)) return { kind: 'none' };
    if (platform === 'ios') {
      const steps = []; let at = 0;
      parts.forEach((v, i) => { if (i % 2 === 0 && v > 0) steps.push({ at, style: impactStyle(v) }); at += v; });
      return { kind: 'sequence', steps };
    }
    return { kind: 'pattern', pattern: [0].concat(parts) };
  }
  return { kind: 'none' };
}

/* Only https pages on the studio's own site and the two stores may be opened from the game. Add hosts here when
   needed. */
const EXTERNAL_HOSTS = ['onemanteam.app', 'www.onemanteam.app', 'ollywoodgames.github.io', 'play.google.com', 'apps.apple.com'];
// Hosts shared with other sites: only the studio's own path on them may be opened.
const EXTERNAL_PATHS = { 'aaliyaanwaja.github.io': '/ollywoodgames.github.io/' };
function externalUrl(url) {
  if (typeof url !== 'string' || url.length > 2048) return null;
  // parsed by hand: React Native's URL class is not a full implementation
  const m = /^https:\/\/([a-z0-9.-]+)(\/[^\s"'<>\\]*)?$/i.exec(url);
  if (!m) return null;
  const host = m[1].toLowerCase(), path = m[2] || '/';
  if (EXTERNAL_HOSTS.indexOf(host) >= 0) return url;
  if (EXTERNAL_PATHS[host] && path.indexOf(EXTERNAL_PATHS[host]) === 0) return url;
  return null;
}

/* The text the game asks to share (a result and a link to the same move on the website). Plain text only, of a
   sane length; control characters other than line breaks are dropped. Anything else is refused. */
function shareText(text) {
  if (typeof text !== 'string') return null;
  const t = text.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim();
  return t && t.length <= 600 ? t : null;
}

const isOwnUrl = url => typeof url === 'string' && (url === 'about:blank' || url.indexOf(BASE_URL) === 0);

module.exports = {
  BASE_URL, MAX_SAVE_CHARS, bootstrapScript, withBootstrap, setActiveScript, insetsScript, receiveScript, backScript,
  parseMessage, validSave, hapticPlan, externalUrl, shareText, isOwnUrl, scriptJson, SHELL_CSS,
};
