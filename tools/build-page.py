#!/usr/bin/env python3
"""Inlines one HTML page's local stylesheets (with fonts) and scripts into a single self-contained file.
Usage: python3 tools/build-page.py <page.html> <out.html>"""
import re, sys, os, base64
src, out = sys.argv[1], sys.argv[2]
base = os.path.dirname(os.path.abspath(src))
html = open(src).read()
def css(m):
    p = os.path.normpath(os.path.join(base, m.group(1))); d = os.path.dirname(p); c = open(p).read()
    def font(f):
        data = open(os.path.normpath(os.path.join(d, f.group(1))), 'rb').read()
        return 'url("data:font/woff2;base64,' + base64.b64encode(data).decode() + '")'
    return '<style>\n' + re.sub(r'url\("([^"]+\.woff2)"\)', font, c) + '</style>'
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)
html = re.sub(r'<script src="([^"]+)"></script>', lambda m: '<script>\n' + open(os.path.normpath(os.path.join(base, m.group(1)))).read() + '\n</script>', html)
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w').write(html); print('wrote', out, len(html), 'bytes')
