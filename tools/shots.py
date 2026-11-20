#!/usr/bin/env python3
"""Visual QA: drives the real page in a phone-sized headless browser and saves screenshots.
Usage: python3 tools/shots.py <prefix> [level=1] [outdir=/home/claude/shots]
Saves <prefix>-home.png, -brief.png, -ready.png, -play.png (mid-move, bot playing), -goal.png (result sheet over the replay),
-home2.png (home after a win) and prints any console errors. Needs: pip playwright (already installed here)."""
import asyncio, sys, os, subprocess
from playwright.async_api import async_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
prefix = sys.argv[1] if len(sys.argv) > 1 else 'qa'
level = int(sys.argv[2]) if len(sys.argv) > 2 else 1
out = sys.argv[3] if len(sys.argv) > 3 else '/home/claude/shots'
os.makedirs(out, exist_ok=True)
async def main():
    bots = open(os.path.join(ROOT, 'tools', 'bots.js')).read().replace("const { FB } = require('./load.js');", "").replace("module.exports = { makeBot };", "window.makeBot = makeBot;")
    scripts = subprocess.check_output(['node', '-e', "const {SCRIPTS}=require('%s/tools/load.js');console.log(JSON.stringify(SCRIPTS))" % ROOT]).decode().strip().split('\n')[-1]
    async with async_playwright() as p:
        b = await p.chromium.launch()
        c = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True)
        pg = await c.new_page(); errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + os.path.join(ROOT, 'one-man-team', 'index.html')); await pg.wait_for_timeout(500)
        await pg.screenshot(path=f'{out}/{prefix}-home.png')
        await pg.add_script_tag(content='(function(){' + bots + '})(); window.SCRIPTS=' + scripts + ';')
        await pg.evaluate(f"__omt.start({level - 1})"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=f'{out}/{prefix}-brief.png')
        await pg.click('#go'); await pg.wait_for_timeout(400)
        await pg.screenshot(path=f'{out}/{prefix}-ready.png')
        await pg.evaluate("__omt.setAuto((li,r)=>makeBot(SCRIPTS[li][r]))")
        await pg.evaluate(f"__omt.start({level - 1})"); await pg.click('#go')
        shot = False
        for i in range(120):
            await pg.wait_for_timeout(250)
            st = await pg.evaluate("__omt.info()")
            if not shot and st['round'] >= 1 and i > 3: await pg.wait_for_timeout(900); await pg.screenshot(path=f'{out}/{prefix}-play.png'); shot = True
            if st['state'] in ('goal', 'failed'): break
        await pg.wait_for_timeout(1800); await pg.screenshot(path=f'{out}/{prefix}-goal.png')
        print('final state:', st, '| console errors:', [e for e in errs if 'ERR_FILE_NOT_FOUND' not in e])
        await b.close()
asyncio.run(main())
