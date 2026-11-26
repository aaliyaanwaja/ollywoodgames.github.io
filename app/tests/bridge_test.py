#!/usr/bin/env python3
"""End-to-end check of the web <-> native bridge, without Android.

Loads the EMBEDDED game (src/game-html.js) exactly as App.tsx prepares it (bootstrap script spliced after <head>,
served at the shell's base URL) in headless Chromium at a phone size, with a fake window.ReactNativeWebView that
records every message. Proves:
  1. a stored save handed over in window.__OMT_NATIVE__ is what the game boots with (and beats localStorage);
  2. completing a level posts { t: 'save', v } containing the old progress and the new result;
  3. haptic messages arrive in a shape the shell maps to a vibration;
  4. the shell's page-side API works: insets, back button, background/foreground (freeze + audio), external links.
What it cannot prove is anything about a real Android WebView. See README, "Verified here / not verified here".

Usage: python3 tests/bridge_test.py     (run by `npm test`)"""
import asyncio, json, os, subprocess, sys
from playwright.async_api import async_playwright

APP = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ROOT = os.path.join(APP, '..')
LEVEL = 1   # zero-based: the level the bot completes. Level 0 is seeded as already done.

def node(code):
    return subprocess.check_output(['node', '-e', code], cwd=APP).decode()

def prepared_page(save, platform='android'):
    """The same two calls App.tsx makes. `platform` is what App.tsx passes from Platform.OS."""
    code = ("const S=require('./src/page-script.js'),G=require('./src/game-html.js');"
            "const save=JSON.parse(process.argv[1]);"
            "const script=S.bootstrapScript({save,version:require('./app.json').expo.version,insets:{top:31,right:0,bottom:17,left:0},platform:process.argv[2]});"
            "process.stdout.write(JSON.stringify({html:S.withBootstrap(G.GAME_HTML,script),base:S.BASE_URL,script,"
            "back:S.backScript(),hide:S.setActiveScript(false),show:S.setActiveScript(true),"
            "insets:S.insetsScript({top:40,right:0,bottom:20,left:0})}))")
    return json.loads(subprocess.check_output(['node', '-e', code, json.dumps(save), platform], cwd=APP).decode())

FAKE_NATIVE = """window.__posted = []; window.ReactNativeWebView = { postMessage: function (m) { window.__posted.push(m); } };"""

checks = []
def ok(cond, what, detail=''):
    checks.append((bool(cond), what))
    print(('  ok   ' if cond else '  FAIL ') + what + (('  [' + str(detail)[:300] + ']') if (detail != '' and not cond) else ''))

async def open_game(browser, prep, local_storage=None):
    ctx = await browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True)
    page = await ctx.new_page(); errs = []
    page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: errs.append(str(e)))
    external = []
    async def route(r):
        if r.request.url == prep['base']: await r.fulfill(status=200, content_type='text/html; charset=utf-8', body=prep['html'])
        elif r.request.url == prep['base'] + '__seed': await r.fulfill(status=200, content_type='text/html', body='<title>seed</title>')
        else:
            external.append(r.request.url); await r.abort()
    await page.route('**/*', route)
    if local_storage is not None:      # a stale copy in the page's own storage, to prove the native save wins
        await page.goto(prep['base'] + '__seed')
        await page.evaluate("v => localStorage.setItem('omt.v1', v)", local_storage)
    await page.add_init_script(FAKE_NATIVE)
    # App.tsx also passes the same script as injectedJavaScriptBeforeContentLoaded; it must be harmless twice.
    await page.add_init_script(prep['script'])
    await page.goto(prep['base']); await page.wait_for_timeout(600)
    return ctx, page, errs, external

async def posted(page, t=None):
    msgs = [json.loads(m) for m in await page.evaluate("window.__posted")]
    return [m for m in msgs if t is None or m.get('t') == t]

async def play_level(page, li):
    bots = open(os.path.join(ROOT, 'tools', 'bots.js')).read().replace("const { FB } = require('./load.js');", "").replace("module.exports = { makeBot };", "window.makeBot = makeBot;")
    scripts = node("const {SCRIPTS}=require('%s/tools/load.js');console.log(JSON.stringify(SCRIPTS))" % ROOT).strip().split('\n')[-1]
    await page.add_script_tag(content='(function(){' + bots + '})(); window.SCRIPTS=' + scripts + ';')
    await page.evaluate("__omt.setAuto((li,r)=>makeBot(SCRIPTS[li][r]))")
    await page.evaluate(f"__omt.start({li})"); await page.wait_for_timeout(400)
    await page.click('#go')
    st = None
    for _ in range(240):
        await page.wait_for_timeout(250)
        st = await page.evaluate("__omt.info()")
        if st['state'] in ('goal', 'failed'): break
    return st

async def main():
    # saves are keyed by each level's permanent id (campaign v2); ids: 1 marks a save already in that form
    levels = json.loads(node("const p=require('path');global.window=global;require(p.join('%s','tools','load.js'));console.log(JSON.stringify(global.OMT_LEVELS.map(l=>l.id||l.name)))" % ROOT).strip().split('\n')[-1])
    seeded = {'done': {levels[0]: {'stars': 1, 'time': 12.34, 'retries': 9}}, 'ids': 1, 'sound': False, 'haptics': True, 'seenHow': True, 'cover': True, 'marker': 'from-native'}
    stale = {'done': {}, 'sound': True, 'haptics': True, 'marker': 'from-localStorage'}
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        print('A. boot with a stored save, complete a level')
        prep = prepared_page(json.dumps(seeded))
        ctx, page, errs, external = await open_game(browser, prep, local_storage=json.dumps(stale))
        nat = await page.evaluate("window.__OMT_NATIVE__")
        ok(nat and nat['save'] == json.dumps(seeded) and nat['version'] == '1.0.0', 'window.__OMT_NATIVE__ = { save, version } exists before the game runs', nat)
        ok(nat.get('platform') == 'android', 'window.__OMT_NATIVE__.platform is android by default', nat.get('platform'))
        ob = await page.evaluate("[getComputedStyle(document.getElementById('scroll')).overscrollBehaviorY, getComputedStyle(document.documentElement).touchAction, document.querySelectorAll('#omt-shell-css').length]")
        ok(ob == ['none', 'manipulation', 1], 'the shell stylesheet is in the page once: inner lists cannot overscroll, no double-tap zoom', ob)
        ok(await page.evaluate("location.href") == prep['base'] and await page.evaluate("window.isSecureContext"), 'page runs at the shell base URL in a secure context')
        ok(await page.evaluate("(function(){try{localStorage.setItem('omt.t','1');return localStorage.getItem('omt.t')==='1'}catch(e){return false}})()"), 'localStorage works at that origin')
        ok((await page.evaluate("__omt.info()"))['state'] == 'home', 'game reached its home screen', await page.evaluate("__omt.info()"))
        ok(await page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--st').trim()") == '31px'
           and await page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--sb').trim()") == '17px', 'native insets override the page inset variables')
        await page.evaluate(prep['insets'])
        ok(await page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--st').trim()") == '40px', 'insets can be updated without a reload')

        # back button at home: nothing to go back to
        await page.evaluate(prep['back']); await page.wait_for_timeout(100)
        b = await posted(page, 'back')
        ok(len(b) == 1 and b[0]['handled'] is False, 'back at the home screen answers handled:false (app may background)', b)

        st = await play_level(page, LEVEL)
        ok(st and st['state'] == 'goal', 'bot completed level %d' % (LEVEL + 1), st)
        saves = await posted(page, 'save')
        ok(len(saves) >= 1 and all(isinstance(s.get('v'), str) for s in saves), 'save messages were posted as { t: "save", v: <string> }', len(saves))
        last = json.loads(saves[-1]['v']) if saves else {}
        ok(last.get('marker') == 'from-native' and last.get('sound') is False, 'the save read at boot was the native one, not localStorage', {k: last.get(k) for k in ('marker', 'sound')})
        ok(last.get('done', {}).get(levels[0]) == seeded['done'][levels[0]], 'earlier progress survived in the posted save', last.get('done', {}).get(levels[0]))
        new = last.get('done', {}).get(levels[LEVEL])
        ok(isinstance(new, dict) and new.get('stars') in (1, 2, 3), 'the completed level is in the posted save with its stars', new)
        valid = json.loads(node("const S=require('./src/page-script.js');console.log(JSON.stringify(%s.map(S.validSave)))" % json.dumps([s['v'] for s in saves])))
        ok(all(valid), 'every posted save passes the shell validation')
        haps = await posted(page, 'haptic')
        plans = json.loads(node("const S=require('./src/page-script.js');console.log(JSON.stringify(%s.map(S.hapticPlan)))" % json.dumps([h.get('p') for h in haps])))
        ok(len(haps) > 0 and all(pl['kind'] != 'none' for pl in plans), 'haptic messages were posted and each maps to a vibration (%d: %s)' % (len(haps), sorted(set(pl['kind'] for pl in plans))), haps[:5])

        # back button away from home: handled by the page
        await page.evaluate(prep['back']); await page.wait_for_timeout(300)
        b = await posted(page, 'back')
        ok(len(b) == 2 and b[1]['handled'] is True and (await page.evaluate("__omt.info()"))['state'] == 'home', 'back from the result screen is handled by the page and returns home', b)

        # external link: goes to the shell as { t: 'open' }, the page itself does not navigate
        await page.click('#bOpt'); await page.wait_for_timeout(300)
        href = await page.get_attribute('#oPriv', 'href')
        await page.click('#oPriv'); await page.wait_for_timeout(300)
        o = await posted(page, 'open')
        allowed = node("const S=require('./src/page-script.js');process.stdout.write(String(S.externalUrl(%s)))" % json.dumps(o[0]['url'] if o else ''))
        ok(href == 'https://ollywoodgames.github.io/privacy.html' and len(o) == 1 and o[0]['url'] == href and allowed == href, 'privacy link is handed to the shell and is on its allow-list', (href, o))
        ok(await page.evaluate("location.href") == prep['base'] and not external, 'the page did not navigate and made no network request', external)
        ok(not errs, 'no console errors', errs)
        await ctx.close()

        print('B. background and foreground')
        ctx, page, errs, external = await open_game(browser, prep)
        await page.evaluate("window.__vis = []; document.addEventListener('visibilitychange', () => __vis.push(document.hidden));")
        await page.evaluate("window.__ac = new AudioContext(); __ac.resume()"); await page.wait_for_timeout(200)
        running = await page.evaluate("__ac.state")
        await page.evaluate("__omt.start(0)"); await page.wait_for_timeout(300)
        await page.click('#go'); await page.wait_for_timeout(600)
        await page.keyboard.down('ArrowUp'); await page.wait_for_timeout(500)      # the first input starts the clock
        before = await page.evaluate("__omt.info()")
        await page.evaluate(prep['hide']); await page.wait_for_timeout(300)
        ok(await page.evaluate("document.hidden") is True and await page.evaluate("document.visibilityState") == 'hidden' and await page.evaluate("__vis") == [True], 'backgrounding fires visibilitychange with document.hidden true')
        ok(running == 'running' and await page.evaluate("__ac.state") == 'suspended', 'backgrounding suspends Web Audio', (running, await page.evaluate("__ac.state")))
        await page.keyboard.up('ArrowUp')
        after = await page.evaluate("__omt.info()")
        ok(before['state'] == 'play' and after['state'] == 'ready', 'a move in progress is frozen (clock stopped until the next touch)', (before, after))
        await page.evaluate(prep['show']); await page.wait_for_timeout(300)
        ok(await page.evaluate("document.hidden") is False and await page.evaluate("__ac.state") == 'running' and await page.evaluate("__vis") == [True, False], 'returning restores visibility and resumes Web Audio')
        ok(not errs, 'no console errors', errs)
        await ctx.close()

        print('C. first launch on iOS, no stored save: cover, practice drills, then fixture 1')
        prep0 = prepared_page(None, 'ios')
        ctx, page, errs, external = await open_game(browser, prep0)
        nat = await page.evaluate("window.__OMT_NATIVE__")
        ok(nat['save'] is None, 'window.__OMT_NATIVE__.save is null')
        ok(nat.get('platform') == 'ios', 'window.__OMT_NATIVE__.platform is ios when the shell says so', nat.get('platform'))
        # The game opens on the programme cover; Kick off goes straight into the first practice drill (build 0.5.0:
        # no brief page between drills; the HUD carries a Skip button where rewind and retry sit in a match).
        ok(await page.evaluate("document.getElementById('home').classList.contains('cover')"), 'first launch shows the programme cover')
        await page.click('#cta'); await page.wait_for_timeout(400)
        st0 = await page.evaluate("__omt.info()")
        ok(st0['prac'] == 0 and st0['state'] == 'ready' and await page.evaluate("document.getElementById('bRetry').classList.contains('skip')"),
           'Kick off leads straight to the first practice drill, with Skip in the HUD', st0)
        await page.evaluate(prep0['back']); await page.wait_for_timeout(300)
        b = await posted(page, 'back')
        ok(len(b) == 1 and b[0]['handled'] is True and await page.evaluate("document.getElementById('ov').dataset.pause === '1'"), 'back during a practice drill is handled by the page (it pauses)', b)
        # from pause to the fixtures; the drills stay reachable from Options
        await page.click('#mv'); await page.wait_for_timeout(300)
        await page.click('#bOpt'); await page.wait_for_timeout(300)
        await page.click('#oPrac'); await page.wait_for_timeout(400)
        await page.click('#bRetry'); await page.wait_for_timeout(400)
        saves = await posted(page, 'save')
        last = json.loads(saves[-1]['v']) if saves else {}
        st0 = await page.evaluate("__omt.info()")
        ok(last.get('practised') is True and st0['li'] == 0 and st0['state'] == 'brief', 'skipping practice is saved through the bridge and opens fixture 1', (last.get('practised'), st0))
        # the optional slow-aim setting travels through the bridge like every other setting
        await page.evaluate("__omt.home()"); await page.wait_for_timeout(300)
        await page.click('#bOpt'); await page.wait_for_timeout(300)
        has_slow = await page.evaluate("!!document.getElementById('oSlow')")
        if has_slow: await page.click('#oSlow'); await page.wait_for_timeout(200)
        saves = await posted(page, 'save')
        last = json.loads(saves[-1]['v']) if saves else {}
        ok(has_slow and last.get('slow') is True, 'switching slow aim on posts a save with slow: true', (has_slow, last.get('slow')))
        await page.click('#oSlow'); await page.wait_for_timeout(200); await page.click('#x'); await page.wait_for_timeout(200)
        st = await play_level(page, 0)
        saves = await posted(page, 'save')
        last = json.loads(saves[-1]['v']) if saves else {}
        r0 = last.get('done', {}).get(levels[0])
        ok(st and st['state'] == 'goal' and isinstance(r0, dict), 'first level completed from a clean start and its result was posted', (st, list(last.get('done', {}))))
        ok(isinstance(r0, dict) and r0.get('stars') in (1, 2, 3) and isinstance(r0.get('time'), (int, float)) and r0.get('time') > 0 and 'retries' in r0,
           'the posted result carries the move time the stars are graded on', r0)
        ok(not errs, 'no console errors', errs)
        await ctx.close()
        await browser.close()
    bad = [w for c, w in checks if not c]
    print('bridge_test.py: %d of %d checks passed' % (len(checks) - len(bad), len(checks)))
    sys.exit(1 if bad else 0)

asyncio.run(main())
