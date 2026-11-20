#!/usr/bin/env python3
"""Builds one self-contained HTML file from one-man-team/ (used for quick sharing and for the app shell).
Usage: python3 tools/build-single.py [output.html]"""
import re, sys, os, glob
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'one-man-team')
html = open(os.path.join(root, 'index.html')).read()
css = open(os.path.join(root, 'css', 'style.css')).read()
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '</style>')
html = re.sub(r'<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\n', '', html)
def inline(m):
    p = os.path.join(root, m.group(1))
    return '<script>\n' + open(p).read() + '\n</script>' if os.path.exists(p) else ''
html = re.sub(r'<script src="([^"]+)"></script>', inline, html)
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, '..', 'dist', 'one-man-team.html')
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w').write(html)
print('wrote', out, len(html), 'bytes')
