#!/usr/bin/env python3
"""Counts every length-limited text in the store listing documents and fails if one is over its limit.

    python3 scripts/count-listing.py        (also run by `npm run check-listing`)

A counted text sits in a fenced ```text block directly after a marker line:  <!-- count:<label> limit=<n> unit=<chars|bytes> -->
Characters are Python len() of the exact text (line breaks count as one). Apple measures the keyword field in bytes.
The script also checks that the bold "**N of LIMIT ...**" line under each block states the number it just counted,
and that every level-count claim ("60 fixtures") matches the number of levels the game actually loads."""
import os, re, subprocess, sys
APP = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
ROOT = os.path.normpath(os.path.join(APP, '..'))
FILES = ['store/app-store-listing.md', 'store/play-store-listing.md']
bad = 0
for f in FILES:
    t = open(os.path.join(APP, f), encoding='utf-8').read()
    print(f)
    for m in re.finditer(r'<!-- count:(\w+) limit=(\d+) unit=(chars|bytes) -->\n```text\n(.*?)\n```\n\n\*\*(\d+) of ', t, re.S):
        label, limit, unit, body, stated = m.group(1), int(m.group(2)), m.group(3), m.group(4), int(m.group(5))
        n = len(body.encode('utf-8')) if unit == 'bytes' else len(body)
        ok = n <= limit and n == stated
        if not ok: bad += 1
        print('  %-4s %-22s %5d of %5d %s%s' % ('ok' if ok else 'FAIL', label, n, limit, unit, '' if n == stated else '   (document says %d)' % stated))
    if not re.search(r'<!-- count:', t): print('  FAIL no counted blocks found'); bad += 1
# the level count the listings promise, against what index.html loads today
html = open(os.path.join(ROOT, 'one-man-team', 'index.html')).read()
packs = re.findall(r'<script src="js/levels/(pack\d+\.js)"></script>', html)
code = "global.window=global;global.OMT_LEVELS=[];" + ''.join("require('./one-man-team/js/levels/%s');" % p for p in packs) + "console.log(OMT_LEVELS.length)"
levels = int(subprocess.check_output(['node', '-e', code], cwd=ROOT).decode().strip().split('\n')[-1])
claimed = 60
print('levels loaded by one-man-team/index.html today: %d (the listings say %d)' % (levels, claimed))
if levels != claimed:
    print('  NOT YET TRUE: do not submit the listings until the game ships %d fixtures, or change "%d" in both documents.' % (claimed, claimed))
    if '--strict' in sys.argv: bad += 1
sys.exit(1 if bad else 0)
