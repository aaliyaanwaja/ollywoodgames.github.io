/* Screens, input and match flow. The rules live in sim.js; everything on the pitch canvas is drawn by render.js. */
(function () {
  /* ---------- identity: rename the game here and in <title> of index.html ---------- */
  const GAME_NAME = 'One-Man Team';
  const STUDIO = 'Ollywood Games', BUILD = '0.4.0';

  const { TICK, P, C, LEVELS } = FB;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

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
    phone: svg('<rect x="7.5" y="3" width="9" height="18" rx="2"/><path d="M11 18h2"/>'),
    star: '<svg class="st" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.8l2.85 5.9 6.45.9-4.7 4.5 1.15 6.4L12 17.45 6.25 20.5l1.15-6.4-4.7-4.5 6.45-.9z"/></svg>'
  };
  const stars = (n, cls) => '<span class="stars' + (cls ? ' ' + cls : '') + '" role="img" aria-label="' + n + ' of 3 stars">' +
    [0, 1, 2].map(i => '<i class="' + (i < n ? 'on' : 'off') + '" style="--i:' + i + '">' + IC.star + '</i>').join('') + '</span>';

  /* ---------- saved progress ---------- */
  const KEY = (window.OMT_CONFIG && window.OMT_CONFIG.key) || 'omt.v1';
  let save = { done: {}, sound: true, haptics: true, seenHow: false, all: false, cover: false, seenDecoy: false };
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
      save.log.push([prac >= 0 ? 'P' + (prac + 1) : li + 1, round + 1, outcome, sim ? +(sim.tick / 60).toFixed(1) : 0]);
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
  const lid = i => LEVELS[i].name;
  const rec = i => save.done[lid(i)];
  const unlocked = i => save.all || CFG.unlock || i === 0 || !!rec(i - 1);
  const nextLevel = () => { for (let i = 0; i < LEVELS.length; i++) if (!rec(i)) return i; return -1; };
  /* Stars grade the finished move, never the number of takes: one for scoring, a second for beating par (the bot's time
     x 1.5), a third for the gaffer's time (x 1.2). The bot times live in js/levels/pars.js. */
  const parOf = (i, k) => { const b = LEVELS[i] && LEVELS[i].bot; return b ? Math.ceil(b * k * 10) / 10 : 0; };
  const starsFor = (i, t) => { const g = parOf(i, 1.2), p = parOf(i, 1.5); return !p ? 1 : t <= g ? 3 : t <= p ? 2 : 1; };
  // saves from before this rule were graded on retries: regrade them from the stored times
  LEVELS.forEach((_, i) => { const r = save.done[LEVELS[i].name]; if (r && r.time) r.stars = Math.min(starsFor(i, r.time), r.slow ? 2 : 3); });
  const totalStars = () => LEVELS.reduce((a, _, i) => a + (rec(i) ? rec(i).stars : 0), 0);
  SFX.set(save.sound, save.haptics);

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
  function inkOn(hex) {   // ink or chalk, whichever reads on this kit colour
    let h = hex.slice(1); if (h.length < 6) h = h.split('').map(c => c + c).join('');
    const ch = n => { const v = parseInt(h.substr(n, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4) > 0.2 ? '#14213D' : '#FBF8F0';
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
  const titleHtml = () => GAME_NAME.split(' ').map(w => '<span class="w">' + esc(w) + '</span>').join(' ');
  const ord = n => ['1st', '2nd', '3rd'][n] || (n + 1) + 'th';

  /* ---------- state ---------- */
  let li = 0, round = 0, recs = [], sim = null, rsim = null, rhold = 0;
  let state = 'home', fails = 0, goalAt = 0, seq = 0;
  const inp = { mx: 0, my: 0, charging: false, release: false, done: false, aim: false, ax: 0, ay: -1, power: 0 };
  let joy = null, aimP = null; const keys = {};
  let autoFactory = null, auto = null; // test hook: scripted inputs
  let lastKick = -999, lastRecv = -999, tempo = 1, coachKey = null, secsTxt = '', swell = false;

  function resize() { Render.resize($('stage')); }
  window.addEventListener('resize', resize);

  /* Special builds set window.OMT_CONFIG before this script: { rate, assist, practice, slow, unlock, key, title }.
     A rating set asks three questions after every fixture and keeps the answers on the device for copying out. */
  const CFG = window.OMT_CONFIG || {};
  const PRACTICE = CFG.practice === false ? [] : window.OMT_PRACTICE || [];
  let prac = -1, pracLv = null, pracRep = 0;   // practice drill being played, or -1
  const L = () => prac >= 0 ? pracLv : LEVELS[li];
  const liveIdx = () => L().order[round];
  function screen(id) {
    seq++;
    $('home').classList.toggle('on', id === 'home'); $('play').classList.toggle('on', id === 'play');
    if (id === 'play') resize(); else SFX.crowd(0, 0.2);
  }
  const later = (fn, ms) => { const s = seq; setTimeout(() => { if (s === seq) fn(); }, ms); };

  /* ---------- overlays: 'page' (a full programme page), 'dlg' (a small card), 'sheet' (bottom, pitch stays visible) ---------- */
  function showOv(kind, html, handlers) {
    const card = $('card');
    card.innerHTML = html; card.scrollTop = 0;
    $('ov').className = 'ov on k-' + kind;
    const pg = card.querySelector('.pg'); if (pg) pg.scrollTop = 0;
    Object.keys(handlers || {}).forEach(id => { const el = $(id); if (el) el.onclick = () => { SFX.tap(); handlers[id](); }; });
    try { card.focus({ preventScroll: true }); } catch (e) {}
  }
  function hideOv() { $('ov').className = 'ov'; $('card').innerHTML = ''; }
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
    $('cta').onclick = () => { SFX.tap(); save.cover = true; persist(); if (save.practised || !PRACTICE.length) startLevel(0); else startPractice(0); };
    screen('home');
  }

  /* ---------- home: the season path ---------- */
  let taps = 0, noteT = 0;
  function homeNote(t) { const el = $('note'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(noteT); noteT = setTimeout(() => el.classList.remove('on'), 2200); }
  function ticketHtml(i, nx, side) {
    const lv = LEVELS[i], r = rec(i), open = unlocked(i), st = story(lv), isNext = i === nx;
    const sub = st && st.opp ? 'v ' + esc(st.opp) : '';
    const end = !open ? IC.lock : r ? stars(r.stars) : '<span class="go">' + IC.next + '</span>';
    const label = 'Fixture ' + (i + 1) + ', ' + lv.name + (open ? (r ? ', ' + r.stars + ' of 3 stars' : ', not played yet') : ', locked');
    return '<button class="tk ' + side + (open ? '' : ' lock') + (r ? ' done' : '') + (isNext ? ' next' : '') + '" data-l="' + i + '" aria-label="' + esc(label) + '">' +
      (isNext ? '<span class="flag">Next fixture</span>' : '') +
      '<span class="tk-stub"><small>No.</small><b>' + no(i) + '</b></span>' +
      '<span class="tk-body"><b>' + esc(lv.name) + '</b>' + (sub ? '<em>' + sub + '</em>' : '') + '</span>' +
      '<span class="tk-end">' + end + '</span></button>';
  }
  const link = (from, done) => '<svg class="lk' + (done ? ' done' : '') + '" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><path vector-effect="non-scaling-stroke" d="' +
    (from === 'L' ? 'M34 0C34 16 66 12 66 28' : 'M66 0C66 16 34 12 34 28') + '"/></svg>';
  function showHome() {
    if (!save.cover && !save.all && !CFG.unlock && nextLevel() === 0) return showCover();
    state = 'home'; hideOv(); sim = null; rsim = null;
    const nx = nextLevel(), total = totalStars(), won = LEVELS.filter((_, i) => rec(i)).length;
    let chase = -1; if (nx < 0) chase = LEVELS.findIndex((_, i) => rec(i).stars < 3);
    const target = nx >= 0 ? nx : chase >= 0 ? chase : 0;
    const cta = nx < 0
      ? (chase >= 0 ? '<b>Chase the stars</b><small>No. ' + no(chase) + ' · ' + esc(LEVELS[chase].name) + '</small>' : '<b>Play it again</b><small>Every star collected</small>')
      : '<b>' + (won ? 'Next fixture' : 'Kick off') + '</b><small>No. ' + no(nx) + ' · ' + esc(LEVELS[nx].name) + '</small>';
    let path = '', k = 0;
    chapters().forEach(ch => {
      let got = 0; for (let i = ch.from; i <= ch.to; i++) got += rec(i) ? rec(i).stars : 0;
      const max = (ch.to - ch.from + 1) * 3, open = unlocked(ch.from);
      path += '<div class="season' + (open ? '' : ' shut') + '"><span class="lbl">Season ' + ch.n + '</span><h2>' + esc(ch.name) + '</h2><span class="count">' + IC.star + got + '/' + max + '</span></div>';
      for (let i = ch.from; i <= ch.to; i++, k++) {
        const side = k % 2 ? 'R' : 'L';
        path += ticketHtml(i, nx, side);
        if (i < ch.to) path += link(side, !!rec(i));
      }
    });
    $('home').className = 'screen';
    $('home').innerHTML =
      '<div class="scroll" id="scroll"><header class="mast"><div class="strip"><span>Official matchday programme</span><span>Price: nothing</span></div>' +
      '<div class="mast-main"><h1 class="title" id="brand">' + esc(GAME_NAME) + '</h1><button class="ib" id="bOpt" aria-label="Options">' + IC.gear + '</button></div>' +
      '<div class="tally"><span>' + IC.star + '<b>' + total + '</b> of ' + LEVELS.length * 3 + ' stars</span></div></header>' +
      '<div class="path">' + path + '</div>' +
      (CFG.rate ? '<button class="btn" id="rtb" style="width:100%;margin-top:14px">Your ratings: copy and send</button>' : '') +
      '<p class="foot">' + (nx < 0 ? 'Every fixture won. The stars are still there to be had. ' : '') + 'Progress is kept on this device only. No account, no tracking.' + (save.all ? ' All fixtures unlocked for testing.' : '') + '</p></div>' +
      '<div class="dock"><div id="note" role="status"></div><button class="cta" id="cta">' + cta + IC.next + '</button></div>';
    $('cta').onclick = () => { SFX.tap(); startLevel(target); };
    document.querySelectorAll('.tk').forEach(b => b.onclick = () => {
      const i = +b.dataset.l;
      if (unlocked(i)) { SFX.tap(); startLevel(i); return; }
      SFX.deny(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      let need = i - 1; while (need > 0 && !unlocked(need)) need--;
      homeNote('Locked. Win No. ' + no(need) + ', ' + LEVELS[need].name + ', first.');
    });
    $('bOpt').onclick = () => { SFX.tap(); showOptions(); };
    $('brand').onclick = () => { if (++taps >= 7) { taps = 0; save.all = !save.all; persist(); showHome(); homeNote(save.all ? 'All fixtures unlocked for testing.' : 'Fixtures locked again.'); } };
    screen('home');
    const tgt = document.querySelector('.tk.next') || (chase >= 0 && document.querySelector('.tk[data-l="' + chase + '"]'));
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
    showOv('page', '<div class="pg"><div class="strip"><span>Laws of the game</span><span>Abridged</span></div><h1>How to play</h1><ol class="how">' +
      HOW_STEPS.map((s, i) => '<li><span class="num">' + (i + 1) + '</span><div><b>' + s[0] + '</b><p>' + s[1] + '</p></div></li>').join('') +
      '</ol><p class="fine">With a keyboard: arrows or WASD to run, hold Space to charge a kick in the direction you face, R to retry, Esc to pause.</p></div>' +
      '<div class="pg-foot"><button class="btn p" id="x">Understood</button></div>', { x: back || hideOv });
  }
  const toggle = (id, icon, label, on) => '<button class="rowbtn" id="' + id + '" role="switch" aria-checked="' + (on ? 'true' : 'false') + '">' + icon + '<span>' + label + '</span><i class="sw"><b>' + (on ? 'On' : 'Off') + '</b></i></button>';
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
    showOv('page', '<div class="pg"><div class="strip"><span>Club office</span><span>Open all hours</span></div><h1>Options</h1><div class="rows">' +
      toggle('oS', IC.sound, 'Sound', save.sound) + toggle('oH', IC.buzz, 'Vibration', save.haptics) +
      '<button class="rowbtn" id="oHow">' + IC.book + '<span>How to play</span>' + IC.next + '</button>' +
      '<button class="rowbtn" id="oPrac">' + IC.retry + '<span>Practice drills</span>' + IC.next + '</button>' +
      toggle('oSlow', IC.clock || IC.book, 'Slow aim', !!save.slow) +
      (save.all ? '<button class="rowbtn" id="oLog">' + IC.list + '<span>Tester: play log</span>' + IC.next + '</button>' : '') +
      '<a class="rowbtn" id="oPriv" href="' + (NATIVE ? 'https://ollywoodgames.github.io/privacy.html' : '../privacy.html') + '">' + IC.shield + '<span>Privacy policy</span>' + IC.next + '</a>' +
      '<button class="rowbtn danger" id="oReset">' + IC.bin + '<span>Reset progress</span>' + IC.next + '</button></div>' +
      '<p class="fine"><b>Slow aim</b> slows time for a moment while you hold the aim button. It makes every move easier, so the third star needs it switched off.</p>' +
      '<p class="fine">Progress is kept on this device only. No account, no adverts, no tracking.</p>' +
      '<p class="fine colophon">' + esc(GAME_NAME) + ' · build ' + BUILD + '<br>Printed and published by ' + esc(STUDIO) + '</p></div>' +
      '<div class="pg-foot"><button class="btn p" id="x">Done</button></div>',
      { x: () => { hideOv(); }, oHow: () => showHow(showOptions), oReset: confirmReset, oPrac: () => startPractice(0), oLog: showLog });
    if ($('oSlow')) $('oSlow').onclick = () => { save.slow = !save.slow; persist(); SFX.tap(); showOptions(); };
    $('oS').onclick = () => { flipSound(); showOptions(); };
    $('oH').onclick = () => { flipBuzz(); SFX.tap(); showOptions(); };
  }
  function confirmReset() {
    const n = totalStars();
    showOv('dlg', '<div class="lbl">Reset progress</div><h2>Tear it all up?</h2><p>This removes ' + (n ? (n === 1 ? 'your one star' : 'all ' + n + ' of your stars') : 'your progress') + ' and locks every fixture again. It cannot be undone.</p>' +
      '<div class="btns"><button class="btn" id="n">Keep it</button><button class="btn warn" id="y">Reset</button></div>',
      { n: showOptions, y: () => { save.done = {}; save.all = false; save.seenDecoy = false; persist(); showHome(); homeNote('Progress reset.'); } });
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
    prac = n; pracRep = repN || 0; pracLv = JSON.parse(JSON.stringify(PRACTICE[n]));
    if (pracLv.reps) { pracLv.att[0].x = pracLv.reps[pracRep][0]; pracLv.att[0].y = pracLv.reps[pracRep][1]; }
    round = pracLv.feed ? 1 : 0; recs = pracLv.att.map(() => null); if (pracLv.feed) recs[0] = feedRec(pracLv);
    fails = 0; rsim = null; sim = FB.makeSim(pracLv, recs, liveIdx());
    stampOff(); $('ready').className = ''; screen('play'); hud();
    if (pracRep > 0) return beginRound();
    state = 'brief';
    showOv('page', '<div class="pg brief lean"><div class="strip"><span>Practice</span><span>' + (n + 1) + ' of ' + PRACTICE.length + '</span></div>' +
      '<h1>' + esc(pracLv.name) + '</h1><p class="lede">' + esc(pracLv.brief) + '</p><p class="lede soft">Nothing to lose here. Miss, and you simply go again.</p></div>' +
      '<div class="pg-foot"><button class="btn" id="sk">Skip practice</button><button class="btn p" id="go">Start</button></div>',
      { go: beginRound, sk: () => { save.practised = true; persist(); prac = -1; startLevel(0); } });
  }
  function pracMiss(msg) { state = 'failed'; SFX.thud(); toast(msg); const q = seq; later(() => { if (seq === q && prac >= 0) beginRound(); }, 900); }
  function pracDone() {
    if (pracLv.reps && pracRep + 1 < pracLv.reps.length) return startPractice(prac, pracRep + 1);
    if (!pracLv.last) return startPractice(prac + 1);
    save.practised = true; persist(); state = 'goal'; rsim = FB.makeSim(L(), recs, -1); rhold = 0; stampOff();
    showOv('sheet', '<div class="sh-top"><span class="lbl soft">Practice complete</span></div><h2>That is the whole game</h2>' +
      '<p>Every move is built like that: one player at a time, each one fitting around the ones you have already played.</p>' +
      '<div class="btns"><button class="btn" id="ag">Practise again</button><button class="btn p" id="nx"><span>First fixture</span>' + IC.next + '</button></div>',
      { ag: () => startPractice(0), nx: () => { prac = -1; startLevel(0); } });
  }
  function startLevel(i) {
    if (!LEVELS[i]) return;
    prac = -1; li = i; round = 0; recs = L().att.map(() => null); fails = 0; rsim = null; sim = FB.makeSim(L(), recs, liveIdx());
    stampOff(); $('ready').className = ''; screen('play'); hud(); showBrief();
  }
  function beginRound() {
    seq++;
    sim = FB.makeSim(L(), recs, liveIdx()); rsim = null; state = 'ready'; lastKick = -999; lastRecv = -999; tempo = 1; coachKey = null; aimLeft = 1.5;
    inp.charging = false; inp.release = false; inp.done = false; inp.aim = false; aimP = null; joy = null;
    $('aim').style.display = 'none'; $('joy').style.display = 'none'; $('kick').classList.remove('down');
    hideOv(); stampOff(); hud();
    auto = autoFactory ? autoFactory(prac >= 0 ? 'p' + prac : li, round) : null; if (auto) kickoff();
  }
  function kickoff() { if (state === 'ready') { state = 'play'; SFX.unlock(); SFX.crowd(0.016, 0.6); } }
  function freeze() { if (state === 'play') { state = 'ready'; joy = null; $('joy').style.display = 'none'; kickUp(true); SFX.crowd(0, 0.2); } }

  function hud() {
    const lv = L(), a = lv.att[liveIdx()], k = kit(lv), decoy = a.role === 'decoy';
    $('who').innerHTML = '<div class="who-in">' + base(a.num, k.us, 'live') + '<span class="who-t"><small>Player ' + (round + 1) + ' of ' + lv.order.length + '</small><b>' + esc(a.name) + '</b></span></div>';
    fitTip(shortTip(a));
    $('ctl').classList.toggle('quiet', prac < 0 && !(li < 2 && !rec(li)));
    $('play').classList.toggle('prac', prac >= 0);
    $('bPrev').disabled = round === 0; $('bRetry').disabled = false;
    const kb = $('kick'); kb.textContent = decoy ? 'DONE' : (sim && sim.isLast ? 'SHOOT' : 'PASS'); kb.classList.toggle('decoy', decoy);
    $('klabel').innerHTML = decoy ? 'Press when<br>your marker<br>has moved' : 'Press<br>drag to aim<br>release';
    const sc = scoreHtml(lv, false); $('score').innerHTML = sc; $('score').className = sc ? 'on' : '';
    $('bar').style.setProperty('--secs', lv.time);
    let m = '';
    recs.forEach((r, i) => { if (r && r.kick) m += '<i style="left:' + (100 * r.kick.tick / (lv.time * 60)).toFixed(2) + '%" title="No. ' + lv.att[i].num + ' plays the pass"></i>'; });
    $('marks').innerHTML = m; secsTxt = '';
  }
  function fitTip(t) {   // never clip mid-sentence: drop trailing sentences until it fits its two lines
    const el = $('tip'); let parts = t.match(/[^.!?]+[.!?]*\s*/g) || [t];
    el.textContent = t;
    while (parts.length > 1 && el.scrollHeight > el.clientHeight + 2) { parts.pop(); el.textContent = parts.join('').trim(); }
  }
  function hudReplay() {
    $('who').innerHTML = '<div class="who-in"><span class="base live rp">' + IC.play + '</span><span class="who-t"><small>Action replay</small><b>Full move</b></span></div>';
    $('tip').textContent = 'Every part you recorded, played back together.';
    $('bPrev').disabled = true; $('bRetry').disabled = true;
  }
  let toastT = 0;
  function toast(t) { const el = $('toast'); el.textContent = t; el.className = 'on'; clearTimeout(toastT); toastT = setTimeout(() => el.className = '', 1300); }
  function stampOn(t) { const el = $('stamp'); el.innerHTML = '<b>' + t + '</b>'; el.className = ''; void el.offsetWidth; el.className = 'on'; }
  function stampOff() { $('stamp').className = ''; }

  function showBrief() {
    state = 'brief';
    const lv = L(), k = kit(lv), st = story(lv), ch = chapterOf(li), sc = scoreHtml(lv, false);
    const order = lv.order.map((ai, n) => {
      const a = lv.att[ai];
      return (n ? '<li class="arr" aria-hidden="true">' + IC.next + '</li>' : '') + '<li>' + base(a.num, k.us) + '<b>' + esc(a.name) + '</b>' + (a.role === 'decoy' ? '<small>no ball</small>' : '') + '</li>';
    }).join('');
    const fixture = st && st.opp
      ? '<div class="fx slim"><b><i>v</i> ' + esc(st.opp) + '</b>' + (sc ? '<span class="board sm">' + sc + '</span>' : '') + '</div>'
      : '';
    showOv('page',
      '<div class="pg brief lean"><div class="strip"><span>' + esc(st && st.comp ? [st.comp, st.match].filter(Boolean).join(' · ') : ch.name) + '</span><span>No. ' + no(li) + '</span></div>' + fixture +
      '<h1>' + esc(lv.name) + '</h1><p class="lede">' + esc(lv.brief) + '</p>' +
      '<div class="lbl soft ord-h">You play them in this order</div><ol class="order">' + order + '</ol></div>' +
      '<div class="pg-foot"><button class="btn sq" id="bk" aria-label="Back to fixtures">' + IC.back + '</button><button class="btn p" id="go">Kick off</button></div>',
      { go: () => { save.seenHow = true; persist(); SFX.whistle(); beginRound(); }, bk: showHome });
  }

  /* what happened, and what to try */
  const FAIL = {
    tackled: ['Tackled', 'A defender got a foot on the ball.', 'Release it earlier, or carry it away from him first.', 'thud'],
    intercepted: ['Intercepted', 'The pass ran too close to a defender.', 'Change the angle, or hit it harder so it is past him sooner.', 'thud'],
    smothered: ['Keeper smothers it', 'You carried the ball into the goalkeeper.', 'Shoot earlier, from further out.', 'thud'],
    saved: ['Saved', 'The keeper got across to it.', 'Get closer, or aim for the corner he has left open.', 'ooh'],
    keeper: ['Straight to the keeper', 'That pass ran through to the goalkeeper.', 'Take some weight off it, or play it wider.', 'ooh'],
    wide: ['Off target', 'The ball ran out past the post.', 'Aim inside the posts. A shorter drag is easier to place.', 'ooh'],
    out: ['Out of play', 'The ball left the pitch.', 'A shorter drag takes the weight off the pass.', 'whistle'],
    early: ['Wrong man scored', 'Only the last name on the team sheet may finish.', 'Play the pass instead.', 'whistle'],
    offside: ['Offside', 'The receiver was beyond the last defender when the pass was played.', 'Hold the run until the ball is hit, or play the pass sooner.', 'whistle'],
    bump: ['Collision', 'You ran into a team-mate. Awkwardly, he is also you.', 'Take a different line from the run you recorded.', 'thud'],
    time: ['Out of time', 'The clock ran out before the move finished.', 'Go sooner and waste fewer steps.', 'whistle']
  };
  const MISS = { saved: 'Saved. Aim further from the keeper', smothered: 'Too close. Shoot a little earlier', wide: 'Wide. Aim inside the posts', out: 'Out of play. Go again', keeper: 'Too hard. Drag a shorter distance', time: 'Go again', early: 'Go again' };
  let offerKey = '', failAgain = false;
  function showFail() {
    if (!failAgain) logPlay(sim.reason);
    if (prac >= 0) return pracMiss(MISS[sim.reason] || 'Go again');
    state = 'failed'; fails++; SFX.crowd(0, 0.15);
    const lv = L(), f = FAIL[sim.reason] || ['Lost it', 'The move broke down.', 'Have another go.', 'thud'], live = liveIdx(), a = lv.att[live];
    SFX[f[3]]();
    let what = f[1], tryIt = f[2];
    if (sim.failWho >= 0 && sim.failWho !== live && sim.reason !== 'bump' && recs[sim.failWho]) {
      what = 'It happened to the ' + lv.att[sim.failWho].num + ', a part you already recorded. Your new run moved the defence.';
      tryIt = 'Change this run, or go back and redo the earlier player.';
      if (li < 4 && !rec(li) && round === lv.order.length - 1) { what = 'You went early, so the defenders dropped back with you and cut out the pass.'; tryIt = 'Hold your run until the pass is hit, then go.'; }
    } else if (sim.reason === 'time' && round > 0) tryIt = 'If the earlier pass cannot be reached in time, redo the previous player.';
    const prevA = round > 0 ? lv.att[lv.order[round - 1]] : null;
    const oKey = li + ':' + seq, offer = CFG.slow !== false && !save.slow && fails === 8 && (offerKey === oKey || (save.slowAsk || 0) < 3);
    if (offer && offerKey !== oKey) { offerKey = oKey; save.slowAsk = (save.slowAsk || 0) + 1; persist(); }
    showOv('sheet', '<div class="sh-top"><span class="tab">' + IC.whistle + (sim.tick / 60).toFixed(1) + 's</span></div>' +
      '<h2>' + f[0] + '</h2>' + (what !== f[1] ? '<p>' + esc(what) + '</p>' : '') + '<p class="try"><b>Try</b> ' + esc(tryIt) + '</p>' +
      (offer ? '<div class="offer"><p><b>Finding this one tough?</b> Slow aim slows time for a moment while you aim. You can switch it off in Options.</p><button class="btn" id="sl">Turn on slow aim</button></div>' : '') +
      '<div class="btns">' + (CFG.rate && fails >= 3 ? '<button class="btn" id="gu">Give up and rate</button>' : '') + (prevA ? '<button class="btn" id="pv">Redo the ' + esc(prevA.num) + '</button>' : '') + '<button class="btn p" id="re">Try again</button></div>',
      { re: beginRound, pv: redoPrev, gu: () => showRate(true, () => { if (li + 1 < LEVELS.length) startLevel(li + 1); else showHome(); }), sl: () => { save.slow = true; persist(); toast('Slow aim on'); beginRound(); } });
  }
  function redoPrev() { if (round === 0) return; recs[liveIdx()] = null; round--; recs[liveIdx()] = null; beginRound(); }
  function onWon() {
    const a = L().att[liveIdx()];
    if (prac >= 0 && pracLv.mark) {             // the pass must come to rest inside the chalk circle
      const k = sim.liveRec.kick, m = pracLv.mark, ex = k.bx + k.vx / FB.C.fric, ey = k.by + k.vy / FB.C.fric, off = Math.hypot(ex - m.x, ey - m.y);
      if (off > m.r) return pracMiss(Math.abs(ex - m.x) > m.r ? 'Off line. Aim at the circle' : ey > m.y ? 'Short. Drag further' : 'Too long. Drag a shorter distance');
      if (pracLv.passOnly) { SFX.lock(); toast('In the circle'); state = 'failed'; const q = seq; return later(() => { if (seq === q) pracDone(); }, 800); }
    }
    if (a.role === 'decoy' && !save.seenDecoy) { save.seenDecoy = true; persist(); }
    recs[liveIdx()] = FB.finalRec(sim); SFX.lock(); toast('No. ' + a.num + ' recorded');
    round++; beginRound();
  }
  function onGoal(now) {
    recs[liveIdx()] = FB.finalRec(sim); state = 'goalhold'; goalAt = now; seq++; coach('');
    SFX.goal(); stampOn('GOAL!');
    const lv = L(), after = scoreHtml(lv, true);
    if (after && parseScore(story(lv).score)) later(() => { const el = $('score'); el.innerHTML = after; el.className = 'on'; void el.offsetWidth; el.className = 'on tick'; SFX.tick(); }, 650);
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
  function showGoal() {
    if (prac >= 0) { seq++; return pracDone(); }
    const rKey = li + ':' + fails + ':' + sim.tick;
    if (CFG.rate && lastRate !== rKey) { seq++; rsim = FB.makeSim(L(), recs, -1); rhold = 0; stampOff(); return showRate(false, () => { lastRate = rKey; seq--; showGoal(); }); }
    state = 'goal'; seq++; rsim = FB.makeSim(L(), recs, -1); rhold = 0;
    const lv = L(), t = sim.tick / 60, st = Math.min(starsFor(li, t), save.slow ? 2 : 3), old = rec(li), firstWin = !old;
    if (!old || st > old.stars || (st === old.stars && t < old.time)) { save.done[lid(li)] = { stars: st, time: +t.toFixed(2), retries: fails, slow: save.slow ? 1 : 0 }; persist(); }
    logPlay('goal');
    const best = rec(li), ch = chapterOf(li), last = li === LEVELS.length - 1;
    let seasonDone = li === ch.to; for (let i = ch.from; i <= ch.to && seasonDone; i++) if (!rec(i)) seasonDone = false;
    const after = scoreHtml(lv, true), isBest = !firstWin && best.time === +t.toFixed(2) && old && t < old.time;
    const nxt = seasonDone ? '<span>' + (last ? 'Final whistle' : 'Season review') + '</span>' : '<span>Next fixture</span>';
    const nextRow = seasonDone
      ? '<div class="upnext done"><span class="lbl">Season ' + ch.n + '</span><b>' + esc(ch.name) + ' complete</b></div>'
      : last ? '<div class="upnext done"><span class="lbl">Final fixture</span><b>Earlier fixtures still to win</b></div>'
      : '<div class="upnext"><span class="lbl">Up next · No. ' + no(li + 1) + '</span><b>' + esc(LEVELS[li + 1].name) + '</b></div>';
    stampOff(); hudReplay();
    showOv('sheet', '<div class="sh-top"><span class="lbl soft">No. ' + no(li) + ' · ' + esc(lv.name) + '</span>' + (after ? '<span class="board sm">' + after + '</span>' : '') + '</div>' +
      '<div class="res">' + stars(st, 'big stampin') + '<dl class="stats"><div><dd>' + t.toFixed(1) + 's</dd><dt>' + (isBest ? 'New best' : 'Move') + '</dt></div><div><dd>' + (fails + 1) + '</dd><dt>' + (fails === 0 ? 'Take' : 'Takes') + '</dt></div></dl></div>' +
      (st < 3 && parOf(li, 1) ? '<p class="verdict">' + (save.slow && starsFor(li, t) === 3 ? 'Quick enough for three. The third star needs slow aim switched off.' : 'A move of ' + parOf(li, st === 2 ? 1.2 : 1.5).toFixed(1) + 's or quicker earns the ' + (st === 2 ? 'third' : 'second') + ' star. Take as many goes as you like.') + '</p>' : '') + (seasonDone || last ? nextRow : '') +
      '<div class="btns"><button class="btn sq" id="mv" aria-label="Fixtures">' + IC.list + '</button><button class="btn sq" id="ag" aria-label="Play this move again">' + IC.retry + '</button><button class="btn p" id="nx">' + nxt + IC.next + '</button></div>',
      { ag: () => startLevel(li), mv: showHome, nx: () => seasonDone ? showSeason(ch) : last ? showHome() : startLevel(li + 1) });
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

  /* ---------- pause ---------- */
  function showPause() {
    if (state === 'home' || state === 'goalhold' || state === 'season') return;
    freeze();
    const was = state, lv = L(), a = lv.att[liveIdx()], inRound = was === 'ready' || was === 'failed';
    const back = () => { hideOv(); if (was === 'goal') showGoalAgain(); else if (was === 'failed') showFailAgain(); else if (was === 'brief') showBrief(); };
    showOv('dlg', '<div class="lbl">Fixture No. ' + no(li) + ' · ' + esc(lv.name) + '</div><h2>Paused</h2>' +
      (inRound ? '<div class="you">' + base(a.num, kit(lv).us) + '<div><b>' + esc(a.name) + '</b><p>' + esc(a.tip) + '</p></div></div>' : '') +
      '<button class="btn p wide" id="ct">Resume</button>' +
      '<div class="btns"><button class="btn" id="rs">Restart move</button><button class="btn" id="mv">Fixtures</button></div>' +
      '<div class="rows tight">' + toggle('pS', IC.sound, 'Sound', save.sound) + toggle('pH', IC.buzz, 'Vibration', save.haptics) +
      '<button class="rowbtn" id="hw">' + IC.book + '<span>How to play</span>' + IC.next + '</button></div>',
      { mv: showHome, rs: () => prac >= 0 ? startPractice(prac) : startLevel(li), ct: back, hw: () => showHow(showPause) });
    $('pS').onclick = () => { flipSound(); showPause(); };
    $('pH').onclick = () => { flipBuzz(); SFX.tap(); showPause(); };
    $('ov').dataset.pause = '1';
  }
  // re-open a sheet after pausing without counting the failure or the win twice
  function showFailAgain() { fails--; failAgain = true; const s = SFX.set; SFX.set(false, false); showFail(); s(save.sound, save.haptics); failAgain = false; }
  function showGoalAgain() { const keep = rsim, s = SFX.set; SFX.set(false, false); showGoal(); s(save.sound, save.haptics); rsim = keep; }

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
  const tutorial = () => prac < 0 && li === 0 && !rec(0) && L().order.length === 2;
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
    const t = prac >= 0 ? (pracLv.coach || [])[round] || {} : TUT[li] && !rec(li) ? TUT[li][round] : null; if (!t) return null;
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
    if (state !== 'ready' && state !== 'play') return '';
    const a = L().att[liveIdx()], me = sim.att[sim.live], b = sim.ball;
    if (state === 'ready' && sim.tick > 0) return 'paused';
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
    const el = $('ready'), a = L().att[liveIdx()]; let html = '', cue = '';
    if (key === 'ready') html = '<span>You are the <b>' + esc(a.num) + '</b>. ' + (a.role === 'decoy' ? 'Drag to run.' : 'Move to start the clock.') + '</span>';
    else if (key === 'paused') html = '<span>Held. Move to carry on.</span>';
    else if (COACH[key]) { html = '<em>Coach</em><span>' + COACH[key][0] + '</span>'; cue = COACH[key][1]; }
    const top = !!(COACH[key] && COACH[key][2] === 'top');
    el.innerHTML = html; el.className = html ? 'on' + (COACH[key] ? ' coach' : '') + (top ? ' top' : '') : '';
    $('stage').classList.toggle('coach-top', top);
    $('tip').classList.toggle('mute', !!COACH[key]);
    $('pad').classList.toggle('cue', cue === 'pad' || key === 'ready'); $('kickwrap').classList.toggle('cue', cue === 'kick');
  }

  /* ---------- input ---------- */
  const play = $('play'), joyEl = $('joy'), knob = joyEl.firstElementChild;
  play.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
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

  const playing = () => state === 'play' || state === 'ready' || state === 'failed';
  $('bRetry').onclick = () => { if (playing()) { if (state === 'play') fails++; SFX.tap(); beginRound(); } };
  $('bPrev').onclick = () => { if (playing()) { SFX.tap(); redoPrev(); } };
  $('bMenu').onclick = () => { SFX.tap(); showPause(); };

  const KM = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
  const inMatch = () => (state === 'ready' || state === 'play') && !ovOpen();
  window.addEventListener('keydown', e => {
    if (KM[e.code]) { if (!inMatch()) return; keys[KM[e.code]] = true; if (state === 'ready') kickoff(); e.preventDefault(); }
    else if (e.code === 'Space') { if (!inMatch()) return; if (!e.repeat) { inp.aim = false; kickDown(); } e.preventDefault(); }
    else if (e.code === 'KeyR') { if (playing() && (!ovOpen() || state === 'failed')) $('bRetry').click(); }
    else if (e.code === 'Escape' || e.code === 'KeyP') {
      if (ovOpen()) { const c = $('ct') || $('x') || $('n') || $('bk'); if (c) c.click(); }
      else if ($('play').classList.contains('on')) showPause();
    }
    else if (e.code === 'Enter') {
      const f = document.activeElement; if (f && /^(BUTTON|A)$/.test(f.tagName)) return;   // the focused control handles it
      const p = document.querySelector('.ov.on .btn.p') || (!ovOpen() && $('cta')); if (p) { p.click(); e.preventDefault(); }
    }
  });
  window.addEventListener('keyup', e => { if (KM[e.code]) keys[KM[e.code]] = false; else if (e.code === 'Space') kickUp(); });
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
    const k = CFG.assist === false ? 0 : prac >= 0 ? 1 : HELP[li] || 0;
    if (!k || !q.aim || !q.charging || !sim.isLast || q.ay >= -0.05) return q;
    const me = sim.att[sim.live], xg = me.x + q.ax * (me.y / -q.ay);
    if (Math.abs(xg - 25) > 5.5) return q;
    const g = sim.gk.x, corner = Math.abs(xg - g) < 0.6 ? (g <= 25 ? 27.9 : 22.1) : xg > g ? 27.9 : 22.1;
    const tx = xg + (corner - xg) * 0.75 * k - me.x, ty = -me.y, d = Math.hypot(tx, ty);
    return Object.assign({}, q, { ax: tx / d, ay: ty / d });
  }
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000 || 0); last = now;
    const S0 = state === 'play' ? sim : state === 'goal' ? rsim : null, slow = !!S0 && decisive(S0);
    const aimSlow = !!save.slow && CFG.slow !== false && prac < 0 && state === 'play' && inp.charging && aimLeft > 0; if (aimSlow) aimLeft -= dt;
    tempo += ((aimSlow ? 0.35 : 1) - tempo) * Math.min(1, dt * 14);
    if (slow !== swell) { swell = slow; if (state === 'play') SFX.crowd(slow ? 0.075 : 0.016, slow ? 0.18 : 0.5); }
    acc += dt * tempo;
    let n = 0;
    while (acc >= TICK && n < 6) {
      acc -= TICK; n++;
      if (state === 'play') {
        readMove();
        if (auto) { const q = auto(sim); inp.mx = q.mx || 0; inp.my = q.my || 0; inp.charging = !!q.charging; inp.release = !!q.release; inp.done = !!q.done; inp.aim = !!q.aim; inp.ax = q.ax || 0; inp.ay = q.ay || 0; inp.power = q.power || 0; }
        FB.step(sim, auto ? inp : assist(inp)); inp.release = false; inp.done = false; sounds(sim);
        if (sim.status === 'fail') { showFail(); break; }
        if (sim.status === 'won') { onWon(); break; }
        if (sim.status === 'goal') { onGoal(now); break; }
      } else if (state === 'goal' && rsim) {
        if (rsim.status === 'play') FB.step(rsim, {});
        else if (++rhold > 80) { rsim = FB.makeSim(L(), recs, -1); rhold = 0; }
      }
    }
    if (acc > 0.2) acc = 0;
    if (state === 'goalhold' && now - goalAt > 1500) showGoal();
    const S = state === 'goal' && rsim ? rsim : sim;
    if (S && state !== 'home') {
      Render.draw(S, { now, inp, state });
      $('fill').style.transform = 'scaleX(' + Math.min(1, S.tick / S.limit).toFixed(4) + ')';
      const left = Math.max(0, (S.limit - S.tick) / 60).toFixed(1);
      if (left !== secsTxt) { secsTxt = left; $('secs').textContent = left; $('clock').classList.toggle('late', +left < 2 && state === 'play'); }
      const a = sim && sim.live >= 0 ? sim.att[sim.live] : null;
      kb.style.setProperty('--chg', (a ? a.charge * 360 : 0) + 'deg');
      coach(coachState());
    }
    requestAnimationFrame(frame);
  }

  /* ---------- boot ---------- */
  $('bMenu').innerHTML = IC.pause; $('bPrev').innerHTML = IC.prev; $('bRetry').innerHTML = IC.retry;
  $('pad').innerHTML = IC.stick + '<span>Drag anywhere<br>to run</span>';
  $('rotate').innerHTML = '<div>' + IC.phone + '<b>Turn your phone upright</b><p>This one is played in portrait.</p></div>';
  if (document.title !== GAME_NAME) document.title = GAME_NAME;
  // Ask for every face straight away (the canvas needs Barlow Condensed 700 before it first draws). No <link rel=preload>:
  // that is refused on file:// origins, which is how an app shell may serve these files.
  if (document.fonts && document.fonts.load) {
    try { ['400 12px Anton', '500 12px Barlow', '600 12px Barlow', '600 12px "Barlow Condensed"', '700 12px "Barlow Condensed"'].forEach(f => document.fonts.load(f)); document.fonts.ready.then(resize); } catch (e) {}
  }

  document.addEventListener('click', e => { if (e.target.closest && e.target.closest('#rtb')) { SFX.tap(); showRatings(); } });
  window.__omt = {
    setAuto(f) { autoFactory = f; }, info: () => ({ state, li, round, fails, levels: LEVELS.length }), start: startLevel, unlockAll() { save.all = true; },
    home: showHome, name: GAME_NAME,
    /* Android back button (called by the app shell). Returns false when there is nothing left to go back to. */
    back() {
      const open = $('ov').classList.contains('on');
      if (state === 'play' || state === 'ready') { if (open) hideOv(); else showPause(); return true; }
      if (state === 'home' || state === 'cover') { if (open) { hideOv(); return true; } return false; }
      showHome(); return true;
    }
  };
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(() => {});
  showHome();
  requestAnimationFrame(frame);
})();
