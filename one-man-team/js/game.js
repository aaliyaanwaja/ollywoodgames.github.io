/* Screens, input and match flow. The rules live in sim.js; everything on the pitch canvas is drawn by render.js. */
(function () {
  /* ---------- identity: rename the game here and in <title> of index.html ---------- */
  const GAME_NAME = 'One-Man Team';
  const STUDIO = 'Ollywood Games', BUILD = '0.5.0';

  const { TICK, P, C, LEVELS } = FB;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const phoneReduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let save = null;   // declared here so reduced() can read the in-game setting (filled in below)
  const reduced = () => (save && save.motion === 'on') || phoneReduced();

  /* ---------- icons: one 2px ink line, drawn here, no icon font ---------- */
  const svg = (d, extra) => '<svg class="ic' + (extra ? ' ' + extra : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + d + '</svg>';
  const IC = {
    pause: svg('<path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="3"/>'),
    retry: svg('<path d="M19 12a7 7 0 1 1-2.2-5.1"/><path d="M19.5 3.8v4.4h-4.4"/>'),
    prev: svg('<path d="M6.5 5.5v13"/><path d="M18.5 6l-8 6 8 6z"/>'),
    gear: svg('<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2.8v3.2M12 18v3.2M2.8 12H6M18 12h3.2M5.5 5.5l2.3 2.3M16.2 16.2l2.3 2.3M5.5 18.5l2.3-2.3M16.2 7.8l2.3-2.3"/>'),
    lock: svg('<rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5"/><path d="M8.5 10.5V7.6a3.5 3.5 0 0 1 7 0v2.9"/>'),
    next: svg('<path d="M4.5 12h14M13 6l6 6-6 6"/>'),
    back: svg('<path d="M19.5 12h-14M11 6l-6 6 6 6"/>'),
    list: svg('<path d="M9 6.5h11M9 12h11M9 17.5h11"/><path d="M4.5 6.5h.5M4.5 12h.5M4.5 17.5h.5" stroke-width="3"/>'),
    sound: svg('<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 6.6a7.6 7.6 0 0 1 0 10.8"/>'),
    buzz: svg('<rect x="8.5" y="4" width="7" height="16" rx="1.5"/><path d="M4.8 9v6M19.2 9v6M2 10.5v3M22 10.5v3"/>'),
    book: svg('<path d="M4 5.5h6a2 2 0 0 1 2 2v11.5a2 2 0 0 0-2-2H4zM20 5.5h-6a2 2 0 0 0-2 2v11.5a2 2 0 0 1 2-2h6z"/>'),
    bin: svg('<path d="M4.5 7h15M9.5 7V4.5h5V7M6.8 7l1 12.5h8.4l1-12.5M10.2 10.5v5.5M13.8 10.5v5.5"/>'),
    shield: svg('<path d="M12 3.5l7 2.5v5.5c0 4.2-2.8 7.4-7 9-4.2-1.6-7-4.8-7-9V6z"/>'),
    whistle: svg('<circle cx="9" cy="14.5" r="5"/><path d="M12.6 11H21v3.2h-7"/><path d="M6.5 5l1.2 2.4M11 4v2.6"/>'),
    stick: svg('<circle cx="12" cy="12" r="9.5" stroke-dasharray="3 3"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>'),
    play: svg('<path d="M8.5 6l10 6-10 6z" fill="currentColor"/>'),
    clock: svg('<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V9.5M10 3.5h4M12 3.5v3M18.2 7.3l1.3-1.3"/>'),
    chev: svg('<path d="M9 6l6 6-6 6"/>'),
    tick: svg('<path d="M5.5 12.5l4 4 9-9" stroke-width="3"/>'),
    textsz: svg('<path d="M3.5 19l5-13 5 13M5.3 14.5h6.4M14.5 19l3.2-8.5 3.2 8.5M15.6 16.2h4.2"/>'),
    motion: svg('<path d="M3 12h3.5l2.5-5 4 10 2.5-5H21"/>'),
    share: svg('<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M5 12.5V20h14v-7.5"/>'),
    cal: svg('<rect x="4" y="5.5" width="16" height="14.5" rx="1.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
    chart: svg('<path d="M4.5 19.5h15M7.5 16v-4M12 16V8M16.5 16v-6"/>'),
    phone: svg('<rect x="7.5" y="3" width="9" height="18" rx="2"/><path d="M11 18h2"/>'),
    star: '<svg class="st" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.8l2.85 5.9 6.45.9-4.7 4.5 1.15 6.4L12 17.45 6.25 20.5l1.15-6.4-4.7-4.5 6.45-.9z"/></svg>'
  };
  const stars = (n, cls) => '<span class="stars' + (cls ? ' ' + cls : '') + '" role="img" aria-label="' + n + ' of 3 stars">' +
    [0, 1, 2].map(i => '<i class="' + (i < n ? 'on' : 'off') + '" style="--i:' + i + '">' + IC.star + '</i>').join('') + '</span>';

  /* ---------- saved progress ---------- */
  const KEY = (window.OMT_CONFIG && window.OMT_CONFIG.key) || 'omt.v1';
  save = { done: {}, sound: true, haptics: true, seenHow: false, all: false, cover: false, seenDecoy: false, text: 'std', motion: 'phone' };
  /* Inside the app shell the native side owns the save (see app/README.md): it injects window.__OMT_NATIVE__ = { save }
     before this script runs and receives every change through postMessage. In a browser, localStorage is used. */
  const NATIVE = window.__OMT_NATIVE__ || null;
  const toNative = msg => { try { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg)); } catch (e) {} };
  try {
    const raw = NATIVE && typeof NATIVE.save === 'string' ? NATIVE.save : localStorage.getItem(KEY);
    const s = JSON.parse(raw); if (s && typeof s === 'object') save = Object.assign(save, s);
    if (!save.done || typeof save.done !== 'object') save.done = {};
  } catch (e) {}
  /* A plain record of every attempt, kept on this device, for playtests: which move, which player, how it ended, when in
     the move. No identifiers. Shown and copied from Options in tester mode. */
  function logPlay(outcome) {
    try {
      if (!save.log) save.log = [];
      save.log.push([prac >= 0 ? 'P' + (prac + 1) : dly ? 'D' + dly.n : li + 1, round + 1, outcome, sim ? +(sim.tick / 60).toFixed(1) : 0]);
      stat.outcome(outcome);
      if (save.log.length > 1500) save.log.splice(0, save.log.length - 1500);
      if (outcome === 'goal' || save.log.length % 10 === 0) persist();
    } catch (e) {}
  }
  function logText() {
    const by = {}; (save.log || []).forEach(e => { const k = e[0]; (by[k] = by[k] || { n: 0, goal: 0, why: {}, rounds: {} }); const b = by[k]; b.n++; if (e[2] === 'goal') b.goal++; else { b.why[e[2]] = (b.why[e[2]] || 0) + 1; b.rounds[e[1]] = (b.rounds[e[1]] || 0) + 1; } });
    const rows = Object.keys(by).map(k => { const b = by[k]; return 'Move ' + k + ': ' + b.n + ' attempts, ' + b.goal + ' scored. Fails by player: ' + (Object.keys(b.rounds).map(r => 'P' + r + ' x' + b.rounds[r]).join(', ') || 'none') + '. Reasons: ' + (Object.keys(b.why).map(w => w + ' x' + b.why[w]).join(', ') || 'none'); });
    return rows.join('\n') || 'Nothing played yet.';
  }
  const persist = () => { const v = JSON.stringify(save); try { localStorage.setItem(KEY, v); } catch (e) {} toNative({ t: 'save', v }); };
  const lid = i => LEVELS[i].id || LEVELS[i].name;
  /* Campaign v2 (docs/foundation/21-campaign-v2.md): progress is keyed by each level's permanent id, never its name. A
     save from before (keyed by name) is moved over once: a level that carried over keeps its record under its new id
     (`oldName` on the level; stars regraded below from the stored time), the rest is dropped, and save.reach keeps the
     fixtures the player had already reached open. */
  if (!save.ids && LEVELS.every(lv => lv.id)) {
    const old = save.done, n = Object.keys(old).length; save.done = {}; save.ids = 1;
    LEVELS.forEach((lv, i) => { const r = lv.oldName && old[lv.oldName]; if (r) save.done[lid(i)] = r; });
    if (n) { save.reach = Math.min(LEVELS.length - 1, n); persist(); }
  }
  const rec = i => LEVELS[i] ? save.done[lid(i)] : undefined;
  /* "Move on" (retention plan, proposal 2): after 16 failures a player may leave one fixture per season behind. It keeps
     an open ticket and no stars; save.owed maps its id to the number of fixtures won when it was left, so the home
     button sends the player back to it after their next win. */
  const owed = i => LEVELS[i] && save.owed && Object.prototype.hasOwnProperty.call(save.owed, lid(i));
  const wins = () => LEVELS.reduce((a, _, i) => a + (rec(i) ? 1 : 0), 0);
  const unlocked = i => save.all || CFG.unlock || i === 0 || !!rec(i - 1) || owed(i - 1) || i <= (save.reach || 0);
  const nextLevel = () => {
    for (let i = 0; i < LEVELS.length; i++) if (!rec(i) && !(owed(i) && wins() <= save.owed[lid(i)])) return i;
    for (let i = 0; i < LEVELS.length; i++) if (!rec(i)) return i;
    return -1;
  };
  /* Stars grade the finished move, never the number of takes: one for scoring, a second for beating par (the bot's time
     x 1.5), a third for the gaffer's time (x 1.2). The bot times live in js/levels/pars.js. */
  const parOf = (i, k) => { const b = LEVELS[i] && LEVELS[i].bot; return b ? Math.ceil(b * k * 10) / 10 : 0; };
  const starsFor = (i, t) => { const g = parOf(i, 1.2), p = parOf(i, 1.5); return !p ? 1 : t <= g ? 3 : t <= p ? 2 : 1; };
  // saves from before this rule were graded on retries: regrade them from the stored times
  LEVELS.forEach((_, i) => { const r = save.done[lid(i)]; if (r && r.time) r.stars = Math.min(starsFor(i, r.time), r.slow ? 2 : 3); });
  const totalStars = () => LEVELS.reduce((a, _, i) => a + (rec(i) ? rec(i).stars : 0), 0);
  SFX.set(save.sound, save.haptics);
  /* Text size (Standard / Large) and Reduce motion (follow the phone / On). CSS reads two classes on <html>; the canvas
     reads the same two settings through Render.prefs. */
  function applyPrefs() {
    const h = document.documentElement;
    h.classList.toggle('lg', save.text === 'lg'); h.classList.toggle('rm', save.motion === 'on');
    if (Render.prefs) Render.prefs({ text: save.text === 'lg' ? 1.15 : 1, reduced: save.motion === 'on' });
  }

  /* ---------- optional level metadata (season, story, kit), with fallbacks ---------- */
  // PLACEHOLDER season names, used only while no level carries its own `season`. Replace by writing
  // `season: '...'` on the levels themselves, then delete these two lines.
  const PLACEHOLDER_SEASONS = ['Sunday League', 'County League', 'The Cup Run'];
  const placeholderSeason = i => PLACEHOLDER_SEASONS[Math.min(PLACEHOLDER_SEASONS.length - 1, Math.floor(i / 4))];
  function seasonOf(i) {
    if (!LEVELS.some(l => l.season)) return placeholderSeason(i);
    for (let k = i; k >= 0; k--) if (LEVELS[k].season) return String(LEVELS[k].season);
    return 'Pre-season';
  }
  function chapters() {
    const out = [];
    LEVELS.forEach((_, i) => { const s = seasonOf(i), c = out[out.length - 1]; if (c && c.name === s) c.to = i; else out.push({ name: s, from: i, to: i, n: out.length + 1 }); });
    return out;
  }
  const chapterOf = i => chapters().find(c => i >= c.from && i <= c.to);
  const story = lv => (lv.story && typeof lv.story === 'object') ? lv.story : null;
  const col = (v, d) => /^#[0-9a-f]{3,8}$/i.test(v || '') ? v : d;
  function kit(lv) {
    const k = lv.kit || {}, u = k.us || [], t = k.them || [];
    return { us: [col(u[0], '#E4572E'), col(u[1], '#F2EAD8')], them: [col(t[0], '#14213D'), col(t[1], '#8EC5D6')] };
  }
  function lumOf(hex) {
    let h = String(hex).slice(1); if (h.length < 6) h = h.split('').map(c => c + c).join('');
    const ch = n => { const v = parseInt(h.substr(n, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
  }
  const inkOn = hex => lumOf(hex) > 0.2 ? '#14213D' : '#FBF8F0';   // ink or chalk, whichever reads on this kit colour
  /* Near-white with near-black reads as the ball: draw the base dark and the banded rim in silver, six wide bands. */
  function kitGuard(pair) {
    const L0 = lumOf(pair[0]), L1 = lumOf(pair[1]);
    if ((L0 > 0.8 && L1 < 0.03) || (L1 > 0.8 && L0 < 0.03)) return [L0 < L1 ? pair[0] : pair[1], '#B8BEC6', true];
    return [pair[0], pair[1], false];
  }
  const base = (num, pair, cls) => '<span class="base' + (cls ? ' ' + cls : '') + '" style="--k1:' + pair[0] + ';--k2:' + pair[1] + ';--kt:' + inkOn(pair[0]) + '">' + esc(num) + '</span>';
  const no = i => (i < 9 ? '0' : '') + (i + 1);
  function parseScore(s) { const m = /^\s*(\d+)\D+(\d+)\s*$/.exec(s == null ? '' : String(s)); return m ? [+m[1], +m[2]] : null; }
  const fmtScore = sc => sc[0] + '–' + sc[1];
  function scoreHtml(lv, scored) {
    const st = story(lv); if (!st) return '';
    const sc = parseScore(st.score), min = st.minute != null && st.minute !== '' ? esc(st.minute) + '′' : '';
    if (!sc && !min) return '';
    return (min ? '<span class="min">' + min + '</span>' : '') + (sc ? '<span class="sc">' + fmtScore(scored ? [sc[0] + 1, sc[1]] : sc) + '</span>' : '');
  }
  const shortTip = a => String(a.short || a.tip || '');   // fitTip() trims it to whole sentences that fit two lines; the full text is on the team sheet and the pause card
  /* The title as the Ghost trail wordmark (js/brand.js, outlined lettering), cover stacked, masthead on one line. A renamed
     game (GAME_NAME no longer matching the drawn wordmark) falls back to live text until brand.js is regenerated. */
  const BRAND = window.OMT_BRAND && window.OMT_BRAND.name === GAME_NAME ? window.OMT_BRAND : null;
  const titleHtml = () => BRAND ? BRAND.stack : GAME_NAME.split(' ').map(w => '<span class="w">' + esc(w) + '</span>').join(' ');
  const mastHtml = () => BRAND ? BRAND.line : esc(GAME_NAME);
  const ord = n => ['1st', '2nd', '3rd'][n] || (n + 1) + 'th';

  /* ---------- game feel: one beat per moment ----------
     Every moment's hold (ms), sound and haptic in one place, so feel can be tuned in one pass on a phone. A hold freezes
     the picture AND the simulation: no ticks are stepped while it lasts and no time is owed afterwards, so a hold never
     changes a result, a recording or a move time (tools/bot-ticks.js proves it). Reduce motion drops the holds; the
     sounds and haptics stay. Sounds live in audio.js (recorded where a licence-clear file exists, synthesised otherwise). */
  const CUE = {
    pass:    { hold: 30, sound: 'kick',    buzz: '10-24 by power' },
    receive: { hold: 0,  sound: 'touch',   buzz: 14, ring: 90 },
    shot:    { hold: 50, sound: 'strike',  buzz: '30-40 by power' },
    save:    { hold: 60, sound: 'glove',   buzz: 35 },
    tackle:  { hold: 80, sound: 'thud',    buzz: 50 },
    offside: { hold: 300, sound: 'whistle x2', buzz: '2 x 30' },
    goal:    { hold: 0,  sound: 'net, crowd, brass sting', buzz: 'pattern' }
  };
  const FAIL_CUE = { tackled: CUE.tackle, intercepted: CUE.tackle, bump: CUE.tackle, saved: CUE.save, keeper: CUE.save, smothered: CUE.save, gathered: CUE.save, offside: CUE.offside };

  /* ---------- state ---------- */
  let li = 0, round = 0, recs = [], sim = null, rsim = null, rhold = 0;
  let state = 'home', fails = 0, goalAt = 0, seq = 0;
  const inp = { mx: 0, my: 0, charging: false, release: false, done: false, aim: false, ax: 0, ay: -1, power: 0 };
  let joy = null, aimP = null; const keys = {};
  let autoFactory = null, auto = null; // test hook: scripted inputs
  let lastKick = -999, lastRecv = -999, tempo = 1, coachKey = null, secsTxt = '', swell = false, holdUntil = 0, failShowAt = 0, failGuard = 0, pracNote = null, rcardOn = false;

  function resize() { Render.resize($('stage')); }
  window.addEventListener('resize', resize);

  /* Special builds set window.OMT_CONFIG before this script: { rate, assist, practice, slow, unlock, key, title }.
     A rating set asks three questions after every fixture and keeps the answers on the device for copying out. */
  const CFG = window.OMT_CONFIG || {};
  const PRACTICE = CFG.practice === false ? [] : window.OMT_PRACTICE || [];
  let prac = -1, pracLv = null, pracRep = 0;   // practice drill being played, or -1
  let dly = null;      // the Daily Move being played: { n, date, lv, bot }, or null
  let bonus = 0;       // extra seconds on the clock for this attempt series (help when stuck)
  const L = () => prac >= 0 ? pracLv : dly ? dly.lv : LEVELS[li];
  const liveIdx = () => L().order[round];
  function mkSim(live) { const S = FB.makeSim(L(), recs, live); if (bonus && prac < 0) S.limit += Math.round(bonus * 60); return S; }
  function screen(id) {
    seq++;
    $('home').classList.toggle('on', id === 'home'); $('play').classList.toggle('on', id === 'play');
    if (id !== 'home') SFX.ambience(false);
    if (id === 'play') resize(); else SFX.crowd(0, 0.2);
  }
  const later = (fn, ms) => { const s = seq; setTimeout(() => { if (s === seq) fn(); }, ms); };

  /* ---------- overlays: 'page' (a full programme page), 'dlg' (a small card), 'sheet' (bottom, pitch stays visible) ---------- */
  function showOv(kind, html, handlers) {
    const card = $('card');
    card.innerHTML = html; card.scrollTop = 0; card.removeAttribute('style'); $('dragchip').className = '';
    $('ov').className = 'ov on k-' + kind; delete $('ov').dataset.pause;
    const pg = card.querySelector('.pg'); if (pg) pg.scrollTop = 0;
    Object.keys(handlers || {}).forEach(id => { const el = $(id); if (el) el.onclick = () => { SFX.tap(); handlers[id](); }; });
    try { card.focus({ preventScroll: true }); } catch (e) {}
  }
  function hideOv() { $('ov').className = 'ov'; $('card').innerHTML = ''; $('card').removeAttribute('style'); $('dragchip').className = ''; delete $('ov').dataset.pause; }
  const ovOpen = () => $('ov').classList.contains('on');

  /* ---------- first launch: the programme cover ---------- */
  const COVER_ART =
    '<div class="cover-art"><svg viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
    '<rect width="320" height="320" fill="#2F7D4F"/><g fill="#2A7046"><rect y="40" width="320" height="40"/><rect y="120" width="320" height="40"/><rect y="200" width="320" height="40"/><rect y="280" width="320" height="40"/></g>' +
    '<g fill="none" stroke="#FBF8F0" stroke-width="2.5" opacity=".9"><path d="M60-10v100h200V-10"/><path d="M116-10v40h88v-40"/><path d="M118 90a44 44 0 0 0 84 0"/></g>' +
    '<g fill="none" stroke="#FBF8F0" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9"><path d="M52 300c4-28 16-52 36-72"/><path d="M240 138c-4-26-26-46-54-62"/></g>' +
    '<path d="M118 200l104-44" fill="none" stroke="#F2B705" stroke-width="3" stroke-linecap="round" stroke-dasharray="9 7"/>' +
    '<g stroke="#14213D" stroke-width="2.5"><circle cx="160" cy="34" r="11" fill="#F2B705"/><circle cx="118" cy="112" r="12" fill="#14213D" stroke="#8EC5D6"/><circle cx="204" cy="122" r="12" fill="#14213D" stroke="#8EC5D6"/>' +
    '<circle cx="96" cy="214" r="13" fill="#E4572E"/><circle cx="240" cy="150" r="13" fill="#E4572E" stroke-dasharray="5 4"/><circle cx="114" cy="200" r="5.5" fill="#FBF8F0"/></g>' +
    '<circle cx="96" cy="214" r="19" fill="none" stroke="#F2B705" stroke-width="3"/>' +
    '<g font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="700" font-size="15" text-anchor="middle" fill="#14213D"><text x="96" y="219.3">8</text><text x="240" y="155.3">9</text></g></svg></div>';
  function showCover() {
    state = 'home'; hideOv(); sim = null; rsim = null;
    $('home').className = 'screen cover';
    $('home').innerHTML =
      '<div class="cv-in"><div class="strip"><span>Official matchday programme</span><span>Price: nothing</span></div>' +
      '<h1 class="title big">' + titleHtml() + '</h1>' +
      '<p class="strap">You are the whole team.<br>One player at a time.</p>' + COVER_ART +
      '<p class="cv-note">Play the pass. Then go back and be the one who runs onto it.</p></div>' +
      '<div class="dock"><button class="cta" id="cta"><b>Kick off</b><small>The coach talks you through move one</small></button>' +
      '<p class="by">A game by ' + esc(STUDIO) + '</p></div>';
    $('cta').onclick = () => { SFX.tap(); SFX.whistle(); save.cover = true; persist(); if (save.practised || !PRACTICE.length) startLevel(0); else startPractice(0); };
    screen('home');
  }

  /* ---------- home: one season at a time ---------- */
  let taps = 0, noteT = 0;
  const unfolded = {};
  function homeNote(t) { const el = $('note'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(noteT); noteT = setTimeout(() => el.classList.remove('on'), 2200); }
  const seasonWord = ch => String(LEVELS[ch.from].seasonWord || 'Complete');
  function situation(lv) {
    const st = story(lv); if (!st) return '';
    const sc = parseScore(st.score);
    return [st.match, st.minute != null && st.minute !== '' ? st.minute + '′' : '', sc ? fmtScore(sc) : ''].filter(Boolean).map(esc).join(' · ');
  }
  function heroHtml(i) {
    const lv = LEVELS[i], st = story(lv);
    return '<button class="hero" data-l="' + i + '" aria-label="' + esc('Next fixture, No. ' + (i + 1) + ', ' + lv.name) + '"><span class="flag">Next fixture</span>' +
      '<span class="tk-stub"><small>No.</small><b>' + no(i) + '</b></span><span class="tk-body"><small>' + situation(lv) + '</small><b>' + esc(lv.name) + '</b>' +
      (st && st.opp ? '<em>v ' + esc(st.opp) + '</em>' : '') + '</span></button>';
  }
  function stubHtml(i) {
    const lv = LEVELS[i], r = rec(i), open = unlocked(i);
    const end = r ? stars(r.stars) : !open ? IC.lock : owed(i) ? '<i class="owed">Left open</i>' : '';
    return '<button class="stub' + (open || r ? '' : ' lock') + (r ? ' done' : '') + '" data-l="' + i + '" aria-label="' + esc('Fixture ' + (i + 1) + ', ' + lv.name + (open ? (r ? ', ' + r.stars + ' of 3 stars' : ', not won yet') : ', locked')) + '">' +
      '<b>' + no(i) + '</b><span>' + esc(lv.name) + '</span>' + end + '</button>';
  }
  function seasonHtml(ch, nx) {
    const n = ch.to - ch.from + 1; let won = 0, got = 0;
    for (let i = ch.from; i <= ch.to; i++) if (rec(i)) { won++; got += rec(i).stars; }
    const st = story(LEVELS[ch.from]), comp = st && st.comp ? st.comp : '';
    const done = won === n;
    if (done && !unfolded[ch.n]) {   // a finished season folds into one card with its stamp
      return '<button class="sfold" data-s="' + ch.n + '" aria-expanded="false"><span class="lbl soft">Season ' + ch.n + ' · ' + n + ' fixtures · ' + got + '/' + n * 3 + ' stars</span>' +
        '<b>' + esc(ch.name) + '</b><i class="sstamp">' + esc(seasonWord(ch)) + '</i></button>';
    }
    let h = '<section class="sea"><div class="sea-h"' + (done ? ' data-s="' + ch.n + '" role="button" tabindex="0" aria-expanded="true"' : '') + '><span class="lbl soft">Season ' + ch.n + (comp ? ' · ' + esc(comp) : '') + '</span>' +
      '<h2>' + esc(ch.name) + '</h2><span class="won">' + (done ? got + '/' + n * 3 + ' stars' : won + ' of ' + n + ' won') + '</span></div>' +
      '<div class="prog" aria-hidden="true">' + Array.from({ length: n }, (_, k) => '<i class="' + (rec(ch.from + k) ? 'on' : '') + '"></i>').join('') + '</div>';
    let rest = '';
    for (let i = ch.from; i <= ch.to; i++) { if (i === nx) h += heroHtml(i); else rest += stubHtml(i); }
    return h + '<div class="stubs">' + rest + '</div></section>';
  }
  function showHome() {
    if (!save.cover && !save.all && !CFG.unlock && nextLevel() === 0) return showCover();
    state = 'home'; hideOv(); sim = null; rsim = null; prac = -1; dly = null; stat.screen('home');
    const nx = nextLevel(), total = totalStars(), won = LEVELS.filter((_, i) => rec(i)).length;
    let chase = -1; if (nx < 0) chase = LEVELS.findIndex((_, i) => rec(i).stars < 3);
    const target = nx >= 0 ? nx : chase >= 0 ? chase : 0;
    const cta = nx < 0
      ? (chase >= 0 ? '<b>Chase the stars</b><small>No. ' + no(chase) + ' · ' + esc(LEVELS[chase].name) + '</small>' : '<b>Play it again</b><small>Every star collected</small>')
      : '<b>' + (won ? 'Next fixture' : 'Kick off') + '</b><small>No. ' + no(nx) + ' · ' + esc(LEVELS[nx].name) + '</small>';
    let body = '', shut = 0, firstShut = null;
    chapters().forEach(ch => {
      if (unlocked(ch.from) || rec(ch.from)) body += seasonHtml(ch, nx);
      else if (!firstShut) firstShut = ch; else shut++;
    });
    if (firstShut) body += '<div class="sshut"><span class="lbl soft">Season ' + firstShut.n + ' · finish season ' + (firstShut.n - 1) + ' to open</span><b>' + esc(firstShut.name) + '</b>' + IC.lock + '</div>';
    if (shut) body += '<p class="more">' + (shut === 1 ? 'One more season' : (['', '', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'][shut] || shut) + ' more seasons') + ' in the programme</p>';
    const club = (LEVELS[0].story && LEVELS[0].story.us) || STUDIO;
    $('home').className = 'screen';
    $('home').innerHTML =
      '<div class="scroll" id="scroll"><header class="mast"><div class="strip"><span>Official matchday programme</span><span>' + esc(club) + '</span></div>' +
      '<div class="mast-main"><h1 class="title" id="brand">' + mastHtml() + '</h1><button class="ib" id="bOpt" aria-label="Options">' + IC.gear + '</button></div>' +
      '<div class="tally"><span>' + IC.star + '<b>' + total + '</b> of ' + LEVELS.length * 3 + ' stars</span></div></header>' +
      '<div id="daily"></div><div class="path">' + body + '</div>' +
      (CFG.rate ? '<button class="btn" id="rtb" style="width:100%;margin-top:14px">Your ratings: copy and send</button>' : '') +
      '<p class="foot">' + (nx < 0 ? 'Every fixture won. The stars are still there to be had. ' : '') + (save.all ? 'All fixtures unlocked for testing.' : '') + '</p></div>' +
      '<div class="dock"><div id="note" role="status"></div><button class="cta" id="cta">' + cta + IC.next + '</button></div>';
    $('cta').onclick = () => { SFX.tap(); startLevel(target); };
    document.querySelectorAll('#home [data-l]').forEach(b => b.onclick = () => {
      const i = +b.dataset.l;
      if (unlocked(i)) { SFX.tap(); startLevel(i); return; }
      SFX.deny(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      let need = i - 1; while (need > 0 && !unlocked(need)) need--;
      homeNote('Locked. Win No. ' + no(need) + ', ' + LEVELS[need].name + ', first.');
    });
    document.querySelectorAll('#home [data-s]').forEach(b => b.onclick = () => { SFX.tap(); const n = +b.dataset.s; unfolded[n] = !unfolded[n]; const y = $('scroll').scrollTop; showHome(); $('scroll').scrollTop = y; });
    $('bOpt').onclick = () => { SFX.tap(); showOptions(); };
    $('brand').onclick = () => { if (++taps >= 7) { taps = 0; save.all = !save.all; persist(); showHome(); homeNote(save.all ? 'All fixtures unlocked for testing.' : 'Fixtures locked again.'); } };
    if (typeof dailyTicket === 'function') dailyTicket();
    screen('home');
    SFX.ambience(true);
    const tgt = document.querySelector('#home .hero') || (chase >= 0 && document.querySelector('#home [data-l="' + chase + '"]'));
    const sc = $('scroll');
    if (tgt && tgt.offsetTop + tgt.offsetHeight + 40 > sc.clientHeight) sc.scrollTop = Math.max(0, tgt.offsetTop + tgt.offsetHeight + 56 - sc.clientHeight);
  }

  /* ---------- options, how to play, reset ---------- */
  const HOW_STEPS = [
    ['One player at a time', 'Each round you are a single player. Everyone you have already played runs their part again around you, exactly as you played it.'],
    ['Left thumb runs', 'Drag anywhere to run. The move clock starts the moment you do.'],
    ['Right thumb kicks', 'Press the button and drag to aim. Drag further to hit it harder. Let go to kick.'],
    ['Pass, then be the receiver', 'Play it into space, then become the team-mate who runs onto it. Only the next name on the team sheet can collect the ball.'],
    ['Some runs are decoys', 'A decoy never touches the ball. Drag your marker out of the way, then press DONE.'],
    ['If it breaks down', 'Lose the ball, stray offside, bump into an earlier you or run out of clock, and you replay that player. Take as many goes as you like: stars are for how quick the finished move is, not how many tries it took.']
  ];
  function showHow(back) {
    showOv('page', '<div class="pg"><div class="strip"><span>Laws of the game</span><span>Build ' + BUILD + '</span></div><h1>How to play</h1><ol class="how">' +
      HOW_STEPS.map((s, i) => '<li><span class="num">' + (i + 1) + '</span><div><b>' + s[0] + '</b><p>' + s[1] + '</p></div></li>').join('') +
      '</ol><p class="fine">With a keyboard: arrows or WASD to run, hold Space to charge a kick in the direction you face, R to retry, Esc to pause.</p></div>' +
      '<div class="pg-foot"><button class="btn p" id="x">Understood</button></div>', { x: back || hideOv });
  }
  const toggle = (id, icon, label, on, note) => '<button class="rowbtn" id="' + id + '" role="switch" aria-checked="' + (on ? 'true' : 'false') + '">' + icon + '<span>' + label + (note ? '<small>' + note + '</small>' : '') + '</span><i class="sw"><b>' + (on ? 'On' : 'Off') + '</b></i></button>';
  /* a two-way choice in a row: [Standard | Large] */
  const seg = (id, icon, label, opts, cur) => '<div class="rowbtn segrow" role="radiogroup" aria-label="' + label + '">' + icon + '<span>' + label + '</span><span class="seg">' +
    opts.map(o => '<button id="' + id + '-' + o[0] + '" role="radio" aria-checked="' + (o[0] === cur) + '">' + o[1] + '</button>').join('') + '</span></div>';
  const link = (id, icon, label, href, cls) => (href ? '<a class="rowbtn' + (cls ? ' ' + cls : '') + '" id="' + id + '" href="' + href + '">' : '<button class="rowbtn' + (cls ? ' ' + cls : '') + '" id="' + id + '">') + icon + '<span>' + label + '</span>' + IC.next + (href ? '</a>' : '</button>');
  function flipSound() { save.sound = !save.sound; persist(); SFX.set(save.sound, save.haptics); SFX.tap(); }
  function flipBuzz() { save.haptics = !save.haptics; persist(); SFX.set(save.sound, save.haptics); if (save.haptics) SFX.buzz(20); }
  function showLog() {
    const txt = logText();
    showOv('page', '<div class="pg"><div class="strip"><span>Tester</span><span>' + (save.log || []).length + ' attempts</span></div><h1>Play log</h1>' +
      '<p class="fine">Kept on this device only. Nothing is sent anywhere unless you copy it.</p><pre class="log" id="logtxt">' + esc(txt) + '</pre></div>' +
      '<div class="pg-foot"><button class="btn" id="cl">Clear</button><button class="btn" id="cp">Copy</button><button class="btn p" id="x">Done</button></div>',
      { x: showOptions, cl: () => { save.log = []; persist(); showLog(); },
        cp: () => { try { navigator.clipboard.writeText(txt).then(() => toast('Copied'), () => toast('Select the text to copy')); } catch (e) { toast('Select the text to copy'); } } });
  }
  function showOptions() {
    showOv('page', '<div class="pg"><div class="strip"><span>Club office</span><span>Build ' + BUILD + '</span></div><h1>Options</h1>' +
      '<div class="lbl soft gh">Sound and feel</div><div class="list">' + toggle('oS', IC.sound, 'Sound', save.sound) + toggle('oH', IC.buzz, 'Vibration', save.haptics) + '</div>' +
      '<div class="lbl soft gh">Play</div><div class="list">' + toggle('oSlow', IC.clock, 'Slow aim', !!save.slow, 'Time slows while you aim. Best: two stars.') +
        seg('oT', IC.textsz, 'Text size', [['std', 'Standard'], ['lg', 'Large']], save.text === 'lg' ? 'lg' : 'std') +
        seg('oM', IC.motion, 'Reduce motion', [['phone', 'Phone'], ['on', 'On']], save.motion === 'on' ? 'on' : 'phone') + '</div>' +
      '<div class="lbl soft gh">Help</div><div class="list">' + link('oHow', IC.book, 'How to play') + link('oPrac', IC.stick, 'Practice drills') + '</div>' +
      '<div class="lbl soft gh">Your progress</div><div class="list">' + (typeof statsRow === 'function' ? statsRow() : '') +
        link('oPriv', IC.shield, 'Privacy policy', NATIVE ? 'https://aaliyaanwaja.github.io/ollywoodgames.github.io/privacy.html' : '../privacy.html') +
        (save.all ? link('oLog', IC.list, 'Tester: play log') : '') + link('oReset', IC.bin, 'Reset progress', '', 'danger') + '</div>' +
      '<p class="fine">' + (typeof statsNote === 'function' ? statsNote() : 'Progress is kept on this phone only. No account, no adverts, no tracking.') + '</p>' +
      '<p class="fine colophon">' + esc(GAME_NAME) + ' · build ' + BUILD + '<br>Printed and published by ' + esc(STUDIO) + '</p></div>' +
      '<div class="pg-foot"><button class="btn p" id="x">Done</button></div>',
      { x: () => { hideOv(); }, oHow: () => showHow(showOptions), oReset: confirmReset, oPrac: () => startPractice(0), oLog: showLog });
    const keep = () => { const y = document.querySelector('.pg').scrollTop; showOptions(); document.querySelector('.pg').scrollTop = y; };
    $('oSlow').onclick = () => { save.slow = !save.slow; persist(); SFX.tap(); keep(); };
    $('oS').onclick = () => { flipSound(); keep(); };
    $('oH').onclick = () => { flipBuzz(); SFX.tap(); keep(); };
    [['oT-std', 'text', 'std'], ['oT-lg', 'text', 'lg'], ['oM-phone', 'motion', 'phone'], ['oM-on', 'motion', 'on']].forEach(([id, k, v]) => {
      $(id).onclick = () => { save[k] = v; persist(); applyPrefs(); SFX.tap(); keep(); };
    });
    if ($('oStat')) $('oStat').onclick = () => { save.stats = save.stats === false; persist(); SFX.tap(); keep(); };
  }
  function confirmReset() {
    const n = totalStars();
    showOv('dlg', '<div class="lbl">Reset progress</div><h2>Tear it all up?</h2><p>This removes ' + (n ? (n === 1 ? 'your one star' : 'all ' + n + ' of your stars') : 'your progress') + ' and locks every fixture again. It cannot be undone.</p>' +
      '<div class="btns"><button class="btn" id="n">Keep it</button><button class="btn warn" id="y">Reset</button></div>',
      { n: showOptions, y: () => { save.done = {}; save.reach = 0; save.all = false; save.seenDecoy = false; persist(); showHome(); homeNote('Progress reset.'); } });
  }

  /* ---------- level flow ---------- */
  /* Practice drills: the real engine with nothing to lose. A miss restarts the drill at once. */
  function feedRec(lv) {
    const f = lv.feed, a = lv.att[0], dx = f.at[0] - a.x, dy = f.at[1] - a.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
    const r = { x: [], y: [], fx: [], fy: [], kick: null, len: 0 };
    for (let t = 0; t <= f.k + 70; t++) { r.x.push(a.x); r.y.push(a.y); r.fx.push(ux); r.fy.push(uy); }
    r.kick = { tick: f.k, bx: a.x + ux * FB.C.ballOff, by: a.y + uy * FB.C.ballOff, vx: ux * f.sp, vy: uy * f.sp }; r.len = r.x.length;
    return r;
  }
  function startPractice(n, repN) {
    if (!PRACTICE[n]) { save.practised = true; persist(); prac = -1; return startLevel(0); }
    prac = n; pracRep = repN || 0; pracLv = JSON.parse(JSON.stringify(PRACTICE[n])); pracNote = null; dly = null; bonus = 0;
    if (pracLv.reps) { pracLv.att[0].x = pracLv.reps[pracRep][0]; pracLv.att[0].y = pracLv.reps[pracRep][1]; }
    round = pracLv.feed ? 1 : 0; recs = pracLv.att.map(() => null); if (pracLv.feed) recs[0] = feedRec(pracLv);
    fails = 0; rsim = null; sim = FB.makeSim(pracLv, recs, liveIdx());
    stampOff(); $('ready').className = ''; hideOv(); screen('play'); hud();
    beginRound();
  }
  function pracMiss(note) { state = 'failed'; pracNote = note; coachKey = null; const q = seq; later(() => { if (seq === q && prac >= 0) beginRound(); }, 900); }
  function pracDone() {
    if (pracLv.reps && pracRep + 1 < pracLv.reps.length) return startPractice(prac, pracRep + 1);
    if (!pracLv.last) return startPractice(prac + 1);
    // practice complete: straight into the fixture 1 brief, whose button says Kick off
    save.practised = true; persist(); prac = -1; pracNote = null; startLevel(0);
  }
  function startLevel(i) {
    if (!LEVELS[i]) return;
    prac = -1; dly = null; bonus = 0; li = i; stat.level(i + 1); round = 0; recs = L().att.map(() => null); fails = 0; rsim = null; sim = mkSim(liveIdx());
    stampOff(); $('ready').className = ''; screen('play'); hud(); showBrief();
  }
  function beginRound() {
    seq++;
    sim = mkSim(liveIdx()); rsim = null; state = 'ready'; lastKick = -999; lastRecv = -999; tempo = 1; coachKey = null; aimLeft = 1.5; holdUntil = 0;
    $('dragchip').className = ''; $('play').classList.remove('replay'); $('skip').className = 'chip';
    inp.charging = false; inp.release = false; inp.done = false; inp.aim = false; aimP = null; joy = null;
    $('aim').style.display = 'none'; $('joy').style.display = 'none'; $('kick').classList.remove('down');
    hideOv(); stampOff(); hud();
    auto = autoFactory ? autoFactory(prac >= 0 ? 'p' + prac : dly ? 'd' + dly.n : li, round) : null; if (auto) kickoff();
  }
  function kickoff() { if (state === 'ready') { state = 'play'; SFX.unlock(); SFX.crowd(0.016, 0.6); if (sim.tick === 0 && pracNote) pracNote = null; } }
  function freeze() { if (state === 'play') { state = 'ready'; joy = null; $('joy').style.display = 'none'; kickUp(true); SFX.crowd(0, 0.2); } }

  function hud() {
    const lv = L(), a = lv.att[liveIdx()], k = kit(lv), decoy = a.role === 'decoy';
    $('play').classList.remove('replay');
    if (prac >= 0) {
      // drills: named and counted, Skip where rewind and retry sit in a match
      $('who').innerHTML = '<div class="who-in drill"><b>Drill ' + (prac + 1) + ' · ' + esc(pracLv.name) + '</b><span class="pips" aria-label="Drill ' + (prac + 1) + ' of ' + PRACTICE.length + '">' +
        PRACTICE.map((_, i) => '<i class="' + (i < prac ? 'done' : i === prac ? 'on' : '') + '"></i>').join('') + '</span></div>';
    } else {
      // the team sheet: the move in figure bases. Recorded ones ticked, the live one ringed, the ones to come dashed, decoys in sky
      $('who').innerHTML = '<div class="who-in sheet' + (lv.order.length >= 5 ? ' many' : '') + '" role="img" aria-label="' + esc('Player ' + (round + 1) + ' of ' + lv.order.length + ', the ' + a.num + ', ' + a.name) + '">' +
        lv.order.map((ai, n) => {
          const p = lv.att[ai], st = n < round ? 'done' : n === round ? 'live' : 'todo', dec = p.role === 'decoy';
          return (n ? '<i class="ar">' + IC.chev + '</i>' : '') + '<span class="tsb ' + st + (dec ? ' dec' : '') + '">' + base(p.num, dec ? ['#8EC5D6', '#F2EAD8'] : k.us) + (st === 'done' ? '<i class="tck">' + IC.tick + '</i>' : '') + '</span>';
        }).join('') + '</div>';
    }
    $('ctl').classList.toggle('quiet', prac < 0 && !(!dly && li < 2 && !rec(li) && !CFG.rate));
    $('play').classList.toggle('prac', prac >= 0);
    $('bPrev').disabled = round === 0; $('bPrev').classList.toggle('gone', round === 0 || prac >= 0); $('bRetry').disabled = false;
    $('bRetry').classList.toggle('skip', prac >= 0); $('bRetry').innerHTML = prac >= 0 ? '<span>Skip</span>' : IC.retry;
    $('bRetry').setAttribute('aria-label', prac >= 0 ? 'Skip practice' : 'Retry this player');
    const kb = $('kick'); kb.textContent = decoy ? 'DONE' : (sim && sim.isLast ? 'SHOOT' : 'PASS'); kb.classList.toggle('decoy', decoy);
    $('klabel').innerHTML = decoy ? 'Press when<br>your marker<br>has moved' : 'Press<br>drag to aim<br>release';
    const sc = prac >= 0 ? '<span class="pr">Practice</span>' : dly ? '<span class="pr">Daily ' + dly.n + '</span>' : scoreHtml(lv, false); $('score').innerHTML = sc; $('score').className = sc ? 'on' : '';
    $('bar').style.setProperty('--secs', prac >= 0 ? 10 : lv.time + bonus);
    let m = '';
    recs.forEach((r, i) => { if (r && r.kick) m += '<i style="left:' + (100 * r.kick.tick / ((lv.time + bonus) * 60)).toFixed(2) + '%" title="No. ' + lv.att[i].num + ' plays the pass"></i>'; });
    $('marks').innerHTML = prac >= 0 ? '' : m; secsTxt = '';
    // the round-start card: who you are and what to do, once, before the first touch (coach() shows and folds it)
    $('rcard').innerHTML = '<b>You are the ' + esc(a.num) + ' · ' + esc(a.name) + '</b><span>' + esc(a.tip || '') + '</span>';
  }

  function hudReplay() {
    const lv = L(), st = story(lv);
    $('play').classList.add('replay');
    $('who').innerHTML = '<div class="who-in ribbon"><b>Full-time replay</b><small>' + esc(lv.name) + (st && st.minute != null && st.minute !== '' ? ' · ' + esc(st.minute) + '′' : '') + '</small></div>';
    $('bPrev').disabled = true; $('bRetry').disabled = true;
  }
  let toastT = 0;
  function toast(t) { const el = $('toast'); el.textContent = t; el.className = 'on'; clearTimeout(toastT); toastT = setTimeout(() => el.className = '', 1300); }
  function stampOn(t) { const el = $('stamp'); el.innerHTML = '<b>' + t + '</b>'; el.className = ''; void el.offsetWidth; el.className = 'on'; }
  function stampOff() { $('stamp').className = ''; }

  /* The starting positions as a printed diagram: their figures with banded rims, the keeper, ours numbered by order of
     play. Positions only, no runs. Drawn from the level data, so it works for any fixture. */
  function lineupSvg(lv) {
    const k = kit(lv), gk = lv.gk || {}, gx = gk.x == null ? 25 : gk.x, gy = gk.y == null ? 1.2 : gk.y;
    let x0 = 17, x1 = 33, y1 = 18;
    lv.att.concat(lv.def).forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
    x0 = Math.max(-1, x0 - 5); x1 = Math.min(51, x1 + 5); y1 = Math.min(70, y1 + 4);
    if (x1 - x0 < 30) { const c = (x0 + x1) / 2; x0 = c - 15; x1 = c + 15; }
    const y0 = -3, w = x1 - x0, h = y1 - y0, kc = kitGuard(k.them), gkc = col(lv.kit && lv.kit.gk, '#F2B705');
    let g = '<rect x="-80" y="-40" width="210" height="160" fill="#2F7D4F"/>';   // the cloth runs past the frame, whatever its shape
    for (let y = 0; y < y1 + 40; y += 12) g += '<rect x="-80" y="' + (y + 6) + '" width="210" height="6" fill="#2A7046"/>';
    g += '<g fill="none" stroke="#FBF8F0" stroke-width=".3"><path d="M-2 0H52M8 0V16.5H42V0M17 0V5.5H33V0"/><path d="M17.7 16.5A9.15 9.15 0 0 0 32.3 16.5"/><circle cx="25" cy="70" r="9.15"/></g>' +
      '<rect x="21.3" y="-2.3" width="7.4" height="2.3" fill="#FBF8F0" stroke="#14213D" stroke-width=".25"/>' +
      '<circle cx="' + gx + '" cy="' + gy + '" r="1.15" fill="' + gkc + '" stroke="#14213D" stroke-width=".25"/>';
    lv.def.forEach(d => {
      g += '<g transform="translate(' + d.x + ' ' + d.y + ')"><circle r="1.45" fill="' + kc[1] + '" stroke="#14213D" stroke-width=".22"/><circle r="1.15" fill="' + kc[0] + '"/>' +
        '<circle r="1.31" fill="none" stroke="' + kc[0] + '" stroke-width=".24" stroke-dasharray="' + (kc[2] ? '.69 .69' : '.48 .5') + '"/></g>';
    });
    lv.order.forEach((ai, n) => {
      const a = lv.att[ai], dec = a.role === 'decoy', pr = dec ? '#8EC5D6' : k.us[0], ink = inkOn(pr);
      g += '<g transform="translate(' + a.x + ' ' + a.y + ')"><circle r="1.5" fill="' + pr + '" stroke="#14213D" stroke-width=".25"/>' +
        '<circle r="1.2" fill="none" stroke="' + (dec ? '#F2EAD8' : k.us[1]) + '" stroke-width=".3"/>' +
        '<text y=".55" text-anchor="middle" font-size="1.55" font-weight="700" fill="' + ink + '">' + esc(a.num) + '</text>' +
        '<rect x="1" y="-2.6" width="1.6" height="1.6" fill="#14213D"/><text x="1.8" y="-1.33" text-anchor="middle" font-size="1.25" font-weight="700" fill="#F2B705">' + (n + 1) + '</text></g>';
      if (ai === lv.order.find(i => lv.att[i].role === 'ball')) g += '<circle cx="' + a.x + '" cy="' + (a.y - 2) + '" r=".55" fill="#FBF8F0" stroke="#14213D" stroke-width=".18"/>';
    });
    return '<svg class="lineup" viewBox="' + x0 + ' ' + y0 + ' ' + w + ' ' + h + '" role="img" aria-label="Starting positions" font-family="Barlow Condensed, Arial Narrow, sans-serif">' + g + '</svg>';
  }
  function showBrief() {
    if (dly) return showDailyBrief();
    state = 'brief';
    const lv = L(), k = kit(lv), st = story(lv), ch = chapterOf(li), sc = scoreHtml(lv, false);
    const legend = lv.order.map((ai, n) => {
      const a = lv.att[ai], dec = a.role === 'decoy';
      return '<li><i class="ono">' + (n + 1) + '</i>' + base(a.num, dec ? ['#8EC5D6', '#F2EAD8'] : k.us) + '<b>' + esc(dec ? 'Decoy' : a.name) + '</b></li>';
    }).join('');
    const fixture = st && st.opp ? '<div class="fx slim"><b><i>v</i> ' + esc(st.opp) + '</b>' + (sc ? '<span class="board sm">' + sc + '</span>' : '') + '</div>' : '';
    showOv('page',
      '<div class="pg brief lean"><div class="strip"><span>' + esc(st && st.comp ? [st.comp, st.match].filter(Boolean).join(' · ') : ch.name) + '</span><span>No. ' + no(li) + '</span></div>' + fixture +
      '<h1>' + esc(lv.name) + '</h1><p class="lede">' + esc(lv.brief) + '</p>' + (st && st.line ? '<p class="sline">' + esc(st.line) + '</p>' : '') +
      lineupSvg(lv) + '<ol class="legend">' + legend + '</ol></div>' +
      '<div class="pg-foot"><button class="btn sq" id="bk" aria-label="Back to fixtures">' + IC.back + '</button><button class="btn p" id="go">Kick off</button></div>',
      { go: () => { save.seenHow = true; persist(); SFX.whistle(); beginRound(); }, bk: showHome });
  }

  /* what happened, and what to try: the verb as the title, one sentence with the fix in bold */
  const FAIL = {
    tackled: ['Tackled', 'He got there first. <b>Release it earlier</b>, or carry it away from him.', 'thud'],
    intercepted: ['Intercepted', 'The pass ran too close to him. <b>Change the angle</b>, or hit it harder so it is past him sooner.', 'thud'],
    smothered: ['Smothered', 'You carried it into the keeper. <b>Shoot earlier</b>, from further out.', 'glove'],
    saved: ['Saved', 'The keeper got across to it. <b>Aim for the corner he has left</b>, or get closer.', 'glove'],
    keeper: ['Straight to the keeper', 'That pass ran through to him. <b>Take some weight off it</b>, or play it wider.', 'glove'],
    // the same fail code when he came off his line for a slow loose ball in his area (sim.js gkCollect)
    gathered: ['Keeper gathers it', 'It sat up in his area and he came for it. <b>Get there sooner</b>, or weight it so your man arrives first.', 'glove'],
    wide: ['Off target', 'It ran past the post. <b>Aim inside the posts</b>: a shorter drag is easier to place.', 'ooh'],
    out: ['Out of play', 'The ball left the pitch. <b>A shorter drag</b> takes the weight off the pass.', 'whistle'],
    early: ['Wrong man scored', 'Only the last name on the team sheet may finish. <b>Play the pass</b> instead.', 'whistle'],
    offside: ['Offside', 'He was past the last defender when the pass was played. <b>Hold the run</b> until the ball is hit, or play it sooner.', 'whistle2'],
    bump: ['Collision', 'You ran into a team-mate, who is also you. <b>Take a different line</b> from the run you recorded.', 'thud'],
    time: ['Out of time', 'The clock ran out before the move finished. <b>Go sooner</b> and waste fewer steps.', 'whistle']
  };
  /* drills: a miss rewrites the coach card instead of adding a second message */
  const MISS = {
    saved: ['Saved', 'He got to it. Aim <b>further from the keeper</b>, towards a corner, and go again.'],
    smothered: ['Too close', 'He came out and smothered it. <b>Shoot a little earlier</b>.'],
    wide: ['Wide', 'Just past the post. Aim a little <b>inside</b> it and go again.'],
    out: ['Out', 'It ran out of play. A <b>shorter drag</b> takes the weight off.'],
    keeper: ['Too hard', 'It ran through to the keeper. Drag a <b>shorter</b> distance.'],
    gathered: ['Keeper’s ball', 'He came for it. <b>Get there first</b>.'],
    time: ['Again', 'Go again.'], early: ['Again', 'Go again.']
  };
  const failWhy = () => sim.reason === 'keeper' && sim.gk.collecting ? 'gathered' : sim.reason;
  /* The moment it breaks down: sound and haptic now, the picture held for a beat (CUE), then the card. */
  function onFail(now) {
    logPlay(sim.reason);
    const why = failWhy(), f = FAIL[why] || ['Lost it', 'The move broke down. <b>Have another go.</b>', 'thud'];
    if (f[2] === 'whistle2') SFX.whistle(2); else SFX[f[2]]();
    if (why === 'saved' || why === 'keeper' || why === 'gathered') SFX.ooh();
    SFX.crowd(0, 0.15);
    if (prac >= 0) return pracMiss(MISS[why] || ['Again', 'Go again.']);
    fails++; state = 'failhold';
    const c = FAIL_CUE[why]; failShowAt = now + (c && !reduced() ? c.hold : 0);
  }
  let offerKey = '';
  function showFail() {
    state = 'failed';
    const lv = L(), why = failWhy(), f = FAIL[why] || ['Lost it', 'The move broke down. <b>Have another go.</b>', 'thud'], live = liveIdx();
    let line = f[1], redo = null;
    if (why === 'gathered') { /* his own run was too slow to the ball: the card's own words fit */ }
    else if (sim.failWho >= 0 && sim.failWho !== live && recs[sim.failWho] && (why === 'out' || why === 'wide')) {
      const w = lv.att[sim.failWho]; line = 'The ' + esc(w.num) + '\u2019s pass ran out of play. <b>Redo the ' + esc(w.num) + '</b> and play it shorter.'; redo = round > 0 ? lv.att[lv.order[round - 1]] : null;
    } else if (sim.failWho >= 0 && sim.failWho !== live && sim.reason !== 'bump' && recs[sim.failWho]) {
      // the one case where redoing an earlier part is the right advice
      const w = lv.att[sim.failWho];
      line = 'It happened to the ' + esc(w.num) + ', a part you already recorded: your new run moved the defence. <b>Change this run</b>, or redo the ' + esc(w.num) + '.';
      redo = round > 0 ? lv.att[lv.order[round - 1]] : null;
      if (!dly && li < 4 && !rec(li) && !CFG.rate && round === lv.order.length - 1) { line = 'You went early, so the defenders dropped back with you and cut out the pass. <b>Hold your run</b> until the pass is hit.'; redo = null; }
    } else if (sim.reason === 'time' && round > 0) line += ' If the pass cannot be reached in time, redo the previous player with the rewind button.';
    // help when stuck (retention plan, proposal 2): at 8 failures two more seconds on the clock for this attempt series;
    // at 12 slow aim; at 16 "Move on" (free, one fixture per season, no stars). One line at most, the latest that applies.
    const ch = !dly ? chapterOf(li) : null;
    let seasonOwes = false; if (ch) for (let i = ch.from; i <= ch.to; i++) if (owed(i)) seasonOwes = true;
    const canMoveOn = !dly && !CFG.rate && li < LEVELS.length - 1 && !rec(li) && !owed(li) && !seasonOwes;
    const canSlow = CFG.slow !== false && !save.slow;
    const offer = fails >= 16 && canMoveOn ? 'move' : fails >= 12 && canSlow ? 'slow' : fails >= 8 && !bonus ? 'time' : '';
    const oKey = (dly ? 'd' + dly.n : li) + ':' + offer;
    if (offer && offerKey !== oKey) { offerKey = oKey; stat.offer(offer, false); }
    const OFFER = {
      time: ['<b>Two more seconds?</b> The clock gets 2 s longer for this move. Stars still go on your move time.', IC.clock + 'Add 2 seconds', 'ex'],
      slow: ['<b>Finding this one tough?</b> Slow aim slows time for a moment while you aim. Best: two stars. You can switch it off in Options.', IC.clock + 'Turn on slow aim', 'sl'],
      move: ['<b>Move on?</b> Play the next fixture. This one stays open, and the home button brings you back to it after your next win.', 'Move on' + IC.next, 'mo']
    }[offer];
    showOv('fail', '<div class="fc-top"><h2>' + f[0] + '</h2><span class="lbl soft">Take ' + fails + ' · ' + (sim.tick / 60).toFixed(1) + 's' + (bonus ? ' · +' + bonus + 's' : '') + '</span></div>' +
      '<p>' + line + '</p>' +
      (OFFER ? '<div class="offer"><p>' + OFFER[0] + '</p><button class="btn sky" id="' + OFFER[2] + '">' + OFFER[1] + '</button></div>' : '') +
      '<div class="btns">' + (CFG.rate && fails >= 3 ? '<button class="btn" id="gu">Give up and rate</button>' : '') + (redo ? '<button class="btn" id="pv">Redo the ' + esc(redo.num) + '</button>' : '') + '<button class="btn p" id="re">Try again</button></div>',
      { re: beginRound, pv: redoPrev, gu: () => showRate(true, () => { if (li + 1 < LEVELS.length) startLevel(li + 1); else showHome(); }), sl: () => { save.slow = true; persist(); stat.offer('slow', true); beginRound(); toast('Slow aim on'); },
        ex: () => { bonus = 2; stat.offer('time', true); beginRound(); toast('Two more seconds'); },
        mo: () => { if (!save.owed) save.owed = {}; save.owed[lid(li)] = wins(); persist(); stat.offer('move', true); startLevel(li + 1); } });
    placeFail();
  }
  /* The card goes on the side of the pitch away from the incident; the drag chip on the other side. */
  function placeFail() {
    const r = $('stage').getBoundingClientRect(), card = $('card'), inc = Render.incident ? Render.incident() : null;
    const top = !inc || inc.y > r.height * 0.45;
    card.style.left = (r.left + 8) + 'px'; card.style.width = (r.width - 16) + 'px';
    if (top) { card.style.top = (r.top + 8) + 'px'; card.style.bottom = ''; } else { card.style.bottom = (window.innerHeight - r.bottom + 8) + 'px'; card.style.top = ''; }
    $('dragchip').className = 'on ' + (top ? 'low' : 'high');
    failGuard = performance.now() + 400;
  }
  function redoPrev() { if (round === 0) return; recs[liveIdx()] = null; round--; recs[liveIdx()] = null; beginRound(); }
  function onWon() {
    const a = L().att[liveIdx()];
    if (prac >= 0 && pracLv.mark) {             // the pass must come to rest inside the chalk circle
      const k = sim.liveRec.kick, m = pracLv.mark, ex = k.bx + k.vx / FB.C.fric, ey = k.by + k.vy / FB.C.fric, off = Math.hypot(ex - m.x, ey - m.y);
      if (off > m.r) return pracMiss(Math.abs(ex - m.x) > m.r ? ['Off line', 'Aim <b>at the circle</b> and go again.'] : ey > m.y ? ['Short', 'Drag <b>further</b> for more weight.'] : ['Too long', 'Drag a <b>shorter</b> distance.']);
      if (pracLv.passOnly) { SFX.lock(); pracNote = ['In the circle', 'Weighted right. On to the next drill.']; coachKey = null; state = 'failed'; const q = seq; return later(() => { if (seq === q) pracDone(); }, 900); }
    }
    if (a.role === 'decoy' && !save.seenDecoy) { save.seenDecoy = true; persist(); }
    recs[liveIdx()] = FB.finalRec(sim); SFX.lock();
    round++; beginRound();
    const t = document.querySelectorAll('#who .tsb.done'); if (t.length) t[t.length - 1].classList.add('fresh');
  }
  let result = null;   // the finished move, worked out at the goal so the replay knows whether to play in full
  function onGoal(now) {
    recs[liveIdx()] = FB.finalRec(sim); state = 'goalhold'; goalAt = now; seq++; coach('');
    SFX.goal(); stampOn('GOAL!');
    if (prac >= 0) return;
    // the score chip flips with the stamp and the goal haptic, not after it
    const lv = L(), after = scoreHtml(lv, true);
    if (after && parseScore(story(lv).score)) { const el = $('score'); el.innerHTML = after; el.className = 'on'; void el.offsetWidth; el.className = 'on tick'; SFX.tick(); }
    result = recordWin();
  }
  function recordWin() {
    if (dly) return recordDaily();
    stat.cleared(fails + 1);
    if (owed(li)) { delete save.owed[lid(li)]; }
    const t = sim.tick / 60, st = Math.min(starsFor(li, t), save.slow ? 2 : 3), old = rec(li), firstWin = !old;
    if (!old || st > old.stars || (st === old.stars && t < old.time)) { save.done[lid(li)] = { stars: st, time: +t.toFixed(2), retries: fails, slow: save.slow ? 1 : 0 }; persist(); }
    logPlay('goal');
    const isBest = !firstWin && t < old.time - 0.004;
    return { t, st, old, firstWin, isBest, full: firstWin || isBest, li, fails };
  }
  /* After the GOAL stamp: on a first win or a new best, one full-height loop of the move (tap to skip), then the result
     card. Any other win: the card at once, over the looping replay, to keep the retry loop quick. */
  function afterGoal() {
    if (prac >= 0) { seq++; stat.drill(); return pracDone(); }
    const rKey = li + ':' + fails + ':' + sim.tick;
    if (CFG.rate && !dly && lastRate !== rKey) { seq++; rsim = mkSim(-1); rhold = 0; stampOff(); state = 'goal'; hudReplay(); return showRate(false, () => { lastRate = rKey; showResult(); }); }
    if (result && result.full) startReplay(); else showResult();
  }
  function startReplay() {
    state = 'replay'; seq++; stampOff(); hudReplay(); rsim = mkSim(-1); rhold = 0;
    $('skip').className = 'chip on';
  }
  const SCALES = (CFG.scales || []).length ? [
    ['c', 'Challenge', ['Far too easy', 'Easy', 'About right', 'Hard', 'Far too hard']],
    ['f', 'Fun', ['Dull', 'Flat', 'Fine', 'Good', 'Loved it']],
    ['r', 'Fair', ['Cheap', 'Mostly cheap', 'Mixed', 'Mostly fair', 'My own fault']]
  ].concat(CFG.scales) : [
    ['c', 'Challenge', ['Far too easy', 'Easy', 'About right', 'Hard', 'Far too hard']],
    ['f', 'Fun', ['Dull', 'Flat', 'Fine', 'Good', 'Loved it']],
    ['r', 'Fair', ['Cheap', 'Mostly cheap', 'Mixed', 'Mostly fair', 'My own fault']]
  ];
  let lastRate = '';
  function showRate(gaveUp, after) {
    state = gaveUp ? 'failed' : 'goal'; const pickd = {}, lv = L(), takes = fails + (gaveUp ? 0 : 1);
    const draw = () => {
      showOv('sheet', '<div class="sh-top"><span class="lbl soft">No. ' + no(li) + ' · ' + esc(lv.name) + ' · ' + takes + (takes === 1 ? ' take' : ' takes') + (gaveUp ? ' · not finished' : '') + '</span></div><h2>How was that one?</h2>' +
        SCALES.map(sc => '<div class="rate"><b>' + sc[1] + '</b><div class="rate-row">' + sc[2].map((t, i) => '<button class="rt' + (pickd[sc[0]] === i + 1 ? ' on' : '') + '" data-k="' + sc[0] + '" data-v="' + (i + 1) + '"><i>' + (i + 1) + '</i><span>' + t + '</span></button>').join('') + '</div></div>').join('') +
        '<div class="btns"><button class="btn p" id="sv"' + (Object.keys(pickd).length < SCALES.length ? ' disabled' : '') + '>Save and carry on</button></div>',
        { sv: () => {
          if (!save.ratings) save.ratings = {};
          save.ratings[lv.name] = Object.assign({ n: li + 1, takes, done: gaveUp ? 0 : 1, time: gaveUp ? null : +(sim.tick / 60).toFixed(1), shot: gaveUp ? null : shotFrom(), fails: failTally() }, pickd);
          persist(); after();
        } });
      document.querySelectorAll('.rt').forEach(b => b.onclick = () => { pickd[b.dataset.k] = +b.dataset.v; SFX.tap(); draw(); });
    };
    draw();
  }
  function shotFrom() { const k = sim.liveRec && sim.liveRec.kick; return k ? +Math.hypot(k.bx - 25, k.by).toFixed(1) : null; }
  function failTally() { const t = {}; (save.log || []).forEach(e => { if (e[0] === li + 1 && e[2] !== 'goal') t['P' + e[1] + ' ' + e[2]] = (t['P' + e[1] + ' ' + e[2]] || 0) + 1; }); return t; }
  function ratingsText() {
    const r = save.ratings || {}, rows = Object.keys(r).sort((a, b) => r[a].n - r[b].n).map(k => { const x = r[k]; return [x.n, k].concat(SCALES.map(sc => sc[1].toLowerCase() + ' ' + x[sc[0]]), [x.takes + ' takes', x.done ? x.time + 's' + (x.shot != null ? ' shot ' + x.shot + 'm' : '') : 'gave up', Object.keys(x.fails || {}).map(f => f + ' x' + x.fails[f]).join('; ')]).join(' | '); });
    return (CFG.title || 'Ratings') + '\n' + (rows.join('\n') || 'Nothing rated yet.');
  }
  function showRatings() {
    const txt = ratingsText();
    showOv('page', '<div class="pg"><div class="strip"><span>' + esc(CFG.title || 'Ratings') + '</span><span>' + Object.keys(save.ratings || {}).length + ' rated</span></div><h1>Your ratings</h1>' +
      '<p class="fine">Copy this and paste it into the chat when you have played as many as you want.</p><pre class="log">' + esc(txt) + '</pre></div>' +
      '<div class="pg-foot"><button class="btn" id="cp">Copy</button><button class="btn p" id="x">Done</button></div>',
      { x: showHome, cp: () => { try { navigator.clipboard.writeText(txt).then(() => toast('Copied'), () => toast('Select the text to copy')); } catch (e) { toast('Select the text to copy'); } } });
  }
  function ordinal(n) { const v = n % 100; return n + (v >= 11 && v <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'); }
  /* "88th minute winner", "Equaliser", from the story's score before the goal and the minute */
  function goalWords(st) {
    const sc = parseScore(st && st.score); if (!sc) return '';
    const m = String(st.minute == null ? '' : st.minute), late = /\+/.test(m) || +m >= 85;
    const when = /\+/.test(m) ? 'Stoppage time' : m ? ordinal(+m) + ' minute' : '';
    const a = sc[0] + 1, b = sc[1];
    const what = a === b ? 'equaliser' : a < b ? 'one back' : a === b + 1 ? (late ? 'winner' : sc[0] === 0 ? 'opener' : 'in front') : 'goal';
    return '<span class="rs-what">' + esc(when) + (when ? '<br>' : '') + esc(what) + '</span>';
  }
  function showResult() {
    if (prac >= 0) return;
    if (dly) return showDailyResult();
    state = 'goal'; seq++; $('skip').className = 'chip'; stampOff(); hudReplay();
    if (!rsim) { rsim = mkSim(-1); rhold = 0; }
    const R = result || recordWin(), lv = L(), t = R.t, st = R.st, stry = story(lv), ch = chapterOf(li), last = li === LEVELS.length - 1;
    let seasonDone = li === ch.to; for (let i = ch.from; i <= ch.to && seasonDone; i++) if (!rec(i)) seasonDone = false;
    const sc = parseScore(stry && stry.score);
    const score = sc ? '<div class="rs-score"><s>' + fmtScore(sc) + '</s><b>' + fmtScore([sc[0] + 1, sc[1]]) + '</b>' + goalWords(stry) + '</div>' : '<div class="rs-score"><b class="nm">' + esc(lv.name) + '</b></div>';
    const target = st < 3 && parOf(li, 1)
      ? (save.slow && starsFor(li, t) === 3 ? 'Slow aim on: two stars at most' : (st === 2 ? 'Third' : 'Second') + ' star at ' + parOf(li, st === 2 ? 1.2 : 1.5).toFixed(1) + 's')
      : R.isBest ? 'New best' : R.firstWin ? 'Every star' : 'Best ' + rec(li).time.toFixed(1) + 's';
    const nxt = seasonDone ? '<span>' + (last ? 'Final whistle' : 'Season review') + '</span>' : '<span>' + (last ? 'Fixtures' : 'Next fixture') + '</span>';
    const nextRow = seasonDone
      ? '<div class="upnext done"><span class="lbl">Season ' + ch.n + '</span><b>' + esc(ch.name) + ' complete</b></div>'
      : last ? '<div class="upnext done"><span class="lbl">Final fixture</span><b>Earlier fixtures still to win</b></div>' : '';
    showOv('sheet', '<div class="rs-top"><span class="lbl soft">No. ' + no(li) + (stry && stry.opp ? ' · v ' + esc(stry.opp) : ' · ' + esc(lv.name)) + '</span><span class="lbl soft">Take ' + (R.fails + 1) + '</span></div>' +
      score + '<div class="rs-row">' + stars(st, 'big stampin') + '<div class="rs-time"><b>' + t.toFixed(1) + 's</b><small>' + esc(target) + '</small></div></div>' + nextRow +
      '<div class="btns"><button class="btn sq" id="mv" aria-label="Fixtures">' + IC.list + '</button><button class="btn sq" id="ag" aria-label="Play this move again">' + IC.retry + '</button><button class="btn p" id="nx">' + nxt + IC.next + '</button></div>',
      { ag: () => startLevel(li), mv: () => askStats(showHome), nx: () => askStats(() => seasonDone ? showSeason(ch) : last ? showHome() : startLevel(li + 1)) });
    if (reduced()) return;
    for (let i = 0; i < st; i++) later(() => SFX.stamp(i), 260 + 300 * i);
  }

  /* ---------- season complete, and the end of the printed fixtures ---------- */
  const ROSETTE = '<svg class="rosette" viewBox="0 0 96 120" aria-hidden="true" focusable="false"><g stroke="#14213D" stroke-width="2" stroke-linejoin="round">' +
    '<path d="M34 70l-10 44 14-8 8 12 8-40z" fill="#E4572E"/><path d="M62 70l10 44-14-8-8 12-8-40z" fill="#8EC5D6"/>' +
    '<path d="M48 4l8 7 10-3 4 10 10 3-2 10 8 7-6 9 4 10-10 4-2 10-10-1-6 8-8-6-8 6-6-8-10 1-2-10-10-4 4-10-6-9 8-7-2-10 10-3 4-10 10 3z" fill="#F2B705"/>' +
    '<circle cx="48" cy="46" r="21" fill="#F2EAD8"/><path d="M48 31.5l4.3 8.9 9.7 1.4-7 6.8 1.7 9.6-8.7-4.6-8.7 4.6 1.7-9.6-7-6.8 9.7-1.4z" fill="#F2B705"/></g></svg>';
  function showSeason(ch) {
    state = 'season';
    const last = ch.to === LEVELS.length - 1; let got = 0, tries = 0, rows = '';
    for (let i = ch.from; i <= ch.to; i++) {
      const r = rec(i) || { stars: 0, time: 0, retries: 0 }; got += r.stars; tries += r.retries || 0;
      rows += '<li><span class="n">' + no(i) + '</span><b>' + esc(LEVELS[i].name) + '</b>' + stars(r.stars) + '</li>';
    }
    const max = (ch.to - ch.from + 1) * 3, all = totalStars(), allMax = LEVELS.length * 3;
    const line = got === max ? 'Every star going. The gaffer has nothing to say, which from him is high praise.'
      : (max - got === 1 ? 'One star' : (max - got) + ' stars') + ' left on the table. The fixtures will keep.';
    const nextCh = chapters().find(c => c.from === ch.to + 1);
    showOv('page', '<div class="pg cert"><div class="strip"><span>End of season report</span><span>Season ' + ch.n + '</span></div>' + ROSETTE +
      '<h1>' + esc(ch.name) + '</h1><div class="inkstamp">' + (last ? 'All moves complete' : 'Season complete') + '</div>' +
      '<dl class="stats wide"><div><dd>' + got + '/' + max + '</dd><dt>Stars</dt></div><div><dd>' + (ch.to - ch.from + 1) + '</dd><dt>Fixtures won</dt></div><div><dd>' + tries + '</dd><dt>Retries</dt></div></dl>' +
      '<p class="lede">' + line + '</p><ol class="table">' + rows + '</ol>' +
      (last ? '<div class="final"><div class="lbl">Final whistle</div><p>From the bottom of Division Four to the Amateur Cup: <b>' + all + ' of ' + allMax + ' stars</b> across ' + LEVELS.length + ' moves. Any star you are missing is a quicker move away.</p></div>' : '') + '</div>' +
      '<div class="pg-foot"><button class="btn' + (last ? ' p' : ' sq') + '" id="mv"' + (last ? '>Back to the fixtures' : ' aria-label="Fixtures">' + IC.list) + '</button>' +
      (last ? '' : '<button class="btn p" id="nx"><span>' + (nextCh ? esc(nextCh.name) : 'Next season') + '</span>' + IC.next + '</button>') + '</div>',
      { mv: showHome, nx: () => startLevel(ch.to + 1) });
    if (!reduced()) later(() => SFX.stamp(2), 420);
  }

  /* ---------- the Daily Move (retention plan, proposal 4) ----------
     One generated move a day, the same for everyone, made ahead of time by tools/gen/daily.js. The first 90 days ship in
     js/levels/daily.js; later ones come from the website as one small file per month (a monthly file also replaces a bad
     day of the bundle). Chosen by the phone's local date. Opens after season 1. A daily made for a newer engine than this
     build is skipped. Unlimited takes; the best time counts; the stars are the usual ones against the bot's time. */
  const DAILY_ENGINE = 1;
  const SET = window.OMT_SETTINGS || {};
  const SITE = String(SET.site || 'https://aaliyaanwaja.github.io/ollywoodgames.github.io/one-man-team/');
  const DAILY = window.OMT_DAILY || { epoch: '2026-11-30', days: [] };
  const dailyDays = {};   // date -> entry
  (DAILY.days || []).forEach(d => { dailyDays[d.date] = d; });
  let todayOverride = null;
  const pad2 = n => (n < 10 ? '0' : '') + n;
  const ymd = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  const today = () => todayOverride || ymd(new Date());
  const dateAt = s0 => { const p = s0.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); };
  const addDays = (s0, k) => { const d = dateAt(s0); d.setDate(d.getDate() + k); return ymd(d); };
  const daysBetween = (a, b) => Math.round((dateAt(b) - dateAt(a)) / 864e5);
  const dailyNo = date => daysBetween(DAILY.epoch, date) + 1;
  const dateOfNo = n => addDays(DAILY.epoch, n - 1);
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const nice = date => { const d = dateAt(date); return DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()]; };
  const dailyOf = date => { const d = dailyDays[date]; return d && (d.engine || 1) <= DAILY_ENGINE && d.level ? d : null; };
  const dailyRec = date => (save.daily || {})[date];
  function dailyUnlocked() { if (save.all || CFG.unlock) return true; const c = chapters()[0]; for (let i = c.from; i <= c.to; i++) if (!rec(i)) return false; return true; }
  /* months fetched from the website, kept in a cache of their own (not in the save, which goes to the app on every change) */
  const monthKey = m => 'omt.daily.' + m, tried = {};
  function addMonth(j) { try { (j.days || []).forEach(d => { if (d && d.date && d.level) dailyDays[d.date] = d; }); } catch (e) {} }
  try { for (let k = 0; k < localStorage.length; k++) { const key = localStorage.key(k); if (/^omt\.daily\./.test(key)) addMonth(JSON.parse(localStorage.getItem(key))); } } catch (e) {}
  function fetchMonth(m) {
    if (tried[m] || typeof fetch !== 'function') return Promise.resolve(false); tried[m] = true;
    const base = /^https?:/.test(location.protocol) && /ollywoodgames\.github\.io$/.test(location.hostname) ? 'daily/' : SITE + 'daily/';
    return fetch(base + m + '.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => {
      if (!j || !j.days) return false; addMonth(j); try { localStorage.setItem(monthKey(m), JSON.stringify(j)); } catch (e) {} return true;
    }).catch(() => false);
  }
  /* today's month from the site when the bundle has no move for today or the coming week (quietly, in the background) */
  function refreshDaily() {
    const t = today(), need = [t, addDays(t, 6)].filter(d => d >= DAILY.epoch && !dailyOf(d)).map(d => d.slice(0, 7));
    const months = need.filter((m, i) => need.indexOf(m) === i);
    if (!months.length) return Promise.resolve(false);
    return Promise.all(months.map(fetchMonth)).then(r => r.some(Boolean));
  }
  function weekOf(date) { const d = dateAt(date), back = (d.getDay() + 6) % 7; return Array.from({ length: 7 }, (_, k) => addDays(date, k - back)); }
  function noteFullWeek(date) {
    const wk = weekOf(date); if (!wk.every(d => dailyRec(d))) return;
    if (!save.fullWeeks) save.fullWeeks = []; if (save.fullWeeks.indexOf(wk[0]) < 0) save.fullWeeks.push(wk[0]);
  }
  function dailyTicket() {
    const el = $('daily'); if (!el) return;
    const t = today(), d = dailyOf(t);
    if (!dailyUnlocked() || !d) { el.innerHTML = ''; return; }
    const r = dailyRec(t), lv = d.level, ballers = lv.order.length, gaffer = Math.ceil(d.bot * 1.2 * 10) / 10;
    const sub = (['', 'One player', 'Two players', 'Three players', 'Four players', 'Five players', 'Six players'][ballers] || ballers + ' players') + ' · ' + esc(d.template || '');
    const days = weekOf(t).map((day, k) => {
      const won = dailyRec(day), past = day < t, isToday = day === t, open = dailyOf(day) && daysBetween(day, t) < 7 && day <= t;
      const cls = won ? 'won' : isToday ? 'today' : past && dailyOf(day) ? 'miss' : 'future';
      return '<button class="dd ' + cls + '"' + (open ? ' data-d="' + day + '"' : ' disabled') + ' aria-label="' + esc(nice(day) + (won ? ', won' : open ? ', play' : '')) + '"><i>' + (won ? IC.tick : '') + '</i><small>' + 'MTWTFSS'[k] + '</small></button>';
    }).join('');
    const full = (save.fullWeeks || []).length;
    el.innerHTML = '<div class="dly"><span class="flag">Daily Move · ' + esc(nice(t)) + '</span>' +
      '<button class="dly-main" data-d="' + t + '" aria-label="' + esc('Daily Move number ' + d.n + ', ' + lv.name) + '"><span class="tk-stub"><small>No.</small><b>' + d.n + '</b></span>' +
      '<span class="tk-body"><small>' + sub + '</small><b>' + esc(lv.name) + '</b><em>Gaffer <b>' + gaffer.toFixed(1) + 's</b>   Your best <b>' + (r ? r.t.toFixed(1) + 's' : '–') + '</b></em></span><span class="go">' + IC.next + '</span></button>' +
      '<div class="week"><span class="lbl soft">This week' + (full ? '<br>Full weeks: ' + full : '') + '</span><div class="days">' + days + '</div></div></div>';
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { SFX.tap(); startDaily(b.dataset.d); });
  }
  function startDaily(date, shared) {
    const d = dailyOf(date); if (!d) return showHome();
    prac = -1; bonus = 0; li = 0; dly = { n: d.n, date, lv: JSON.parse(JSON.stringify(d.level)), bot: d.bot, shared: !!shared };
    dly.lv.name = d.level.name; round = 0; recs = L().att.map(() => null); fails = 0; rsim = null; sim = mkSim(liveIdx());
    stat.daily(); stat.level('D');
    stampOff(); $('ready').className = ''; screen('play'); hud(); showDailyBrief();
  }
  const dailyPar = k => Math.ceil(dly.bot * k * 10) / 10;
  const dailyStars = t => t <= dailyPar(1.2) ? 3 : t <= dailyPar(1.5) ? 2 : 1;
  function showDailyBrief() {
    state = 'brief';
    const lv = L(), r = dailyRec(dly.date), k = kit(lv);
    const legend = lv.order.map((ai, n) => { const a = lv.att[ai], dec = a.role === 'decoy'; return '<li><i class="ono">' + (n + 1) + '</i>' + base(a.num, dec ? ['#8EC5D6', '#F2EAD8'] : k.us) + '<b>' + esc(dec ? 'Decoy' : a.name) + '</b></li>'; }).join('');
    showOv('page', '<div class="pg brief lean"><div class="strip"><span>Daily Move · ' + esc(nice(dly.date)) + '</span><span>No. ' + dly.n + '</span></div>' +
      '<div class="fx slim"><b>The same move for everyone today</b><span class="board sm"><span class="min">Gaffer</span><span class="sc">' + dailyPar(1.2).toFixed(1) + 's</span></span></div>' +
      '<h1>' + esc(lv.name) + '</h1><p class="lede">' + esc(lv.brief) + '</p><p class="sline">' + (r ? 'Your best today: ' + r.t.toFixed(1) + 's in ' + r.takes + (r.takes === 1 ? ' take' : ' takes') + '. Beat it, or the gaffer.' : 'Beat the gaffer’s time for the third star. Take as many goes as you like.') + '</p>' +
      lineupSvg(lv) + '<ol class="legend">' + legend + '</ol></div>' +
      '<div class="pg-foot"><button class="btn sq" id="bk" aria-label="Back to fixtures">' + IC.back + '</button><button class="btn p" id="go">Kick off</button></div>',
      { go: () => { SFX.whistle(); beginRound(); }, bk: showHome });
  }
  function recordDaily() {
    const t = sim.tick / 60, st = Math.min(dailyStars(t), save.slow ? 2 : 3), old = dailyRec(dly.date), firstWin = !old, takes = fails + 1;
    if (!save.daily) save.daily = {};
    if (!old || t < old.t - 0.004) save.daily[dly.date] = { t: +t.toFixed(2), st: Math.max(st, old ? old.st : 0), takes: old ? old.takes + takes : takes };
    else old.takes += takes;
    noteFullWeek(dly.date); persist(); logPlay('goal'); stat.cleared(takes);
    const isBest = !firstWin && t < old.t - 0.004;
    return { t, st, old, firstWin, isBest, full: firstWin || isBest, li, fails, daily: dly.n };
  }
  function showDailyResult() {
    state = 'goal'; seq++; $('skip').className = 'chip'; stampOff(); hudReplay();
    if (!rsim) { rsim = mkSim(-1); rhold = 0; }
    const R = result && result.daily === dly.n ? result : recordDaily(), lv = L(), best = dailyRec(dly.date), nextN = dly.n + 1, nextDate = dateOfNo(nextN);
    const when = nextDate === addDays(today(), 1) ? 'tomorrow' : nextDate <= today() ? 'ready now' : nice(nextDate);
    showOv('sheet', '<div class="rs-top"><span class="lbl soft">Daily Move No. ' + dly.n + ' · ' + esc(lv.name) + '</span><span class="datechip">' + esc(nice(dly.date)) + '</span></div>' +
      '<div class="rs-row dl">' + stars(R.st, 'big stampin') + '<dl class="stats dstats"><div><dd>' + R.t.toFixed(1) + 's</dd><dt>' + (R.isBest || R.firstWin ? 'New best' : 'Best ' + best.t.toFixed(1) + 's') + '</dt></div>' +
      '<div class="soft"><dd>' + dailyPar(1.2).toFixed(1) + 's</dd><dt>Gaffer</dt></div><div><dd>' + (R.fails + 1) + '</dd><dt>' + (R.fails ? 'Takes' : 'Take') + '</dt></div></dl></div>' +
      '<p class="nextd"><b>Next daily:</b> No. ' + nextN + ', ' + esc(when) + '</p>' +
      '<div class="btns"><button class="btn sq" id="mv" aria-label="Fixtures">' + IC.list + '</button><button class="btn sq" id="ag" aria-label="Play this move again">' + IC.retry + '</button><button class="btn p" id="sh"><span>Share</span>' + IC.share + '</button></div>',
      { ag: () => startDaily(dly.date), mv: showHome, sh: () => shareDaily(R) });
    if (reduced()) return;
    for (let i = 0; i < R.st; i++) later(() => SFX.stamp(i), 260 + 300 * i);
  }

  /* ---------- one-tap text share (retention plan, proposal 5) ----------
     Plain text and a link that opens the same move in the web build, so a friend can play it without installing
     anything. In the app the shell's own share sheet is used (bridge message `share`); in a browser the system share
     sheet, or the clipboard where there is none. */
  function shareText(R) {
    return GAME_NAME + ' · Daily ' + dly.n + '\n' + L().name + ' · ' + R.t.toFixed(1) + ' s · ' + (R.fails + 1) + (R.fails ? ' takes' : ' take') + '\n' +
      'Gaffer’s time ' + dailyPar(1.2).toFixed(1) + ' s. Your turn:\n' + SITE + '?daily=' + dly.n;
  }
  function shareDaily(R) {
    const text = shareText(R); stat.share();
    if (window.ReactNativeWebView) { toNative({ t: 'share', text }); return; }
    if (navigator.share) { navigator.share({ text }).catch(() => {}); return; }
    try { navigator.clipboard.writeText(text).then(() => toast('Copied. Paste it anywhere'), () => showShareText(text)); } catch (e) { showShareText(text); }
  }
  function showShareText(text) {
    showOv('dlg', '<div class="lbl">Share</div><h2>Copy and send</h2><pre class="log">' + esc(text) + '</pre><div class="btns"><button class="btn p" id="x">Done</button></div>', { x: showDailyResult });
  }

  /* ---------- anonymous measurement (retention plan, proposal 1; privacy.html) ----------
     Two kinds of message, no identifiers of any kind: one "day" message on the first open of each local day, and one
     session summary when the game goes to the background. Nothing is collected, kept or sent while statsUrl in
     js/config.js is empty, or when the player switches it off in Options. In the UK and EU the switch starts off and the
     game asks once, after the first fixture (only when an endpoint is set, since before that there is nothing to ask). */
  const STATS_URL = String(SET.statsUrl || CFG.statsUrl || '');
  const europe = (() => { try { return /^Europe\//.test(Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch (e) { return false; } })();
  const statsOn = () => save.stats === undefined ? !europe : !!save.stats;
  const OS = window.__OMT_NATIVE__ ? (window.__OMT_NATIVE__.platform === 'ios' ? 'ios' : 'android') : 'web';
  const stat = (() => {
    let S = null;
    const fresh = () => ({ t0: Date.now(), ls: 0, lc: 0, tk: [], fr: {}, dr: 0, dly: 0, sn: {}, sh: 0, last: { s: 'home', l: 0, k: 0, o: '' } });
    const live = () => !!STATS_URL && statsOn();
    function queue(m) {
      if (!live()) return;
      m.v = BUILD; m.c = save.inst; m.d = daysBetween(save.inst, today()); if (save.all) m.t = 1;
      if (!save.statsQ) save.statsQ = []; save.statsQ.push(m); if (save.statsQ.length > 20) save.statsQ.splice(0, save.statsQ.length - 20);
      persist(); flush();
    }
    let sending = false;
    function flush() {
      if (!live() || sending || !save.statsQ || !save.statsQ.length || typeof fetch !== 'function') return;
      const batch = save.statsQ.slice(); sending = true;
      // text/plain keeps it a "simple" request (no CORS preflight); keepalive lets it finish as the app goes to the background
      fetch(STATS_URL, { method: 'POST', body: JSON.stringify(batch), headers: { 'Content-Type': 'text/plain' }, keepalive: true, credentials: 'omit', referrerPolicy: 'no-referrer' })
        .then(r => { if (r.ok) { save.statsQ.splice(0, batch.length); persist(); } }).catch(() => {}).then(() => { sending = false; });
    }
    const bucket = m => m < 1 ? '<1' : m < 3 ? '1-3' : m < 10 ? '3-10' : m < 30 ? '10-30' : '30+';
    function summary() {
      if (!S || (!S.ls && !S.dr && Date.now() - S.t0 < 20000)) return;
      queue({ k: 'session', mins: bucket((Date.now() - S.t0) / 60000), ls: S.ls, lc: S.lc, tk: S.tk, fr: S.fr, dr: S.dr, dly: S.dly, sn: S.sn, sh: S.sh, last: S.last });
      S = fresh();
    }
    function day() {
      const t = today(); if (save.lastDay === t) return; const yesterday = addDays(t, -1);
      save.lastDay = t; persist();
      let fx = 0; LEVELS.forEach((_, i) => { if (rec(i)) fx = i + 1; });
      queue({ k: 'day', os: OS, fx, dm: dailyRec(yesterday) ? 1 : 0 });
    }
    return {
      boot() { if (!save.inst) { save.inst = today(); persist(); } S = fresh(); day(); flush(); },
      hidden() { summary(); flush(); },
      shown() { if (!S) S = fresh(); day(); },
      level(l) { if (S) { S.ls++; S.last = { s: 'play', l, k: 0, o: '' }; } },
      outcome(o) { if (S) { if (o !== 'goal') S.fr[o] = (S.fr[o] || 0) + 1; S.last.k++; S.last.o = o; } },
      cleared(takes) { if (S) { S.lc++; S.tk.push(takes); } },
      drill() { if (S) S.dr++; }, daily() { if (S) S.dly = 1; }, share() { if (S) S.sh++; },
      offer(kind, taken) { if (S) { const k = kind + (taken ? '+' : ''); S.sn[k] = (S.sn[k] || 0) + 1; } },
      screen(n) { if (S) S.last.s = n; },
      live
    };
  })();
  function statsRow() { return toggle('oStat', IC.chart, 'Play statistics', statsOn(), STATS_URL ? 'Anonymous. Two small messages a day at most.' : 'Anonymous. No statistics service yet, so nothing is sent.'); }
  function statsNote() {
    return STATS_URL
      ? 'Progress is kept on this phone. ' + (statsOn() ? 'Anonymous play statistics are on: no account, no identifiers, no adverts.' : 'Nothing is sent: play statistics are off.')
      : 'Progress is kept on this phone only. No account, no adverts, no tracking.';
  }
  /* UK and EU: ask once, after the first fixture, in one sentence */
  function askStats(then) {
    if (!STATS_URL || !europe || save.stats !== undefined) return then();
    showOv('dlg', '<div class="lbl">Play statistics</div><h2>Help improve the game?</h2><p>Send two small anonymous messages a day about how far you got and where moves broke down. No account, no identifiers. You can change this in Options.</p>' +
      '<div class="btns"><button class="btn" id="n">No thanks</button><button class="btn p" id="y">Yes</button></div>',
      { n: () => { save.stats = false; persist(); then(); }, y: () => { save.stats = true; persist(); then(); } });
  }

  /* ---------- pause ---------- */
  function showPause() {
    if (state === 'home' || state === 'goalhold' || state === 'season' || state === 'failhold') return;
    if (state === 'replay') showResult();
    freeze();
    const was = state, lv = L(), a = lv.att[liveIdx()], inRound = was === 'ready' || was === 'failed' || was === 'play';
    const back = () => { hideOv(); if (was === 'goal') showGoalAgain(); else if (was === 'failed') showFailAgain(); else if (was === 'brief') showBrief(); };
    const title = prac >= 0 ? 'Drill ' + (prac + 1) + ' · ' + esc(pracLv.name) : dly ? 'Daily Move No. ' + dly.n + ' · ' + esc(lv.name) + (was !== 'goal' ? ' · Take ' + (fails + (was === 'failed' ? 0 : 1)) : '') : 'No. ' + no(li) + ' · ' + esc(lv.name) + (was !== 'goal' ? ' · Take ' + (fails + (was === 'failed' ? 0 : 1)) : '');
    const ib = (id, icon, label) => '<button class="pib" id="' + id + '">' + icon + '<small>' + label + '</small></button>';
    showOv('dlg', '<div class="lbl">' + title + '</div><h2>Paused</h2>' +
      (inRound ? '<div class="you">' + base(a.num, kit(lv).us) + '<div><b>' + esc(a.name) + '</b><p>' + esc(a.tip) + '</p></div></div>' : '') +
      '<button class="btn p wide" id="ct">Resume</button>' +
      '<div class="btns"><button class="btn" id="rs">' + (prac >= 0 ? 'Restart drill' : 'Restart move') + '</button><button class="btn" id="mv">Fixtures</button></div>' +
      '<div class="pibs">' + ib('pS', IC.sound, 'Sound ' + (save.sound ? 'on' : 'off')) + ib('pH', IC.buzz, 'Buzz ' + (save.haptics ? 'on' : 'off')) + ib('hw', IC.book, 'How to play') + '</div>',
      { mv: showHome, rs: () => prac >= 0 ? startPractice(prac) : dly ? startDaily(dly.date) : startLevel(li), ct: back, hw: () => showHow(showPause) });
    $('pS').onclick = () => { flipSound(); showPause(); };
    $('pH').onclick = () => { flipBuzz(); SFX.tap(); showPause(); };
    $('pS').setAttribute('aria-pressed', save.sound ? 'true' : 'false'); $('pH').setAttribute('aria-pressed', save.haptics ? 'true' : 'false');
    $('ov').dataset.pause = '1';
  }
  // re-open a sheet after pausing without counting the failure or the win twice
  function showFailAgain() { showFail(); }
  function showGoalAgain() { const s = SFX.set; SFX.set(false, false); showResult(); s(save.sound, save.haptics); }

  /* ---------- coach: short prompts tied to what the player has not done yet ---------- */
  const COACH = {
    k0: ['Drag anywhere to run.', 'pad', 'top'],
    k1: ['Now press <b>PASS</b>, hold, and drag towards the 9.', 'kick', 'top'],
    k2: ['Keep holding. Drag further for a harder pass.', 'kick', 'top'],
    k3: ['Let go to play it.', 'kick', 'top'],
    k4: ['Played. Now you become the striker.', '', 'top'],
    s0: ['You are the 9 now. Your own pass is coming. Drag to start.', 'pad', 'top'],
    s1: ['Wait for the pass to be hit.', '', 'top'],
    s2: ['It is on its way. Run onto it.', 'pad', 'top'],
    s3: ['You have it. Press <b>SHOOT</b> and drag at the goal.', 'kick'],
    s4: ['Pick a corner, then let go.', 'kick'],
    d0: ['No ball for you this time. Drag to pull your marker away.', 'pad', 'top'],
    d1: ['When he has gone far enough, press <b>DONE</b>.', 'kick', 'top']
  };
  const tutorial = () => prac < 0 && !dly && li === 0 && !rec(0) && L().order.length === 2;
  /* Moves 2-4, first time through: one prompt per situation. r ready, w waiting for the pass, i pass on its way,
     h on the ball, a aiming, k played. Keyed by round within the move. */
  const TUT = {
    1: [
      { r: 'Two defenders this time. Drag to start.', h: 'Press <b>PASS</b> and drag at the gap between the two defenders.', a: 'Through the middle of them. Let go to play it.', k: 'Played. Now time the run.' },
      { r: 'You are the 9. See the yellow line? That is offside.', w: 'Stay behind the yellow line until the pass is hit.', i: 'It is hit. Go now, run onto it.', h: 'Carry it closer, then <b>SHOOT</b> at a corner.', a: 'Away from the keeper, then let go.' }
    ],
    2: [
      { r: 'Three players now. You start with the 6.', h: 'Pass down the right, into the space <b>ahead</b> of the 7.', a: 'Aim where he will be, not where he is. Let go.', k: 'Played. Now be the winger.' },
      { r: 'You are the 7. Set off early so you arrive with the ball.', w: 'Run up the line. Your pass is coming.', i: 'Take it in your stride.', h: 'Carry it to the byline, then press <b>PASS</b> and drag back towards the penalty spot.', a: 'Into the space in front of goal. The 9 will be there.', k: 'Played. One more: the finish.' },
      { r: 'You are the 9. The pull-back comes late. Do not go too soon.', w: 'Wait for the winger to reach the byline, then move.', i: 'Now arrive. Meet it in front of goal.', h: 'Press <b>SHOOT</b> and drag at the goal.', a: 'Let go.' }
    ],
    3: [
      null,
      { r: 'The middle is empty now. You are the 8.', h: 'Press <b>PASS</b> and drag through the gap your decoy left.', a: 'Into the space for the 11. Let go.', k: 'Played. Now finish it.' },
      { r: 'You are the 11. Run in from the left to meet your pass.', w: 'Start your run. Stay behind the yellow line.', i: 'It is on its way. Run onto it.', h: 'Press <b>SHOOT</b> and drag at a corner.', a: 'Let go.' }
    ]
  };
  function tutKey(me, b) {
    const t = prac >= 0 ? (pracLv.coach || [])[round] || {} : !dly && TUT[li] && !rec(li) && !CFG.rate ? TUT[li][round] : null; if (!t) return null;
    let ph;
    if (sim.liveKickTick >= 0) ph = sim.tick - sim.liveKickTick < 50 ? 'k' : '';
    else if (state === 'ready' && sim.tick === 0) ph = 'r';
    else if (b.owner === sim.live) ph = inp.charging ? 'a' : 'h';
    else ph = b.owner < 0 && b.lastKicker >= 0 ? 'i' : 'w';
    if (!ph || !t[ph]) return '';
    const onBall = ph === 'h' || ph === 'a' || (ph === 'r' && b.owner === sim.live), top = !(ph === 'h' || ph === 'a') || me.y > 30, key = (prac >= 0 ? 'p' + prac : 't' + li) + round + ph + (top ? 'T' : 'B');
    COACH[key] = [t[ph], onBall ? 'kick' : ph === 'k' ? '' : 'pad', top ? 'top' : ''];
    return key;
  }
  function coachState() {
    if (state === 'failed' && prac >= 0 && pracNote) return 'miss';
    if (state !== 'ready' && state !== 'play') return '';
    const a = L().att[liveIdx()], me = sim.att[sim.live], b = sim.ball;
    if (state === 'ready' && sim.tick > 0) return 'paused';
    if (prac >= 0 && pracNote && (state === 'ready' || sim.tick < 20)) return 'miss';
    if (a.role === 'decoy' && !save.seenDecoy) return state === 'play' && sim.tick > 50 ? 'd1' : 'd0';
    const tk = tutKey(me, b); if (tk !== null) return tk;
    if (!tutorial()) return state === 'ready' ? 'ready' : '';
    if (round === 0) {
      if (sim.liveKickTick >= 0) return 'k4';
      if (inp.charging) return inp.aim && inp.power > 0.12 ? 'k3' : 'k2';
      return state === 'ready' || sim.tick < 30 ? 'k0' : 'k1';
    }
    if (sim.liveKickTick >= 0) return '';
    if (b.owner === sim.live) return inp.charging ? 's4' : 's3';
    if (state === 'ready') return 's0';
    return b.owner < 0 && b.lastKicker >= 0 ? 's2' : 's1';
  }
  function coach(key) {
    if (key === coachKey) return; coachKey = key;
    const el = $('ready'); let html = '', cue = '', lbl = 'Coach';
    if (key === 'paused') html = '<span>Held. Move to carry on.</span>';
    else if (key === 'miss' && pracNote) { html = '<em class="miss">' + esc(pracNote[0]) + '</em><span>' + pracNote[1] + '</span>'; }
    else if (COACH[key]) { html = '<em>' + lbl + '</em><span>' + COACH[key][0] + '</span>'; cue = COACH[key][1]; }
    const top = key === 'miss' || !!(COACH[key] && COACH[key][2] === 'top');
    el.innerHTML = html; el.className = html ? 'on' + (COACH[key] || key === 'miss' ? ' coach' : '') + (top ? ' top' : '') : '';
    $('stage').classList.toggle('coach-top', top);
    // the round-start card: shown while the player reads (state ready, clock not started), folded on the first touch
    const want = key === 'ready';
    if (want !== rcardOn) {
      rcardOn = want; $('rcard').className = want ? 'on' : (reduced() ? '' : 'fold');
      if (!want && state === 'play') SFX.paper();
    }
    $('pad').classList.toggle('cue', cue === 'pad' || key === 'ready'); $('kickwrap').classList.toggle('cue', cue === 'kick');
  }

  /* ---------- input ---------- */
  const play = $('play'), joyEl = $('joy'), knob = joyEl.firstElementChild;
  play.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    if (state === 'replay') { showResult(); return; }
    if (state === 'failed' && prac < 0 && !joy && performance.now() >= failGuard && $('ov').dataset.pause !== '1' && $('ov').classList.contains('k-fail')) beginRound();
    if (joy || (state !== 'ready' && state !== 'play')) return;
    joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, mx: 0, my: 0 };
    joyEl.style.display = 'block'; joyEl.style.left = joy.ox + 'px'; joyEl.style.top = joy.oy + 'px'; knob.style.transform = '';
    e.preventDefault();
  });
  window.addEventListener('pointermove', e => {
    if (!joy || e.pointerId !== joy.id) return;
    let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const R = 44, m = Math.hypot(dx, dy);
    if (m > R) { dx *= R / m; dy *= R / m; }
    joy.mx = dx / R; joy.my = dy / R;
    knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    if (m > 8) kickoff();
  });
  const joyEnd = e => { if (joy && e.pointerId === joy.id) { joy = null; joyEl.style.display = 'none'; } };
  window.addEventListener('pointerup', joyEnd); window.addEventListener('pointercancel', joyEnd);
  play.addEventListener('contextmenu', e => e.preventDefault());

  const kb = $('kick'), aimEl = $('aim'), aimKnob = aimEl.firstElementChild;
  function kickDown() {
    if (state !== 'ready' && state !== 'play') return;
    if (sim.role === 'decoy') { if (state === 'play') inp.done = true; return; }
    kickoff(); inp.charging = true;
  }
  function kickUp(cancel) {
    if (inp.charging) { inp.charging = false; if (cancel !== true) inp.release = true; }
    aimP = null; aimEl.style.display = 'none'; kb.classList.remove('down');
  }
  kb.addEventListener('pointerdown', e => {
    try { kb.setPointerCapture(e.pointerId); } catch (_) {}
    inp.aim = false; kickDown(); kb.classList.add('down');
    if (inp.charging) { aimP = { id: e.pointerId, ox: e.clientX, oy: e.clientY }; aimEl.style.display = 'block'; aimEl.style.left = aimP.ox + 'px'; aimEl.style.top = aimP.oy + 'px'; aimKnob.style.transform = ''; }
    e.preventDefault();
  });
  kb.addEventListener('pointermove', e => {
    if (!aimP || e.pointerId !== aimP.id) return;
    const dx = e.clientX - aimP.ox, dy = e.clientY - aimP.oy, m = Math.hypot(dx, dy), DZ = 12, R = 62;
    if (m > DZ) { inp.aim = true; inp.ax = dx / m; inp.ay = dy / m; inp.power = Math.min(1, (m - DZ) / (R - DZ)); }
    else if (inp.aim) inp.power = 0;
    const c = m > R ? R / m : 1; aimKnob.style.transform = 'translate(' + dx * c + 'px,' + dy * c + 'px)';
  });
  kb.addEventListener('pointerup', kickUp); kb.addEventListener('pointercancel', kickUp);
  kb.addEventListener('contextmenu', e => e.preventDefault());
  kb.addEventListener('click', e => e.preventDefault());

  const playing = () => state === 'play' || state === 'ready' || state === 'failed' || state === 'failhold';
  $('bRetry').onclick = () => { if (prac >= 0) { SFX.tap(); save.practised = true; persist(); prac = -1; pracNote = null; return startLevel(0); } if (playing()) { if (state === 'play') fails++; SFX.tap(); beginRound(); } };
  $('bPrev').onclick = () => { if (playing()) { SFX.tap(); redoPrev(); } };
  $('bMenu').onclick = () => { SFX.tap(); showPause(); };

  const KM = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
  const inMatch = () => (state === 'ready' || state === 'play') && !ovOpen();
  window.addEventListener('keydown', e => {
    if (KM[e.code]) { if (!inMatch()) return; keys[KM[e.code]] = true; if (state === 'ready') kickoff(); e.preventDefault(); }
    else if (e.code === 'Space') { if (!inMatch()) return; if (!e.repeat) { inp.aim = false; kickDown(); } e.preventDefault(); }
    else if (e.code === 'KeyR') { if (playing() && (!ovOpen() || state === 'failed')) $('bRetry').click(); }
    else if (e.code === 'Escape' || e.code === 'KeyP') {
      if (ovOpen() && state === 'failed' && $('ov').dataset.pause !== '1') showPause();
      else if (ovOpen()) { const c = $('ct') || $('x') || $('n') || $('bk'); if (c) c.click(); }
      else if ($('play').classList.contains('on')) showPause();
    }
    else if (e.code === 'Enter') {
      const f = document.activeElement; if (f && /^(BUTTON|A)$/.test(f.tagName)) return;   // the focused control handles it
      const p = document.querySelector('.ov.on .btn.p') || (!ovOpen() && $('cta')); if (p) { p.click(); e.preventDefault(); }
    }
  });
  window.addEventListener('keyup', e => { if (KM[e.code]) keys[KM[e.code]] = false; else if (e.code === 'Space') kickUp(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stat.hidden(); else stat.shown(); });
  window.addEventListener('pagehide', () => stat.hidden());
  document.addEventListener('visibilitychange', () => { if (document.hidden) { Object.keys(keys).forEach(k => keys[k] = false); if (state === 'play' && !auto) freeze(); SFX.crowd(0, 0.05); } });

  function readMove() {
    if (joy) { inp.mx = joy.mx || 0; inp.my = joy.my || 0; }
    else { inp.mx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0); inp.my = (keys.d ? 1 : 0) - (keys.u ? 1 : 0); }
  }

  /* ---------- loop ---------- */
  function sounds(S) {
    const b = S.ball;
    if (b.kickTick !== lastKick && b.kickTick >= 0) {
      lastKick = b.kickTick;
      const sp = Math.hypot(b.vx, b.vy);
      if (b.shot) SFX.strike(Math.min(1, Math.max(0, (sp / (C.shotPace || 1) - C.shotMin) / (C.shotMax - C.shotMin))));
      else SFX.kick(Math.min(1, sp / C.kickMax));
    }
    if (b.recvTick !== lastRecv && b.recvTick >= 0) { lastRecv = b.recvTick; SFX.touch(); }
  }
  /* The decisive shot: the last player has hit it and it is travelling at goal. The crowd rises for it. It plays at
     full speed: it used to be shown at 0.38 speed, which made a shot from 15-21 m crawl in over about two seconds
     (docs/foundation/16-shot-pace.md). */
  function decisive(S) {
    const b = S.ball;
    if (!S || S.status !== 'play' || b.owner >= 0 || S.chainPos !== S.chain.length - 1 || b.vy > -5 || b.y > 20) return false;
    const xc = b.x + b.vx * (b.y / -b.vy);
    return Math.abs(xc - P.cx) < P.goalHalf + 3;
  }
  let last = 0, acc = 0, aimLeft = 1.2;
  /* Shooting help on the practice drills and the first four fixtures: a shot aimed at the goal is eased towards the open
     corner on the side the player chose. Full strength at first, gone by fixture 5. Applies to live input only. */
  const HELP = [1, 1, 0.6, 0.3];
  function assist(q) {
    const k = CFG.assist === false ? 0 : prac >= 0 ? 1 : dly ? 0 : HELP[li] || 0;
    if (!k || !q.aim || !q.charging || !sim.isLast || q.ay >= -0.05) return q;
    const me = sim.att[sim.live], xg = me.x + q.ax * (me.y / -q.ay);
    if (Math.abs(xg - 25) > 5.5) return q;
    const g = sim.gk.x, corner = Math.abs(xg - g) < 0.6 ? (g <= 25 ? 27.9 : 22.1) : xg > g ? 27.9 : 22.1;
    const tx = xg + (corner - xg) * 0.75 * k - me.x, ty = -me.y, d = Math.hypot(tx, ty);
    return Object.assign({}, q, { ax: tx / d, ay: ty / d });
  }
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000 || 0); last = now;
    const S0 = state === 'play' ? sim : state === 'goal' || state === 'replay' ? rsim : null, slow = !!S0 && decisive(S0);
    const aimSlow = !!save.slow && CFG.slow !== false && prac < 0 && state === 'play' && inp.charging && aimLeft > 0; if (aimSlow) aimLeft -= dt;
    tempo += ((aimSlow ? 0.35 : 1) - tempo) * Math.min(1, dt * 14);
    if (slow !== swell) { swell = slow; if (state === 'play') SFX.crowd(slow ? 0.075 : 0.016, slow ? 0.18 : 0.5); }
    // a hold freezes the simulation and the clock together: nothing is stepped, and nothing is owed afterwards
    if (now < holdUntil) acc = 0; else acc += dt * tempo;
    let n = 0;
    while (acc >= TICK && n < 6) {
      acc -= TICK; n++;
      if (state === 'play') {
        readMove();
        if (auto) { const q = auto(sim); inp.mx = q.mx || 0; inp.my = q.my || 0; inp.charging = !!q.charging; inp.release = !!q.release; inp.done = !!q.done; inp.aim = !!q.aim; inp.ax = q.ax || 0; inp.ay = q.ay || 0; inp.power = q.power || 0; }
        FB.step(sim, auto ? inp : assist(inp)); inp.release = false; inp.done = false; sounds(sim);
        if (sim.status === 'fail') { onFail(now); break; }
        if (sim.status === 'won') { onWon(); break; }
        if (sim.status === 'goal') { onGoal(now); break; }
        if (sim.ball.kickTick === sim.tick - 1 && !reduced()) { holdUntil = now + (sim.ball.shot ? CUE.shot.hold : CUE.pass.hold); acc = 0; break; }
      } else if ((state === 'goal' || state === 'replay') && rsim) {
        if (rsim.status === 'play') FB.step(rsim, {});
        else if (state === 'replay') { if (++rhold > 50) { showResult(); break; } }
        else if (++rhold > 80) { rsim = mkSim(-1); rhold = 0; }
      }
    }
    if (acc > 0.2) acc = 0;
    if (state === 'failhold' && now >= failShowAt) showFail();
    if (state === 'goalhold' && now - goalAt > 1100) afterGoal();
    const S = (state === 'goal' || state === 'replay') && rsim ? rsim : sim;
    if (S && state !== 'home') {
      Render.draw(S, { now, inp, state });
      const C0 = state === 'goal' || state === 'goalhold' || state === 'replay' ? sim : S;   // the replay shows the finished move's clock, frozen
      // drills: the clock counts up and never runs out (it fills over ten seconds, then stays full)
      $('fill').style.transform = 'scaleX(' + Math.min(1, C0.tick / (prac >= 0 ? 600 : C0.limit)).toFixed(4) + ')';
      const frozen = C0 !== S || state === 'goalhold';
      const left = (prac >= 0 || frozen ? C0.tick / 60 : Math.max(0, (C0.limit - C0.tick) / 60)).toFixed(1);
      if (left !== secsTxt) { secsTxt = left; $('secs').textContent = left; $('clock').classList.toggle('late', +left < 2 && state === 'play' && prac < 0); }
      const a = sim && sim.live >= 0 ? sim.att[sim.live] : null;
      kb.style.setProperty('--chg', (a ? a.charge * 360 : 0) + 'deg');
      coach(coachState());
    }
    requestAnimationFrame(frame);
  }

  /* ---------- boot ---------- */
  $('bMenu').innerHTML = IC.pause; $('bPrev').innerHTML = IC.prev; $('bRetry').innerHTML = IC.retry;
  $('pad').innerHTML = IC.stick + '<span>Drag anywhere<br>to run</span>';
  applyPrefs();
  $('rotate').innerHTML = '<div>' + IC.phone + '<b>Turn your phone upright</b><p>This one is played in portrait.</p></div>';
  if (document.title !== GAME_NAME) document.title = GAME_NAME;
  // Ask for every face straight away (the canvas needs Barlow Condensed 700 before it first draws). No <link rel=preload>:
  // that is refused on file:// origins, which is how an app shell may serve these files.
  if (document.fonts && document.fonts.load) {
    try { ['400 12px Anton', '500 12px Barlow', '600 12px Barlow', '600 12px "Barlow Condensed"', '700 12px "Barlow Condensed"'].forEach(f => document.fonts.load(f)); document.fonts.ready.then(resize); } catch (e) {}
  }

  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#rtb')) { SFX.tap(); showRatings(); } });
  window.__omt = {
    setAuto(f) { autoFactory = f; }, info: () => ({ state, li, round, fails, levels: LEVELS.length, tick: sim ? sim.tick : 0, prac, daily: dly ? dly.n : 0, bonus, limit: sim ? sim.limit : 0 }),
    setToday(d) { todayOverride = d; }, peek: () => sim && sim.live >= 0 ? { own: sim.ball.owner === sim.live, x: sim.att[sim.live].x, y: sim.att[sim.live].y, bx: sim.ball.x, by: sim.ball.y } : null, daily: n => startDaily(dateOfNo(n)), dailyNo, shareText: () => result ? shareText(result) : '', statsQueue: () => (save.statsQ || []).slice(), start: startLevel, unlockAll() { save.all = true; },
    home: showHome, name: GAME_NAME,
    /* Android back button (called by the app shell). Returns false when there is nothing left to go back to. */
    back() {
      const open = $('ov').classList.contains('on');
      if (open && $('ov').dataset.pause === '1' && $('ct')) { $('ct').click(); return true; }
      if (state === 'failhold') { showFail(); showPause(); return true; }
      if (state === 'replay') { showResult(); return true; }
      if (state === 'failed') { if (prac >= 0) { beginRound(); return true; } showPause(); return true; }
      if (state === 'play' || state === 'ready') { if (open) hideOv(); else showPause(); return true; }
      // a page or card with its own way back (Done, Keep it, the back arrow): use it, so How to play returns to Options
      const c = open && ($('x') || $('n') || $('bk')); if (c) { c.click(); return true; }
      if (state === 'home' || state === 'cover') { if (open) { hideOv(); return true; } return false; }
      showHome(); return true;
    }
  };
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(() => {});
  stat.boot();
  /* links: ?daily=N opens that day's move straight away (a shared result: no cover, no practice, no season gate);
     ?fixture=N opens that fixture's brief if it is open on this device */
  const Q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return null; } })();
  const qDaily = Q && +Q.get('daily'), qFix = Q && +Q.get('fixture');
  if (qDaily > 0) {
    const date = dateOfNo(qDaily), go = () => { if (dailyOf(date)) { save.cover = true; startDaily(date, true); return true; } return false; };
    if (!go()) { showHome(); fetchMonth(date.slice(0, 7)).then(() => { if (!go()) homeNote('Daily ' + qDaily + ' is not available yet.'); }); }
  } else if (qFix > 0 && LEVELS[qFix - 1]) { if (unlocked(qFix - 1)) startLevel(qFix - 1); else { showHome(); homeNote('Win the earlier fixtures to open No. ' + no(qFix - 1) + '.'); } }
  else showHome();
  refreshDaily().then(changed => { if (changed && state === 'home') dailyTicket(); });
  requestAnimationFrame(frame);
})();
