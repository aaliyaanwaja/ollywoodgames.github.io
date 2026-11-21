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

/* Runs in the page before any of the game's own scripts. It is delivered twice (spliced into the HTML and through
   injectedJavaScriptBeforeContentLoaded) and is written so that the second arrival does nothing. */
function bootstrapScript(opts) {
  const native = { save: typeof opts.save === 'string' ? opts.save : null, version: String(opts.version), platform: 'android' };
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
      'if(on){paused.forEach(function(c){try{c.resume().catch(function(){});}catch(e){}});paused=[];}' +
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
   - A pattern is a rhythm (whistle, goal, denied) and is kept as a rhythm, with each part clamped. Android's
     pattern form starts with a wait, hence the leading 0. */
function hapticPlan(p) {
  const ok = v => typeof v === 'number' && isFinite(v) && v >= 0;
  if (ok(p)) {
    if (p < 1) return { kind: 'none' };
    return { kind: 'impact', style: p <= 12 ? 'light' : p <= 30 ? 'medium' : 'heavy' };
  }
  if (Array.isArray(p) && p.length > 0 && p.every(ok)) {
    const parts = p.slice(0, 12).map(v => Math.min(400, Math.round(v)));
    if (parts.length === 1) return hapticPlan(parts[0]);
    if (!parts.some((v, i) => i % 2 === 0 && v > 0)) return { kind: 'none' };
    return { kind: 'pattern', pattern: [0].concat(parts) };
  }
  return { kind: 'none' };
}

/* Only https pages on the studio's own site may be opened from the game. Add hosts here when needed. */
const EXTERNAL_HOSTS = ['ollywoodgames.github.io', 'play.google.com'];
function externalUrl(url) {
  if (typeof url !== 'string' || url.length > 2048) return null;
  // parsed by hand: React Native's URL class is not a full implementation
  const m = /^https:\/\/([a-z0-9.-]+)(\/[^\s"'<>\\]*)?$/i.exec(url);
  if (!m || EXTERNAL_HOSTS.indexOf(m[1].toLowerCase()) < 0) return null;
  return url;
}

const isOwnUrl = url => typeof url === 'string' && (url === 'about:blank' || url.indexOf(BASE_URL) === 0);

module.exports = {
  BASE_URL, MAX_SAVE_CHARS, bootstrapScript, withBootstrap, setActiveScript, insetsScript, receiveScript, backScript,
  parseMessage, validSave, hapticPlan, externalUrl, isOwnUrl, scriptJson,
};
