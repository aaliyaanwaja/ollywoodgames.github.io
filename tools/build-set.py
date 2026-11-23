#!/usr/bin/env python3
"""Builds a single-file special build (for example a rating set) from the current game code with a chosen list of levels.
Usage: python3 tools/build-set.py <out.html> '<json config>' <level-file.js> [<level-file.js> ...]
Level files are loaded in the order given, in place of the normal packs; story.js is kept, pars.js and practice.js are
dropped unless listed. The config becomes window.OMT_CONFIG, for example
  {"rate": true, "assist": false, "practice": false, "slow": false, "unlock": true, "key": "omt.setA", "title": "Set A"}"""
import re, sys, os, base64, json
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'one-man-team')
out, cfg, files = sys.argv[1], json.loads(sys.argv[2]), sys.argv[3:]
html = open(os.path.join(root, 'index.html')).read()
css = open(os.path.join(root, 'css', 'style.css')).read()
font = lambda m: 'url("data:font/woff2;base64,' + base64.b64encode(open(os.path.join(root, 'fonts', m.group(1)), 'rb').read()).decode() + '")'
css = re.sub(r'url\("\.\./fonts/([^"]+)"\)', font, css)
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '</style>')
html = re.sub(r'<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\n', '', html)
html = re.sub(r'<script src="js/levels/(pack\d+|pars|practice)\.js"></script>\n', '', html)
levels = '<script>window.OMT_CONFIG = ' + json.dumps(cfg) + ';</script>\n' + ''.join('<script>\n' + open(f).read() + '\n</script>\n' for f in files)
html = html.replace('<script src="js/levels/story.js"></script>', levels + '<script src="js/levels/story.js"></script>' if cfg.get('story', True) else levels)
html = re.sub(r'<script src="([^"]+)"></script>', lambda m: '<script>\n' + open(os.path.join(root, m.group(1))).read() + '\n</script>', html)
if cfg.get('title'): html = re.sub(r'<title>[^<]*</title>', '<title>' + cfg['title'] + '</title>', html)
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w').write(html); print('wrote', out, len(html), 'bytes')
