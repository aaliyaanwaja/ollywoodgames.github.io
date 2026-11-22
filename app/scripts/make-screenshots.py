#!/usr/bin/env python3
"""Store screenshots, generated from the real game so they can be regenerated whenever the art or the levels change.

    npm run screenshots                      (= python3 scripts/make-screenshots.py)
    python3 scripts/make-screenshots.py --only 1,6        just those numbers
    python3 scripts/make-screenshots.py --store ios       just one store
    python3 scripts/make-screenshots.py --sheet           also write a contact sheet per store (not for upload)

Writes:
  app/store/screenshots/android/NN-name.png   1080 x 1920, 24-bit PNG, no alpha   (Google Play phone, 9:16)
  app/store/screenshots/ios/NN-name.png       1320 x 2868, 24-bit PNG, no alpha   (App Store, iPhone 6.9-inch)
  app/store/screenshots/index.json            file, caption, alt text and size of every image

How it works
  1. The real page (one-man-team/index.html, exactly what ships) is opened in headless Chromium at a phone viewport.
  2. Time is taken over with Playwright's clock, so the game only advances when this script says so. The bots from
     tools/bots.js and the scripts in tools/scripts/ (the same ones that prove every level can be beaten) play the
     game to a real moment, found by asking the simulation a question ("is the pass on its way?"), not by sleeping.
     (Because the bots feed the game its input directly, no thumb-stick is drawn under a finger. That is deliberate:
     with real pointer input the aim stick sits on top of the PASS button's label.)
  3. That capture is placed, untouched, as a printed plate on a page laid out like the game's matchday programme:
     paper, ink rules, Anton caption with the tomato misregistration, ticket-stub number. Nothing is drawn over the
     capture. The caption block is under a fifth of the image height (checked below).

What the eight show, their order and their captions come from docs/marketing/store-assets-plan.md. Differences,
all deliberate:
  - Caption 8 was "THREE STARS FOR FEW RETRIES". That is no longer how the game works (retries are free; stars are
    for a quick finished move), so it now reads "THREE STARS FOR A QUICK MOVE".
  - Screenshot 1 is the goal itself (GOAL stamp, confetti, the three earlier runs on the cloth) rather than the
    replay, because in the game the replay always runs behind the result sheet, which is screenshot 7.
  - Screenshot 6 shows the offside line while the striker waits for his own pass, not the failure sheet.
  - The App Store allows ten, so iOS gets two more: the end-of-season report and a practice drill. (The briefing
    page was tried and dropped: it is mostly empty paper and says less than either.)

Sizes were checked against the stores' own help pages on 21 Nov 2026 (see app/store/release-checklist.md, Sources).
Needs: python3, playwright (chromium), Pillow, node."""
import argparse, asyncio, base64, json, os, subprocess, sys, tempfile
from playwright.async_api import async_playwright
from PIL import Image

APP = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
ROOT = os.path.normpath(os.path.join(APP, '..'))
GAME = os.path.join(ROOT, 'one-man-team')
OUT = os.path.join(APP, 'store', 'screenshots')

PAPER, PAPER_SHADE, INK, INK_SOFT = '#F2EAD8', '#E6DCC3', '#14213D', '#4A5573'
CHALK, TOMATO, MUSTARD = '#FBF8F0', '#E4572E', '#F2B705'

# ---- output sizes. `css` is the phone viewport the game is captured at; its shape is chosen so that the plate fills
#      the space under the caption. `band` is the caption block as a fraction of the height (limit: one fifth). ----
STORES = {
    'android': dict(w=1080, h=1920, css=(390, 693), dpr=3, band=0.188, count=8),
    'ios':     dict(w=1320, h=2868, css=(430, 786), dpr=3, band=0.188, count=10),
}

# The level screenshots 1-4, 6, 7 and 9 are taken from (one move, so the story is continuous), and the one for 5.
# Chosen by NAME, so adding packs does not move them. Both are in packs 1-3.
MOVE = 'The overlap'            # four players: holder, winger, left-back, striker
DECOY_MOVE = 'Last-minute winner'

SHOTS = [
    # n, file name, caption (two lines), alt text (140 characters or fewer; checked)
    (1, 'goal', ['You play', 'every player'], 'A goal on a felt pitch with confetti, and the runs of three earlier players drawn in chalk'),
    (2, 'pass', ['First,', 'play the pass'], 'The first player aims a pass with the aim line showing and the pass button held down'),
    (3, 'rewind', ['Rewind.', 'Now run onto it'], 'A second player runs onto the pass while the first player replays his recorded part'),
    (4, 'defenders', ['Defenders react', 'to every run'], 'A full-back has followed the winger inside, leaving the touchline free for the overlapping runner'),
    (5, 'decoy', ['A decoy never', 'touches the ball'], 'A decoy runner pulls his marker away while the recorded pass travels through the gap'),
    (6, 'offside', ['Mind your own', 'offside line'], 'The offside line across the pitch while the striker waits for a pass from his own earlier player'),
    (7, 'replay', ['Watch the whole', 'move back'], 'Result sheet with three stars, the move time and the number of takes, over the action replay'),
    (8, 'career', ['Three stars', 'for a quick move'], 'Fixture list of ticket stubs with stars earned, the next fixture flagged and later ones locked'),
    (9, 'season', ['A career of', 'match moments'], 'End of season report with a rosette, stars won, fixtures won and the season table'),
    (10, 'practice', ['Learn it in', 'four short drills'], 'A practice drill: the coach explains how to aim a shot away from the goalkeeper'),
]

# ---------------------------------------------------------------------------------------------------------------
# driving the game
# ---------------------------------------------------------------------------------------------------------------
def node(code):
    return subprocess.check_output(['node', '-e', code], cwd=ROOT).decode().strip().split('\n')[-1]

def bot_scripts():
    """{ level name: [script per round] } from tools/scripts, keyed by name so that pack order does not matter."""
    return node("const {SCRIPTS}=require('./tools/load.js');const o={};OMT_LEVELS.forEach((l,i)=>{if(SCRIPTS[i])o[l.name]=SCRIPTS[i]});console.log(JSON.stringify(o))")

BOTS = open(os.path.join(ROOT, 'tools', 'bots.js')).read() \
    .replace("const { FB } = require('./load.js');", "").replace("module.exports = { makeBot };", "window.makeBot = makeBot;")

# Wraps every bot so the script can see the simulation (__shot.S) and the bot's last input (__shot.q).
# The game asks for a bot per (level index, round); for a practice drill the "level" is 'p0'..'p3'.
HOOK = """
window.__shot = { S: null, q: null };
window.__li = name => { const i = OMT_LEVELS.findIndex(l => l.name === name); if (i < 0) throw new Error('no level called ' + name); return i; };
// practice drill 1 (Shoot): a striker with the ball in front of goal. Aim at the corner away from the keeper.
const DRILL = { p0: [{ kickAt: [21.6, 0], power: 0.85 }] };
__omt.setAuto((li, r) => {
  const name = typeof li === 'number' ? OMT_LEVELS[li].name : li;
  const sc = typeof li === 'number' ? (SCRIPTS[name] || [])[r] : (DRILL[li] || [])[r];
  if (!sc) { if (typeof li === 'number') throw new Error('no bot script for ' + name + ' round ' + r); return null; }
  const f = makeBot(sc);
  return S => { const q = f(S) || {}; __shot.S = S; __shot.q = q; return q; };
});
"""
QUIET = dict(sound=False, haptics=False, cover=True, practised=True, seenHow=True, seenDecoy=True)

class Game:
    """One page with the game in it and time under control."""
    def __init__(self, browser, store, scripts):
        self.browser, self.store, self.scripts, self.errors = browser, store, scripts, []

    async def open(self, save):
        w, h = self.store['css']
        self.ctx = await self.browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=self.store['dpr'], has_touch=True, locale='en-GB')
        self.page = p = await self.ctx.new_page()
        p.on('console', lambda m: self.errors.append(m.text) if m.type == 'error' else None)
        p.on('pageerror', lambda e: self.errors.append(str(e)))
        await p.clock.install(time=1795000000000)
        await p.add_init_script("try{localStorage.setItem('omt.v1', %s)}catch(e){}" % json.dumps(json.dumps(save)))
        await p.goto('file://' + os.path.join(GAME, 'index.html'))
        await p.evaluate("document.fonts.ready.then(() => 1)")
        await p.add_script_tag(content='(function(){' + BOTS + '})(); window.SCRIPTS=' + self.scripts + ';' + HOOK)
        await p.clock.pause_at(1795000002000)
        await self.run(300)
        return self

    async def run(self, ms):
        await self.page.clock.run_for(ms)

    async def until(self, what, pred, max_ms=45000):
        """Advance one frame at a time until the JavaScript expression is true."""
        t = 0
        while t < max_ms:
            if await self.page.evaluate('(() => { const S = __shot.S, I = __omt.info(); return !!(' + pred + '); })()'): return
            await self.page.clock.run_for(16); t += 16
        raise RuntimeError('never reached "%s" (%s); game is at %s' % (what, pred, json.dumps(await self.page.evaluate('__omt.info()'))))

    async def start(self, level, to_round=0):
        """Open a level's briefing, kick off, and let the bots play until the given round is in play."""
        await self.page.evaluate('__omt.start(__li(%s))' % json.dumps(level)); await self.run(300)
        await self.page.click('#go'); await self.run(50)
        await self.until('round %d of %s under way' % (to_round + 1, level), "I.round === %d && I.state === 'play'" % to_round)

    async def capture(self, path):
        await self.page.screenshot(path=path, animations='disabled')
        bad = [e for e in self.errors if 'ERR_FILE_NOT_FOUND' not in e]
        if bad: raise RuntimeError('console errors while capturing: %s' % bad[:3])

    async def close(self):
        await self.ctx.close()

def season_save(names):
    """Every fixture already won, with a mix of stars, so that winning the last fixture of a season ends that season."""
    pattern = [3, 2, 3, 2, 3, 3, 2]
    return dict(QUIET, done={n: {'stars': pattern[i % len(pattern)], 'time': 0, 'retries': [2, 5, 0, 7, 3][i % 5]} for i, n in enumerate(names)})

def career_save(names):
    """A believable early career: the first few fixtures won with a mix of stars, the next one waiting, the rest locked.
    No `time` is stored, so the game shows these stars as given instead of regrading them."""
    stars = [3, 2, 3]
    done = {names[i]: {'stars': s, 'time': 0, 'retries': 0} for i, s in enumerate(stars) if i < len(names) - 1}
    return dict(QUIET, done=done)

AIMING = "S && __shot.q && __shot.q.charging && S.ball.owner === S.live && S.status === 'play' && I.state === 'play'"

async def scene(n, g, raw):
    """Drive game `g` to the moment for screenshot n and save the untouched capture to `raw`."""
    p = g.page
    if n == 1:      # the goal: last player has scored, GOAL stamp and confetti, earlier runs on the cloth
        await g.start(MOVE)
        await g.until('the goal', "I.state === 'goalhold'"); await g.run(620)
    elif n == 2:    # round one: the holder is aiming his pass, aim line and landing ring on the cloth
        await g.start(MOVE, 0)
        await g.until('the holder aiming', AIMING); await g.run(96)
        await g.until('still aiming', AIMING, 16)
    elif n == 3:    # round two: the first player replays his pass, the live one runs onto it
        await g.start(MOVE, 1)
        await g.until('the recorded pass on its way', "S && S.live === S.level.order[1] && S.ball.owner < 0 && S.ball.lastKicker >= 0 && S.liveKickTick < 0")
        await g.run(620)
        await g.until('still on its way', "S.ball.owner < 0 && S.liveKickTick < 0", 16)
    elif n == 4:    # round three: the full-back has gone inside with the winger; the overlapping runner has the line to himself
        await g.start(MOVE, 2)
        await g.until('the overlapping runner on the ball', "S && S.live === S.level.order[2] && S.ball.owner === S.live"); await g.run(120)
    elif n == 5:    # a decoy round: no ball for the live player, his marker comes with him, the recorded pass goes through
        await g.start(DECOY_MOVE, 2)
        await g.until('the decoy round', "S && S.role === 'decoy' && S.live === S.level.order[2]")
        await g.until('the through pass on its way', "S.chainPos >= 1 && S.ball.owner < 0 && S.status === 'play'"); await g.run(330)
        await g.until('decoy still running', "S.role === 'decoy' && S.status === 'play' && I.state === 'play'", 16)
    elif n == 6:    # last round: the striker waits behind the offside line for a pass his own earlier player will make
        await g.start(MOVE, 3)
        await g.until('the left-back carrying the ball', "S && S.live === S.level.order[3] && S.ball.owner === S.level.order[2]"); await g.run(2500)
        await g.until('still waiting, line drawn', "S.ball.owner === S.level.order[2] && S.liveKickTick < 0 && FB.offsideLine(S) > 1 && S.att[S.live].y > FB.offsideLine(S)", 16)
    elif n == 7:    # the result sheet over the action replay
        await g.start(MOVE)
        await g.until('the result sheet', "I.state === 'goal'"); await g.run(5200)
    elif n == 8:    # the fixture list
        await p.evaluate('__omt.home()'); await g.run(400)
        # scrolled just far enough to put the title at the top (the strip above it carries an in-game joke about the
        # price, and Google asks for no price wording in listing graphics)
        await p.evaluate("(() => { const s = document.getElementById('scroll'), m = document.querySelector('.mast-main'); if (s && m) s.scrollTop = Math.max(0, s.scrollTop + m.getBoundingClientRect().top - s.getBoundingClientRect().top); })()"); await g.run(100)
    elif n == 9:    # the end-of-season report: win the last fixture of season one, then press the sheet's own button
        last = await p.evaluate("(() => { const s0 = OMT_LEVELS[0].season, k = s0 ? OMT_LEVELS.findIndex(l => l.season !== s0) : 4; return (k > 0 ? k : OMT_LEVELS.length) - 1; })()")
        await p.evaluate('__omt.start(%d)' % last); await g.run(300)
        await p.click('#go'); await g.run(50)
        await g.until('the result sheet', "I.state === 'goal'"); await g.run(1500)
        await p.click('#nx'); await g.run(900)
        await g.until('the season report', "I.state === 'season'")
    elif n == 10:   # the first practice drill, with the coach talking: reached the way a player reaches it, from Options
        await p.evaluate('__omt.home()'); await g.run(300)
        await p.click('#bOpt'); await g.run(300)
        await p.click('#oPrac'); await g.run(400)
        await p.click('#go'); await g.run(50)
        await g.until('the striker aiming', AIMING); await g.run(96)
        await g.until('still aiming', AIMING, 16)
    await g.capture(raw)

# ---------------------------------------------------------------------------------------------------------------
# the printed page around the capture
# ---------------------------------------------------------------------------------------------------------------
def font_face(family, weight, file):
    data = base64.b64encode(open(os.path.join(GAME, 'fonts', file), 'rb').read()).decode()
    return '@font-face{font-family:"%s";font-weight:%d;src:url(data:font/woff2;base64,%s) format("woff2")}' % (family, weight, data)

FONTS = font_face('Anton', 400, 'anton-latin-400-normal.woff2') + \
    font_face('Barlow Condensed', 600, 'barlow-condensed-latin-600-normal.woff2') + \
    font_face('Barlow Condensed', 700, 'barlow-condensed-latin-700-normal.woff2')

def page_html(store, n, total, lines, raw_png, size_px=None):
    """The whole image as one HTML page at 1 CSS px = 1 output px. `u` is the unit: 1/1080 of the width."""
    W, H = store['w'], store['h']; u = W / 1080.0
    band = round(H * store['band'])
    cw, ch = store['css']
    gap, foot, side = round(30 * u), round(46 * u), round(40 * u)
    plate_h = H - band - gap - foot
    plate_w = round(plate_h * cw / ch)
    if plate_w > W - 2 * side: plate_w = W - 2 * side; plate_h = round(plate_w * ch / cw)
    img = 'data:image/png;base64,' + base64.b64encode(open(raw_png, 'rb').read()).decode() if raw_png else ''
    px = lambda v: '%dpx' % round(v * u)
    return """<!DOCTYPE html><html><head><meta charset="utf-8"><style>
%(fonts)s
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:%(W)dpx;height:%(H)dpx;overflow:hidden;background:%(paper)s}
body{position:relative;color:%(ink)s;font-family:"Barlow Condensed",sans-serif}
/* the table the programme lies on: shaded paper with the game's own halftone dots */
.table{position:absolute;left:0;right:0;top:%(band)dpx;bottom:0;background-color:%(shade)s;
  background-image:radial-gradient(circle,rgba(20,33,61,.15) %(d1)s,transparent %(d2)s);background-size:%(ds)s %(ds)s}
/* the caption: a strip of programme paper with a hard ink edge under it */
.band{position:absolute;left:0;right:0;top:0;height:%(band)dpx;background:%(paper)s;border-bottom:%(rule)s solid %(ink)s;
  box-shadow:0 %(sh)s 0 rgba(20,33,61,.28);padding:%(padt)s %(side)dpx 0;overflow:hidden}
.band::before{content:"";position:absolute;top:0;right:0;width:%(hw)s;height:%(hh)s;
  background-image:radial-gradient(circle,rgba(20,33,61,.2) %(d1)s,transparent %(d2)s);background-size:%(ds)s %(ds)s;
  -webkit-mask-image:linear-gradient(215deg,#000 0%%,transparent 62%%);mask-image:linear-gradient(215deg,#000 0%%,transparent 62%%)}
.strip{position:relative;display:flex;justify-content:space-between;padding:%(sp)s 0;border-block:%(rule)s solid %(ink)s;
  font-weight:600;font-size:%(sf)s;line-height:1.3;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
.row{position:relative;display:flex;align-items:center;justify-content:space-between;gap:%(g)s;margin-top:%(rm)s}
h1{font-family:"Anton",Impact,sans-serif;font-weight:400;font-size:%(size)s;line-height:1.04;letter-spacing:.012em;text-transform:uppercase;
  text-shadow:%(ts)s %(ts)s 0 %(tomato)s;white-space:nowrap}
h1 span{display:block}
/* the ticket stub from the fixture list, carrying the plate number */
.stub{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;width:%(stw)s;height:%(sth)s;position:relative;
  background:%(chalk)s;border:%(rule)s solid %(ink)s;border-radius:%(rad)s;box-shadow:%(hs)s %(hs)s 0 %(ink)s;transform:rotate(3deg)}
.stub small{font-weight:600;font-size:%(ssf)s;line-height:1;letter-spacing:.12em;text-transform:uppercase;color:%(soft)s}
.stub b{font-family:"Anton";font-weight:400;font-size:%(sbf)s;line-height:1.05;letter-spacing:.02em}
/* the capture, untouched: a plate with the game's 2px ink border and hard offset shadow, scaled up */
.plate{position:absolute;left:%(pl)dpx;top:%(pt)dpx;width:%(pw)dpx;height:%(ph)dpx;border:%(pb)s solid %(ink)s;border-radius:%(pr)s;overflow:hidden;
  box-shadow:%(ps)s %(ps)s 0 %(ink)s;background:%(paper)s}
.plate img{display:block;width:100%%;height:100%%}
</style></head><body>
<div class="table"></div>
<div class="plate"><img src="%(img)s" alt=""></div>
<div class="band"><div class="strip"><span>Official matchday programme</span><span>Plate %(n)d of %(total)d</span></div>
<div class="row"><h1 id="cap">%(lines)s</h1><div class="stub"><small>No.</small><b>%(nn)s</b></div></div></div>
</body></html>""" % dict(
        fonts=FONTS, W=W, H=H, paper=PAPER, shade=PAPER_SHADE, ink=INK, soft=INK_SOFT, chalk=CHALK, tomato=TOMATO, band=band, side=side,
        d1=px(2.6), d2=px(3.4), ds=px(17), rule=px(4), sh=px(10), padt=px(34), hw=px(460), hh=px(330), sp=px(7), sf=px(27), g=px(28), rm=px(22),
        size=('%dpx' % size_px) if size_px else px(100), ts=px(5), stw=px(150), sth=px(176), rad=px(10), hs=px(7), ssf=px(24), sbf=px(84),
        pl=(W - plate_w) // 2, pt=band + gap, pw=plate_w, ph=plate_h, pb=px(5), pr=px(14), ps=px(12),
        img=img, n=n, total=total, nn='%02d' % n, lines=''.join('<span>%s</span>' % l for l in lines))

async def fit_caption(browser, store, shots):
    """One type size for the whole set: the largest at which the longest caption line fits beside the stub and the
    caption block stays inside the band."""
    page = await browser.new_page(viewport={'width': store['w'], 'height': store['h']})
    u = store['w'] / 1080.0; size = round(124 * u)
    while size > 40:
        ok = True
        for n, _, lines, _ in shots:
            await page.set_content(page_html(store, n, len(shots), lines, None, size))
            await page.evaluate("document.fonts.ready.then(() => 1)")
            m = await page.evaluate("(() => { const h = document.getElementById('cap'), r = h.getBoundingClientRect(), row = h.parentElement.getBoundingClientRect(), s = document.querySelector('.stub').getBoundingClientRect(), b = document.querySelector('.band').getBoundingClientRect(); return { fitsW: r.right <= s.left - %d, fitsH: row.bottom <= b.bottom - %d && Math.max(r.bottom, s.bottom) <= b.bottom - %d }; })()" % (round(24 * u), round(26 * u), round(26 * u)))
            if not (m['fitsW'] and m['fitsH']): ok = False; break
        if ok: break
        size -= 2
    await page.close()
    return size

async def compose(browser, store, n, total, lines, raw, out, size):
    page = await browser.new_page(viewport={'width': store['w'], 'height': store['h']}, device_scale_factor=1)
    await page.set_content(page_html(store, n, total, lines, raw, size))
    await page.evaluate("document.fonts.ready.then(() => 1)")
    await page.evaluate("Promise.all([...document.images].map(i => i.decode ? i.decode().catch(() => 0) : 0))")
    tmp = out + '.tmp.png'
    await page.screenshot(path=tmp, full_page=False)
    await page.close()
    im = Image.open(tmp).convert('RGB')                             # 24-bit, no alpha: both stores refuse transparency
    assert im.size == (store['w'], store['h']), im.size
    im.save(out, 'PNG', optimize=True); os.remove(tmp)

def contact_sheet(files, out, cols=5):
    ims = [Image.open(f) for f in files]; w, h = ims[0].size; s = 300.0 / w; tw, th = 300, round(h * s); pad = 16
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + pad) + pad), '#FFFFFF')
    for i, im in enumerate(ims): sheet.paste(im.resize((tw, th), Image.LANCZOS), (pad + (i % cols) * (tw + pad), pad + (i // cols) * (th + pad)))
    sheet.save(out)

async def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--only', default='', help='comma-separated screenshot numbers')
    ap.add_argument('--store', default='', choices=['', 'android', 'ios'])
    ap.add_argument('--sheet', action='store_true', help='also write a contact sheet per store (preview only)')
    ap.add_argument('--keep-raw', default='', help='folder to keep the untouched captures in')
    a = ap.parse_args()
    only = {int(x) for x in a.only.split(',') if x.strip()}
    for _, _, lines, alt in SHOTS:
        assert len(alt) <= 140, 'alt text over 140 characters (%d): %s' % (len(alt), alt)
        assert not alt.lower().startswith('image of')
    scripts = bot_scripts()
    names = json.loads(node("require('./tools/load.js');console.log(JSON.stringify(OMT_LEVELS.map(l=>l.name)))"))
    rawdir = a.keep_raw or tempfile.mkdtemp(prefix='omt-shots-'); os.makedirs(rawdir, exist_ok=True)
    index = {}
    if os.path.exists(os.path.join(OUT, 'index.json')): index = json.load(open(os.path.join(OUT, 'index.json')))
    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        for name, store in STORES.items():
            if a.store and a.store != name: continue
            shots = [s for s in SHOTS if s[0] <= store['count']]
            outdir = os.path.join(OUT, name); os.makedirs(outdir, exist_ok=True)
            size = await fit_caption(browser, store, shots)
            band_px = round(store['h'] * store['band'])
            assert band_px <= store['h'] / 5.0, 'caption block is over a fifth of the image'
            entries = []
            for n, slug, lines, alt in shots:
                out = os.path.join(outdir, '%02d-%s.png' % (n, slug))
                if not only or n in only:
                    raw = os.path.join(rawdir, '%s-%02d.png' % (name, n))
                    save = career_save(names) if n == 8 else season_save(names) if n == 9 else dict(QUIET, done={}, all=True)
                    g = await Game(browser, store, scripts).open(save)
                    try: await scene(n, g, raw)
                    finally: await g.close()
                    await compose(browser, store, n, len(shots), lines, raw, out, size)
                    im = Image.open(out); assert im.mode == 'RGB' and im.size == (store['w'], store['h'])
                    print('%-8s %02d  %dx%d  %4d KB  %s' % (name, n, im.size[0], im.size[1], os.path.getsize(out) // 1024, ' '.join(lines).upper()))
                entries.append(dict(file='%s/%02d-%s.png' % (name, n, slug), caption=' '.join(lines).upper(), alt=alt, alt_chars=len(alt), width=store['w'], height=store['h']))
            index[name] = dict(size='%d x %d' % (store['w'], store['h']), caption_block_px=band_px, caption_block_share=round(band_px / store['h'], 3), caption_type_px=size, screenshots=entries)
            if a.sheet: contact_sheet([os.path.join(OUT, e['file']) for e in entries if os.path.exists(os.path.join(OUT, e['file']))], os.path.join(OUT, 'preview-%s.png' % name))
        await browser.close()
    json.dump(index, open(os.path.join(OUT, 'index.json'), 'w'), indent=2); open(os.path.join(OUT, 'index.json'), 'a').write('\n')
    print('wrote', os.path.relpath(OUT, ROOT))

if __name__ == '__main__':
    asyncio.run(main())
