"""Render the retention mock screens to PNG.  python3 render.py [outdir]  (default /home/claude/shots)"""
import os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/shots'
PAGES = {  # file: (width, height, scale)
    'retention-home-daily.html': (390, 844, 2),
    'retention-daily-result.html': (390, 844, 2),
    'retention-fail-offer.html': (390, 844, 2),
    'retention-share-card.html': (360, 450, 3),
}
os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, (w, h, s) in PAGES.items():
        pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=s)
        pg.goto('file://' + os.path.join(HERE, name))
        pg.evaluate('document.fonts.ready')
        pg.wait_for_timeout(200)
        out = os.path.join(OUT, name.replace('.html', '.png'))
        pg.screenshot(path=out)
        print(out)
    b.close()
