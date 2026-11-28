/* Sound effects and haptics.
   Recorded sounds (CC0, see audio/CREDITS.md) come from window.OMT_SOUNDS (js/sounds.js, base64, so they work from a
   single file, from file:// and in the app). They are decoded on the first user gesture. Every effect has a synthesised
   version, used until its recording is decoded and whenever one fails: the game never goes silent for want of a file.
   The audio context is only ever created inside a real user gesture; before that every call is a silent no-op. */
(function (root) {
  let ctx = null, out = null, on = true, hap = true, noiseBuf = null, bed = null, amb = null, ambWant = false;
  const BUF = {};               // decoded recordings by name
  function decodeAll() {
    const src = root.OMT_SOUNDS || {};
    Object.keys(src).forEach(name => {
      if (BUF[name] !== undefined) return; BUF[name] = null;
      try {
        const b64 = src[name].slice(src[name].indexOf(',') + 1), bin = atob(b64), u = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        const done = b => { BUF[name] = b; if (name === 'crowd-bed' && bed && bed.synth) bed.upgrade = true; if (name === 'ambience' && ambWant) ambience(true); };
        const p = ctx.decodeAudioData(u.buffer, done, () => { BUF[name] = false; });
        if (p && p.catch) p.catch(() => { BUF[name] = false; });
      } catch (e) { BUF[name] = false; }
    });
  }
  /* Plays a recording; returns false (so the caller synthesises instead) if it is not decoded. */
  function rec(name, vol, rate, delay) {
    const c = ac(), b = BUF[name]; if (!c || !b) return false;
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; s.playbackRate.value = rate || 1; g.gain.value = vol == null ? 1 : vol;
    s.connect(g).connect(out); s.start(c.currentTime + (delay || 0)); return true;
  }

  function boot() {
    if (!ctx) {
      const A = root.AudioContext || root.webkitAudioContext; if (!A) return;
      try { ctx = new A(); } catch (e) { ctx = null; return; }
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 18; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.2;
      out = ctx.createGain(); out.gain.value = 0.9; out.connect(comp).connect(ctx.destination);
      const n = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); let b = 0;
      for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; b = 0.985 * b + 0.015 * w; d[i] = 0.55 * w + 5 * b; }   // white with some body
      decodeAll();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  }
  ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'].forEach(ev => root.addEventListener(ev, boot, { capture: true, passive: true }));
  const ac = () => (ctx && on && ctx.state === 'running') ? ctx : null;

  function env(g, t, vol, attack, dur) {
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  function tone(f0, f1, dur, type, vol, delay, attack) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, vol || 0.2, attack || 0.006, dur);
    o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(o) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + (o.delay || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf; s.loop = true; s.loopStart = 0; s.playbackRate.value = o.rate || 1;
    f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f, t); if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur); f.Q.value = o.q || 0.8;
    if (o.hold) {
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol, t + (o.attack || 0.01));
      g.gain.setValueAtTime(o.vol, t + o.hold); g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    } else env(g, t, o.vol || 0.2, o.attack || 0.005, o.dur);
    s.connect(f).connect(g).connect(out); s.start(t, Math.random() * 1.5); s.stop(t + o.dur + 0.05);
  }
  function buzz(p) {
    if (!hap) return;
    // in the app shell, vibration goes through the native side; in a browser, the Vibration API where it exists
    if (root.ReactNativeWebView) { try { root.ReactNativeWebView.postMessage(JSON.stringify({ t: 'haptic', p })); } catch (e) {} return; }
    if (navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} }
  }

  /* A quiet crowd under the play, which can swell. One looping noise source, started on first use. */
  function crowd(level, glide) {
    const c = ac();
    if (!c) { if (bed && ctx) bed.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05); return; }
    if (bed && bed.upgrade) { try { bed.src.stop(); } catch (e) {} bed.g.disconnect(); bed = null; }
    if (!bed && BUF['crowd-bed']) {                     // the recorded crowd, looped; brighter as it swells
      const s = c.createBufferSource(), hi = c.createBiquadFilter(), g = c.createGain();
      s.buffer = BUF['crowd-bed']; s.loop = true; hi.type = 'lowshelf'; hi.frequency.value = 400; hi.gain.value = 0;
      g.gain.value = 0.0001; s.connect(hi).connect(g).connect(out); s.start();
      bed = { g, src: s, rec: true, hi: { frequency: { setTargetAtTime() {} } } };
    }
    if (!bed) {
      const s = c.createBufferSource(), lo = c.createBiquadFilter(), hi = c.createBiquadFilter(), g = c.createGain();
      s.buffer = noiseBuf; s.loop = true; s.playbackRate.value = 0.6;
      lo.type = 'bandpass'; lo.frequency.value = 520; lo.Q.value = 0.5;
      hi.type = 'bandpass'; hi.frequency.value = 1500; hi.Q.value = 0.7;
      const hg = c.createGain(); hg.gain.value = 0.35;
      g.gain.value = 0.0001;
      s.connect(lo).connect(g); s.connect(hi).connect(hg).connect(g); g.connect(out); s.start();
      bed = { g, hi, src: s, synth: true };
    }
    bed.g.gain.setTargetAtTime(Math.max(0.0001, bed.rec ? level * 9 : level), c.currentTime, glide || 0.25);
    bed.hi.frequency.setTargetAtTime(1300 + 1800 * Math.min(1, level * 6), c.currentTime, glide || 0.25);
  }

  /* A quiet distant crowd on the home screen, off with the sound. */
  function ambience(want) {
    // Off: the only free recording was looped clapping, which played on and on behind the home screen.
    // Kept as a stub so callers need no change; the home screen is silent until a proper ambience is found.
    want = false;
    ambWant = !!want; const c = ac();
    if (!want || !c) { if (amb && ctx) { amb.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3); } return; }
    if (!amb && BUF.ambience) {
      const s = c.createBufferSource(), g = c.createGain(); s.buffer = BUF.ambience; s.loop = true; g.gain.value = 0.0001;
      s.connect(g).connect(out); s.start(); amb = { g };
    }
    if (amb) amb.g.gain.setTargetAtTime(0.5, c.currentTime, 0.8);
  }

  const SFX = {
    buzz, ambience,
    has: name => !!BUF[name],
    unlock() { if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); },
    set(sound, haptics) { on = !!sound; hap = !!haptics; if (!on) { crowd(0, 0.03); if (amb && ctx) amb.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.03); } else if (ambWant) ambience(true); },
    /* the round-start card folding away */
    paper() { if (!rec('paper', 0.8)) noise({ dur: 0.12, f: 3000, f1: 5200, q: 0.6, vol: 0.05, attack: 0.02 }); },
    /* interface: paper and card, never beeps */
    tap() { noise({ dur: 0.035, f: 3200, q: 1.2, vol: 0.07, type: 'highpass' }); tone(420, 300, 0.045, 'sine', 0.06); },
    page() { noise({ dur: 0.16, f: 2400, f1: 5200, q: 0.6, vol: 0.05, attack: 0.05 }); },
    deny() { tone(170, 150, 0.07, 'triangle', 0.14); tone(130, 110, 0.1, 'triangle', 0.14, 0.09); buzz([18, 40, 18]); },
    tick() { noise({ dur: 0.03, f: 2600, q: 2, vol: 0.12 }); tone(990, 0, 0.09, 'triangle', 0.09, 0.01); },
    /* the pitch */
    kick(power) {
      const p = power || 0;
      if (rec('boot-light', 0.55 + 0.4 * p, 1.08 - 0.1 * p)) { buzz(10 + Math.round(14 * p)); return; }
      tone(190 + 40 * p, 48, 0.16, 'sine', 0.34 + 0.3 * p);                              // boot through the ball
      noise({ dur: 0.05, f: 900 + 500 * p, q: 0.7, vol: 0.2 + 0.18 * p, type: 'lowpass' }); // leather slap
      noise({ dur: 0.022, f: 3400, q: 1.5, vol: 0.07 + 0.06 * p });                         // click of contact
      buzz(10 + Math.round(14 * p));
    },
    /* a shot: struck through, not passed. A deeper thump, a harder crack, the air it leaves behind, a firmer buzz */
    strike(power) {
      const p = power || 0;
      if (rec('boot-heavy', 0.8 + 0.2 * p, 1 - 0.06 * p)) { noise({ dur: 0.22, f: 2600, f1: 900, q: 0.9, vol: 0.04 + 0.03 * p, attack: 0.02 }); buzz(30 + Math.round(10 * p)); return; }
      tone(150 + 40 * p, 40, 0.2, 'sine', 0.5 + 0.25 * p);                                // boot through the ball
      noise({ dur: 0.06, f: 1300 + 600 * p, q: 0.6, vol: 0.3 + 0.15 * p, type: 'lowpass' }); // leather slap
      noise({ dur: 0.03, f: 4200, q: 1.2, vol: 0.13 + 0.07 * p });                          // the crack of contact
      noise({ dur: 0.22, f: 2600, f1: 900, q: 0.9, vol: 0.05 + 0.04 * p, attack: 0.02 });   // whoosh
      buzz(26 + Math.round(14 * p));
    },
    touch() { if (!rec('touch', 0.7)) { tone(230, 120, 0.07, 'sine', 0.16); noise({ dur: 0.035, f: 1300, q: 1, vol: 0.06 }); } buzz(14); },
    glove() { if (!rec('glove', 0.9)) { tone(160, 70, 0.12, 'sine', 0.3); noise({ dur: 0.06, f: 900, q: 0.8, vol: 0.2, type: 'lowpass' }); } buzz(35); },
    lock() { tone(392, 0, 0.09, 'triangle', 0.13); tone(587, 0, 0.16, 'triangle', 0.13, 0.085); noise({ dur: 0.03, f: 3000, q: 1.5, vol: 0.05 }); buzz(18); },
    whistle(n) {
      const c = ac(); buzz([30, 60, 60]); if (!c) return;
      const blasts = n === 2 ? [[0, 0.18], [0.26, 0.46]] : [[0, 0.36]];
      blasts.forEach(([d, len]) => {
        const t = c.currentTime + d, g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain(), bp = c.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 2250; bp.Q.value = 3;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.015); g.gain.setValueAtTime(0.11, t + len - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        lfo.frequency.value = 34; lg.gain.value = 0.06; lfo.connect(lg).connect(g.gain);       // the pea rattling
        [2090, 2330].forEach(f => { const o = c.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(f * 0.97, t); o.frequency.linearRampToValueAtTime(f, t + 0.04); o.connect(bp); o.start(t); o.stop(t + len + 0.03); });
        bp.connect(g).connect(out); lfo.start(t); lfo.stop(t + len + 0.03);
      });
      noise({ dur: 0.3, f: 2400, q: 1.2, vol: 0.02 });
    },
    thud() { if (!rec('thud', 0.9)) { tone(120, 42, 0.2, 'sine', 0.4); noise({ dur: 0.1, f: 420, q: 0.7, vol: 0.22, type: 'lowpass' }); } buzz(50); },
    ooh() { noise({ dur: 1.1, f: 820, f1: 360, q: 1.1, vol: 0.14, attack: 0.09, rate: 0.7 }); noise({ dur: 0.9, f: 1500, f1: 700, q: 1.4, vol: 0.05, attack: 0.1 }); },
    crowd,
    goal() {
      if (BUF['crowd-roar']) {                                                                // recorded: net, roar, brass sting
        if (!rec('net', 0.9)) noise({ dur: 0.12, f: 5200, q: 0.5, vol: 0.12, type: 'highpass', attack: 0.02 });
        rec('crowd-roar', 0.8, 1, 0.04); rec('goal-sting', 0.55, 1, 0.35);
        tone(98, 60, 0.5, 'sine', 0.3, 0.02, 0.03); crowd(0.0001, 1.2); buzz([40, 50, 40, 50, 140]); return;
      }
      noise({ dur: 0.12, f: 5200, q: 0.5, vol: 0.12, type: 'highpass', attack: 0.02 });       // the net
      noise({ dur: 3.4, hold: 1.3, f: 620, f1: 480, q: 0.45, vol: 0.34, attack: 0.16, rate: 0.6 });
      noise({ dur: 3.0, hold: 1.1, f: 1500, f1: 1100, q: 0.6, vol: 0.2, attack: 0.22, rate: 0.9 });
      noise({ dur: 2.4, hold: 0.7, f: 2900, f1: 1900, q: 0.8, vol: 0.09, attack: 0.3 });
      tone(98, 60, 0.5, 'sine', 0.3, 0.02, 0.03);                                             // the stand shaking
      crowd(0.0001, 1.2);
      buzz([40, 50, 40, 50, 140]);
    },
    stamp(i) {
      const k = i || 0;
      tone(105 + 12 * k, 52, 0.13, 'sine', 0.5); noise({ dur: 0.05, f: 1100 + 250 * k, q: 0.8, vol: 0.2, type: 'lowpass' });
      noise({ dur: 0.02, f: 3800, q: 2, vol: 0.06 });
      if (k === 2) { tone(1175, 0, 0.5, 'triangle', 0.07, 0.03); tone(1568, 0, 0.6, 'triangle', 0.05, 0.11); }
      buzz(k === 2 ? [20, 30, 40] : 16);
    }
  };
  root.SFX = SFX;
})(window);
