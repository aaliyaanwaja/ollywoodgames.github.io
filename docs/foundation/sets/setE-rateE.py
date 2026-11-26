# Browser check of the set E rating build, adapted from /home/claude/qa/rateB.py and set D's rateD.py.
# 1. The bot plays every test to a goal in the real build (phone viewport). 2. On Test 01 the rating sheet (five scales:
# challenge, fun, fair, time to pick a corner, felt like real football) is filled and saved, and the ratings page shows
# the line. Screenshots go to /home/claude/sets/setE/shots.
import asyncio, subprocess, os
from playwright.async_api import async_playwright
REPO = '/home/claude/ollywoodgames.github.io'; SET = '/home/claude/sets/setE'; OUT = SET + '/shots'
os.makedirs(OUT, exist_ok=True)
async def wait_for(pg, js, tries=120, step=300):
    for _ in range(tries):
        await pg.wait_for_timeout(step)
        if await pg.evaluate(js): return True
    return False
async def main():
    bots = open(REPO + '/tools/bots.js').read().replace("const { FB } = require('./load.js');", "").replace("module.exports = { makeBot };", "window.makeBot = makeBot;")
    scripts = subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('%s/scripts.js')))" % SET]).decode().strip().split('\n')[-1]
    async with async_playwright() as p:
        b = await p.chromium.launch(); c = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True)
        pg = await c.new_page(); errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + SET + '/index.html'); await pg.wait_for_timeout(500)
        await pg.add_script_tag(content='(function(){' + bots + '})(); window.SCRIPTS=' + scripts + ';')
        info = await pg.evaluate("__omt.info()"); print('info:', info)
        await pg.screenshot(path=OUT + '/e0-home.png')
        await pg.evaluate("__omt.setAuto((li,r)=>makeBot(SCRIPTS[li][r]))")
        # every test, played by its bot, must reach the rating sheet after a goal
        for i in range(info['levels']):
            await pg.evaluate("__omt.start(%d)" % i); await pg.wait_for_timeout(300)
            if i == 0: await pg.screenshot(path=OUT + '/e1-brief.png')
            await pg.click('#go')
            ok = await wait_for(pg, "!!document.querySelector('.rt')")
            st = await pg.evaluate("__omt.info()")
            print('Test %02d: %s (fails %d)' % (i + 1, 'goal, rating sheet shown' if ok else 'NO SHEET', st['fails']))
            if i == 0:
                await pg.wait_for_timeout(400); await pg.screenshot(path=OUT + '/e2-sheet.png')
                scales = await pg.evaluate("[...new Set([...document.querySelectorAll('.rt')].map(b=>b.dataset.k))]")
                print('scales on the sheet:', scales)
                for k, v in (('c', 3), ('f', 4), ('r', 5), ('t', 2), ('m', 4)): await pg.click(f'.rt[data-k="{k}"][data-v="{v}"]')
                await pg.click('#sv'); await pg.wait_for_timeout(1500); await pg.screenshot(path=OUT + '/e3-after-save.png')
                saved = await pg.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('omt.setE')||'{}').ratings||{})")
                print('saved in localStorage omt.setE:', saved)
            await pg.evaluate("__omt.home()"); await pg.wait_for_timeout(300)
        await pg.click('#rtb'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=OUT + '/e4-ratings.png')
        print('ratings page:', await pg.evaluate("document.querySelector('pre.log').textContent"))
        print('console errors:', errs); await b.close()
asyncio.run(main())
