#!/usr/bin/env python3
"""Draws every icon, the splash image and the Play feature graphic from code, so they can be regenerated.

The logo is the Ghost trail identity (docs/brand/2026-11-27-ghost-trail-applied.md). Its icon and wordmark are drawn
by tools/brand.py, shared with the web build (tools/make-brand.py); this script lays them out for each platform.

    npm run art          (= python3 scripts/make-art.py)

Writes:
  app/assets/icon.png                   1024  full-square launcher icon (legacy Android, Expo)
  app/assets/adaptive-foreground.png    1024  adaptive icon foreground, transparent, art inside the safe zone
  app/assets/adaptive-background.png    1024  adaptive icon background (felt)
  app/assets/adaptive-monochrome.png    1024  themed-icon silhouette (Android 13+)
  app/assets/splash-icon.png            1024  transparent: the icon tile with its ink offset shadow, on the paper splash
  app/store/play-icon-512.png           512   Play Console icon (32-bit PNG)
  app/store/app-store-icon-1024.png     1024  App Store icon (24-bit PNG, no alpha)
  app/store/feature-graphic-1024x500.png      Play Console feature graphic (24-bit PNG, no alpha)
  app/store/preview-*.png                     contact sheets for checking small sizes; not for upload
  one-man-team/icons/icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png, icon-1024.png   (web manifest)
  one-man-team/icons/favicon.svg, favicon-32.png, favicon-16.png, favicon.ico   (the small-size redraw)
  one-man-team/icons/apple-touch-icon-180.png

Everything is SVG, rasterised by headless Chromium through Playwright. Look and palette follow
docs/ART_DIRECTION.md and the icon / feature-graphic briefs in docs/marketing/store-assets-plan.md; the figure
geometry follows figure() in one-man-team/js/render.js. Needs: python3, playwright (chromium), Pillow, and for
tools/brand.py uharfbuzz and fonttools."""
import asyncio, base64, io, math, os, sys
from playwright.async_api import async_playwright
from PIL import Image

APP = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
ROOT = os.path.normpath(os.path.join(APP, '..'))
GAME = os.path.join(ROOT, 'one-man-team')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import brand as B                                            # the Ghost trail icon and wordmark
ASSETS, STORE, WEB = os.path.join(APP, 'assets'), os.path.join(APP, 'store'), os.path.join(GAME, 'icons')

# ---- the name appears in one drawn asset here (the feature graphic), as the Ghost trail wordmark from tools/brand.py
# (B.LINES). Change it there if the title changes.

PAPER, PAPER_SHADE, INK, INK_SOFT = '#F2EAD8', '#E6DCC3', '#14213D', '#4A5573'
FELT, FELT_DARK, CHALK = '#2F7D4F', '#2A7046', '#FBF8F0'
TOMATO, MUSTARD, SKY = '#E4572E', '#F2B705', '#8EC5D6'
SKIN, HAIR = '#F1CDA6', '#3B2A20'

# "1" from Barlow Condensed 700 (one-man-team/fonts), as an outline so that no font is needed to draw the icon.
# Font units, y up, bounds x 9..248, y 0..700.
ONE = ('M115 700H236Q241 700 244.5 696.5Q248 693 248 688V12Q248 7 244.5 3.5Q241 0 236 0H119Q114 0 110.5 3.5Q107 7 107 12'
       'V558Q107 562 102 562L25 553H23Q12 553 12 564L9 650Q9 660 18 664L100 697Q108 700 115 700Z')

def f(v): return ('%.2f' % v).rstrip('0').rstrip('.')

def numeral(cx, cy, h, fill, opacity=1):
    """The squad number 1, centred on (cx, cy), cap height h."""
    s = h / 700.0
    # optical centre of the glyph: the stem, not the flag
    return '<path d="%s" fill="%s" opacity="%s" transform="translate(%s %s) scale(%s %s) translate(-150 -350)"/>' % (ONE, fill, f(opacity), f(cx), f(cy), f(s), f(-s))

def shadow(cx, cy, r, strength=0.30):
    return '<circle cx="%s" cy="%s" r="%s" fill="%s" opacity="%s" filter="url(#soft)"/>' % (f(cx + r * 0.10), f(cy + r * 0.14), f(r * 1.02), '#0B1A12', f(strength))

def figure(cx, cy, R, kind='us', live=False, num=True, heading=-90, ghost=False, mono=False, body=1.22, lift=0.60, num_y=0.41):
    """A tabletop figure seen from above. R is the base radius. heading in degrees, 0 = facing right, -90 = facing up.
    kind: 'us' (tomato rim, paper deck, number), 'them' (sky deck, banded ink rim, striped shirt)."""
    o = []
    line = R * 0.085                                    # the "2px ink line", scaled
    rim = R * 0.30 / 1.6 * 1.25                         # rim a little heavier than in play so it survives 48 px
    if mono:
        prim = sec = shirt = skin = hair = ink = '#000'
    else:
        ink = INK
        prim, sec = (TOMATO, PAPER) if kind == 'us' else (INK, SKY)
        shirt, skin, hair = (TOMATO if kind == 'us' else SKY), SKIN, HAIR
    if live and not mono:
        o.append('<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (f(cx), f(cy), f(R * 1.335), ink))
        o.append('<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (f(cx), f(cy), f(R * 1.275), MUSTARD))
        o.append('<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (f(cx), f(cy), f(R * 1.075), ink))
    if mono:
        # silhouette: a ring for the base, the figure solid, the number solid
        o.append('<circle cx="%s" cy="%s" r="%s" fill="none" stroke="#000" stroke-width="%s" %s/>' % (
            f(cx), f(cy), f(R * (1.16 if live else 0.9)), f(R * (0.26 if live else 0.2)), 'stroke-dasharray="%s %s" stroke-linecap="round"' % (f(R * 0.2), f(R * 0.36)) if ghost else ''))
    else:
        o.append('<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="%s" stroke-width="%s"/>' % (f(cx), f(cy), f(R), prim if kind == 'us' else sec, ink, f(line)))
        o.append('<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (f(cx), f(cy), f(R - rim), sec if kind == 'us' else prim))
        if kind == 'them':                              # banded rim, so they never read as ours
            rr = R - rim / 2
            dash = 2 * math.pi * rr / 18
            o.append('<circle cx="%s" cy="%s" r="%s" fill="none" stroke="%s" stroke-width="%s" stroke-dasharray="%s %s"/>' % (f(cx), f(cy), f(rr), prim, f(rim * 0.72), f(dash * 0.5), f(dash * 0.5)))
        # a small highlight on the rim, as in play
        a0, a1, rr = -2.75, -1.95, R - rim / 2
        o.append('<path d="M%s %s A%s %s 0 0 1 %s %s" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="%s" stroke-linecap="round"/>' % (
            f(cx + rr * math.cos(a0)), f(cy + rr * math.sin(a0)), f(rr), f(rr), f(cx + rr * math.cos(a1)), f(cy + rr * math.sin(a1)), f(R * 0.055)))
    # the figure. Ours stands on the top half of the base so the number has the bottom half to itself.
    u = R / 1.6 * body
    big = kind != 'us'
    sw, sd, hr = (0.72 if big else 0.54) * u, (0.42 if big else 0.34) * u, (0.43 if big else 0.36) * u
    fy = cy + (0 if big or not num else -lift * R / 1.6 * 1.05)
    g = ['<g transform="translate(%s %s) rotate(%s)">' % (f(cx), f(fy), f(heading))]
    ol = 0.10 * u                                       # outline around limbs
    arm, reach = 0.26 * u, 0.42 * u
    for side in (-1, 1):                                # arms mid-stride: one forward, one trailing
        y = side * (sw + 0.02 * u); x1 = reach * (1.05 if side < 0 else 0.6)
        g.append('<path d="M0 %s L%s %s" stroke="%s" stroke-width="%s" stroke-linecap="round"/>' % (f(y), f(x1), f(y), ink, f(arm + 2 * ol)))
        g.append('<path d="M0 %s L%s %s" stroke="%s" stroke-width="%s" stroke-linecap="round"/>' % (f(y), f(x1), f(y), shirt, f(arm)))
        if not mono: g.append('<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (f(x1 + (0.1 if x1 > 0 else -0.1) * u), f(y), f(0.13 * u), skin))
    g.append('<path d="M0 %s L0 %s" stroke="%s" stroke-width="%s" stroke-linecap="round"/>' % (f(-sw), f(sw), ink, f(sd * 2 + 2 * ol)))
    g.append('<path d="M0 %s L0 %s" stroke="%s" stroke-width="%s" stroke-linecap="round"/>' % (f(-sw), f(sw), shirt, f(sd * 2)))
    if kind == 'them' and not mono:                     # their kit: stripes
        for y in (-0.56 * u, 0.56 * u):
            g.append('<path d="M%s %s L%s %s" stroke="%s" stroke-width="%s"/>' % (f(-sd), f(y), f(sd), f(y), prim, f(0.2 * u)))
    hx = 0.06 * u
    if mono:
        g.append('<circle cx="%s" cy="0" r="%s" fill="#000"/>' % (f(hx), f(hr + ol)))
    else:
        g.append('<circle cx="%s" cy="0" r="%s" fill="%s" stroke="%s" stroke-width="%s"/>' % (f(hx), f(hr), skin, ink, f(ol * 0.9)))
        a, b, r2 = math.pi * 0.62, math.pi * 1.38, hr - ol * 0.3     # hair: the back of the head
        g.append('<path d="M%s %s A%s %s 0 0 1 %s %s Z" fill="%s"/>' % (f(hx + r2 * math.cos(a)), f(r2 * math.sin(a)), f(r2), f(r2), f(hx + r2 * math.cos(b)), f(r2 * math.sin(b)), hair))
    g.append('</g>')
    o.append(''.join(g))
    if num and kind == 'us':
        o.append(numeral(cx, cy + R * num_y, R * 0.56, ink))
    s = ''.join(o)
    return '<g opacity="%s">%s</g>' % (f(0.36 if not mono else 0.45), s) if ghost else s

def chalk_ghost(cx, cy, R, heading=-90, body=1.1, lift=0.63, num_y=0.40):
    """The same figure where he was a moment ago, drawn in chalk on the cloth: dashed ring, chalk silhouette, chalk number."""
    dash = 2 * math.pi * R / 14
    s = '<circle cx="%s" cy="%s" r="%s" fill="%s" fill-opacity=".13"/>' % (f(cx), f(cy), f(R), CHALK)
    s += '<circle cx="%s" cy="%s" r="%s" fill="none" stroke="%s" stroke-opacity=".8" stroke-width="%s" stroke-linecap="round" stroke-dasharray="%s %s"/>' % (
        f(cx), f(cy), f(R * 0.95), CHALK, f(R * 0.1), f(dash * 0.46), f(dash * 0.54))
    u = R / 1.6 * body
    sw, sd, hr = 0.54 * u, 0.34 * u, 0.36 * u
    g = '<g transform="translate(%s %s) rotate(%s)" opacity=".62">' % (f(cx), f(cy - lift * R / 1.6), f(heading))
    for side, k in ((-1, 1.05), (1, 0.6)):
        y = side * (sw + 0.02 * u)
        g += '<path d="M0 %s L%s %s" stroke="%s" stroke-width="%s" stroke-linecap="round"/>' % (f(y), f(0.42 * u * k), f(y), CHALK, f(0.3 * u))
    g += '<path d="M0 %s L0 %s" stroke="%s" stroke-width="%s" stroke-linecap="round"/>' % (f(-sw), f(sw), CHALK, f(sd * 2))
    g += '</g>'
    s += g
    s += '<g transform="translate(%s %s) rotate(%s)"><circle cx="%s" cy="0" r="%s" fill="%s" stroke="%s" stroke-width="%s"/></g>' % (
        f(cx), f(cy - lift * R / 1.6), f(heading), f(0.06 * u), f(hr), FELT, CHALK, f(0.11 * u))
    s += numeral(cx, cy + R * num_y, R * 0.52, CHALK, 0.9)
    return s

def ghost_base(cx, cy, R, num=True):
    """An earlier position as the game draws it on the cloth: a dashed chalk ring with the number."""
    dash = 2 * math.pi * R / 16
    s = '<circle cx="%s" cy="%s" r="%s" fill="%s" fill-opacity=".1"/>' % (f(cx), f(cy), f(R), CHALK)
    s += '<circle cx="%s" cy="%s" r="%s" fill="none" stroke="%s" stroke-opacity=".82" stroke-width="%s" stroke-linecap="round" stroke-dasharray="%s %s"/>' % (f(cx), f(cy), f(R), CHALK, f(R * 0.09), f(dash * 0.5), f(dash * 0.5))
    if num: s += numeral(cx, cy, R * 0.8, CHALK, 0.9)
    return s

def ball(cx, cy, r):
    s = shadow(cx, cy, r, 0.28)
    s += '<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="%s" stroke-width="%s"/>' % (f(cx), f(cy), f(r), CHALK, INK, f(r * 0.2))
    s += '<path d="M%s %s l%s %s l%s %s l%s %s l%s %s Z" fill="%s"/>' % (f(cx), f(cy - r * 0.42), f(r * 0.4), f(r * 0.29), f(-r * 0.15), f(r * 0.47), f(-r * 0.5), 0, f(-r * 0.15), f(-r * 0.47), INK)
    return s

DEFS = '''<defs>
<filter id="soft" x="-40%%" y="-40%%" width="180%%" height="180%%"><feGaussianBlur stdDeviation="%s"/></filter>
<pattern id="weave" width="%s" height="%s" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
  <rect width="%s" height="%s" fill="#000" opacity=".045"/><rect y="%s" width="%s" height="%s" fill="#fff" opacity=".03"/></pattern>
<radialGradient id="lamp" cx="50%%" cy="42%%" r="75%%"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".10"/></radialGradient>
<pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="7" cy="7" r="2.1" fill="%s" opacity=".16"/></pattern>
%s</defs>'''

def defs(scale=1.0, extra=''):
    w = 9 * scale
    return DEFS % (f(14 * scale), f(w), f(w), f(w), f(w / 2), f(w / 2), f(w), f(w / 2), INK, extra)

def felt(w, h, bands, band_h, chalk=''):
    """Felt cloth: two greens in mowing bands, a woven texture, soft table-lamp shading, chalk on top."""
    s = '<rect width="%d" height="%d" fill="%s"/>' % (w, h, FELT)
    for y in bands: s += '<rect y="%s" width="%d" height="%s" fill="%s"/>' % (f(y), w, f(band_h), FELT_DARK)
    s += '<rect width="%d" height="%d" fill="url(#weave)"/>' % (w, h)
    s += chalk
    s += '<rect width="%d" height="%d" fill="url(#lamp)"/>' % (w, h)
    return s

def chalk_line(d, w, dash=None, opacity=0.9):
    return '<path d="%s" fill="none" stroke="%s" stroke-opacity="%s" stroke-width="%s" stroke-linecap="round" %s/>' % (d, CHALK, f(opacity), f(w), ('stroke-dasharray="%s"' % dash) if dash else '')

# ------------------------------------------------------------------ icon ------------------------------------------------------------------
# The Ghost trail icon comes from tools/brand.py; the helpers above draw the feature graphic.

def svg(w, h, body, extra_defs='', scale=1.0, bg=None):
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">%s%s%s</svg>'
            % (w, h, w, h, defs(scale, extra_defs), ('<rect width="%d" height="%d" fill="%s"/>' % (w, h, bg)) if bg else '', body))

def sized(src, w, h):
    """tools/brand.py draws with a viewBox only; render() wants the pixel size on the root element."""
    return src.replace('<svg ', '<svg width="%d" height="%d" ' % (w, h), 1)

# The Ghost trail icon. Full bleed: launchers and stores apply their own mask.
def icon_full():        return sized(B.icon(), 1024, 1024)
def icon_small():       return sized(B.icon_small(), 1024, 1024)                       # favicons: 16-48 px redraw
def icon_maskable():    return sized(B.icon(0.76), 1024, 1024)                          # art inside the 80 % safe circle
def adaptive_bg():
    # felt full bleed; the chalk arc placed inside the 72 dp that a launcher shows, so it is not masked away
    return sized(B.svg(1024, 1024, B.felt() + '<g transform="translate(171 171) scale(.666)">%s</g>' % B.icon_chalk()), 1024, 1024)
def adaptive_fg():      return sized(B.svg(1024, 1024, B.icon_art(0.58)), 1024, 1024)      # inside the 66 dp of 108 dp safe circle
def adaptive_mono():    return sized(B.icon_mono(0.58), 1024, 1024)

def splash():
    # The icon as a printed tile on the paper splash: rounded square, 2px ink edge and a hard ink offset shadow.
    x, s, r = 132, 720, 158
    body = '<rect x="%d" y="%d" width="%d" height="%d" rx="%d" fill="%s"/>' % (x + 26, x + 26, s, s, r, INK)
    body += '<clipPath id="t"><rect x="%d" y="%d" width="%d" height="%d" rx="%d"/></clipPath>' % (x, x, s, s, r)
    body += '<g clip-path="url(#t)"><g transform="translate(%d %d) scale(%s)">%s</g></g>' % (x, x, f(s / 1024), B.icon_body())
    body += '<rect x="%d" y="%d" width="%d" height="%d" rx="%d" fill="none" stroke="%s" stroke-width="14"/>' % (x, x, s, s, r, INK)
    return sized(B.svg(1024, 1024, body), 1024, 1024)

# ------------------------------------------------------------ feature graphic ------------------------------------------------------------
def feature():
    W, H = 1024, 500
    # the pitch runs left to right: mowing bands are vertical, the goal is at the right edge
    s = '<rect width="%d" height="%d" fill="%s"/>' % (W, H, FELT)
    for x in range(0, W, 256): s += '<rect x="%d" width="128" height="%d" fill="%s"/>' % (x + 128, H, FELT_DARK)
    s += '<rect width="%d" height="%d" fill="url(#weave)"/>' % (W, H)
    ch = ''
    # penalty area, six-yard box, penalty spot and arc, goal line; slightly uneven like chalk
    ch += chalk_line('M1030 62 L742 60 L744 441 L1030 438', 7, None, 0.62)
    ch += chalk_line('M1030 162 L905 161 L906 340 L1030 339', 7, None, 0.62)
    ch += chalk_line('M743 176 A 96 96 0 0 0 744 325', 7, None, 0.62)
    ch += '<circle cx="838" cy="250" r="6" fill="%s" opacity=".7"/>' % CHALK
    ch += chalk_line('M1000 0 L1001 500', 7, None, 0.62)
    s += ch
    # the goal: posts and a net fragment beyond the line
    s += '<g opacity=".8"><path d="M1001 196 H1030 M1001 304 H1030" stroke="%s" stroke-width="8"/>' % CHALK
    for i in range(1, 6): s += '<path d="M%d 196 V304" stroke="%s" stroke-opacity=".35" stroke-width="2"/>' % (1001 + i * 6, CHALK)
    for i in range(1, 9): s += '<path d="M1001 %d H1030" stroke="%s" stroke-opacity=".35" stroke-width="2"/>' % (196 + i * 12, CHALK)
    s += '</g>'
    R = 45
    # the run: one figure, three times, bending towards goal: chalk where he started, fuller in the middle,
    # solid with the mustard ring at the front
    p1, p2, p3 = (536, 404), (668, 330), (806, 226)
    run = 'M%d %d C 590 400, 626 372, %d %d S 752 262, %d %d' % (p1[0] + 40, p1[1] - 12, p2[0], p2[1], p3[0], p3[1])
    s += chalk_line(run, 7.5, '12 17', 0.95)
    # the pass: from where the same figure stood earlier, across the run, into his path
    q = (584, 128)
    s += '<path d="M%d %d L%d %d" fill="none" stroke="%s" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 14" opacity=".95"/>' % (q[0] + 44, q[1] + 20, p3[0] - 84, p3[1] - 40, MUSTARD)
    s += chalk_ghost(q[0], q[1], R * 0.9, heading=20, body=0.92, lift=0.74, num_y=0.46)
    # defenders in ink and sky: one holding the line, one turning the wrong way
    for (x, y, hd) in ((716, 118, 150), (884, 388, 205)):
        s += shadow(x, y, R * 0.94, 0.3) + figure(x, y, R * 0.94, kind='them', heading=hd, num=False, body=1.1)
    # keeper in mustard on his line
    s += shadow(962, 258, R * 0.86, 0.3)
    s += figure(962, 258, R * 0.86, kind='them', heading=190, num=False, body=1.1).replace(SKY, MUSTARD)
    s += chalk_ghost(p1[0], p1[1], R * 0.9, heading=-14, body=0.92, lift=0.74, num_y=0.46)
    s += shadow(p2[0], p2[1], R, 0.2) + '<circle cx="%d" cy="%d" r="%d" fill="%s"/>' % (p2[0], p2[1], R, FELT) + '<g opacity=".8">%s</g>' % figure(p2[0], p2[1], R, heading=-34, body=0.92, lift=0.72, num_y=0.46)
    s += shadow(p3[0], p3[1], R * 1.33, 0.34) + figure(p3[0], p3[1], R, live=True, heading=-30, body=0.92, lift=0.72, num_y=0.46)
    s += ball(p3[0] - 70, p3[1] - 36, 13)
    s += '<rect width="%d" height="%d" fill="url(#lamp)"/>' % (W, H)
    # the title: a cream ticket stub, perforated on its right edge, hard ink offset shadow, Anton
    x, y, w, h, n = 150, 150, 318, 200, 8
    def stub(dx, dy):
        d = 'M%d %d H%d' % (x + dx + 6, y + dy, x + dx + w)
        step = h / n
        for i in range(n): d += ' a%s %s 0 0 0 0 %s' % (f(step / 2 * 0.62), f(step / 2), f(step)) if False else ' v%s a%s %s 0 0 0 0 %s v%s' % (f(step * 0.2), f(step * 0.3), f(step * 0.3), f(step * 0.6), f(step * 0.2))
        d += ' H%d a6 6 0 0 1 -6 -6 V%d a6 6 0 0 1 6 -6 Z' % (x + dx + 6, y + dy + 6)
        return d
    s += '<path d="%s" fill="%s"/>' % (stub(7, 7), INK)
    s += '<path d="%s" fill="%s" stroke="%s" stroke-width="4" stroke-linejoin="round"/>' % (stub(0, 0), PAPER, INK)
    s += '<clipPath id="tk"><path d="%s"/></clipPath><rect x="%d" y="%d" width="120" height="%d" fill="url(#dots)" clip-path="url(#tk)"/>' % (stub(0, 0), x + w - 130, y, h)
    # the Ghost trail wordmark, stacked, outlined (tools/brand.py): ink letters, tomato offset print, dashed tomato ghost
    tx = x + 22
    s += '<path d="M%d %d H%d" stroke="%s" stroke-width="4"/>' % (tx + 4, y + 30, x + w - 34, INK)
    wm, ww, wh = B.wordmark(lines=B.LINES, lh=0.9, shadow=0.042, ghost_dx=0.13, ghost_w=0.03, dash=(0.075, 0.05), uid='fg', main=INK)
    k = min((w - 22 - 34) / ww, 140 / wh)
    s += '<g transform="translate(%s %s) scale(%s)">%s</g>' % (f(tx), f(y + 44), '%.5f' % k, wm[wm.index('>') + 1:-len('</svg>')])
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">%s%s</svg>'
            % (W, H, W, H, defs(0.55), s))

# ------------------------------------------------------------------ output ------------------------------------------------------------------
async def render(page, svg_src, w, h, transparent=False):
    await page.set_viewport_size({'width': w, 'height': h})
    await page.set_content('<html><body style="margin:0;background:transparent">%s</body></html>' % svg_src.replace('width="%d" height="%d"' % (int(svg_src.split('width="')[1].split('"')[0]), int(svg_src.split('height="')[1].split('"')[0])), 'width="%d" height="%d" style="display:block"' % (w, h), 1))
    await page.evaluate('document.fonts.ready')
    return Image.open(io.BytesIO(await page.screenshot(omit_background=transparent, type='png')))

def save(img, path, mode):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.convert(mode).save(path, optimize=True)
    print('  %-52s %dx%d %s %d KB' % (os.path.relpath(path, ROOT), img.width, img.height, mode, os.path.getsize(path) // 1024))

def rounded(img, radius_frac):
    """Preview only: the icon as a launcher would mask it."""
    s = 4; m = Image.new('L', (img.width * s, img.height * s), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(m).rounded_rectangle([0, 0, m.width - 1, m.height - 1], radius=int(m.width * radius_frac), fill=255)
    out = img.convert('RGBA'); out.putalpha(m.resize(img.size, Image.LANCZOS)); return out

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        page = await (await b.new_context(device_scale_factor=1)).new_page()
        print('app assets')
        full = await render(page, icon_full(), 1024, 1024)
        save(full, os.path.join(ASSETS, 'icon.png'), 'RGB')
        fg = await render(page, adaptive_fg(), 1024, 1024, True); save(fg, os.path.join(ASSETS, 'adaptive-foreground.png'), 'RGBA')
        bg = await render(page, adaptive_bg(), 1024, 1024); save(bg, os.path.join(ASSETS, 'adaptive-background.png'), 'RGB')
        mono = await render(page, adaptive_mono(), 1024, 1024, True); save(mono, os.path.join(ASSETS, 'adaptive-monochrome.png'), 'RGBA')
        sp = await render(page, splash(), 1024, 1024, True); save(sp, os.path.join(ASSETS, 'splash-icon.png'), 'RGBA')
        print('store')
        save(await render(page, icon_full(), 512, 512), os.path.join(STORE, 'play-icon-512.png'), 'RGBA')
        save(full, os.path.join(STORE, 'app-store-icon-1024.png'), 'RGB')                  # Apple rejects an icon with alpha
        feat = await render(page, feature(), 1024, 500); save(feat, os.path.join(STORE, 'feature-graphic-1024x500.png'), 'RGB')
        print('web icons')
        open(os.path.join(WEB, 'icon.svg'), 'w').write(B.icon() + '\n')
        open(os.path.join(WEB, 'favicon.svg'), 'w').write(B.icon_small() + '\n')
        print('  %-52s %d KB' % (os.path.relpath(os.path.join(WEB, 'icon.svg'), ROOT), os.path.getsize(os.path.join(WEB, 'icon.svg')) // 1024))
        save(full, os.path.join(WEB, 'icon-1024.png'), 'RGB')
        save(await render(page, icon_full(), 512, 512), os.path.join(WEB, 'icon-512.png'), 'RGB')
        save(await render(page, icon_full(), 192, 192), os.path.join(WEB, 'icon-192.png'), 'RGB')
        save(await render(page, icon_maskable(), 512, 512), os.path.join(WEB, 'icon-maskable-512.png'), 'RGB')
        save(await render(page, icon_full(), 180, 180), os.path.join(WEB, 'apple-touch-icon-180.png'), 'RGB')
        # favicons: the small-size redraw, rasterised at each size rather than scaled down from one image
        fav = {px: await render(page, icon_small(), px, px) for px in (16, 32, 48)}
        save(fav[32], os.path.join(WEB, 'favicon-32.png'), 'RGB'); save(fav[16], os.path.join(WEB, 'favicon-16.png'), 'RGB')
        ico = os.path.join(WEB, 'favicon.ico')
        fav[48].convert('RGB').save(ico, sizes=[(16, 16), (32, 32), (48, 48)], append_images=[fav[16].convert('RGB'), fav[32].convert('RGB')])
        print('  %-52s 16, 32, 48 %d KB' % (os.path.relpath(ico, ROOT), os.path.getsize(ico) // 1024))

        print('previews (for checking, not for upload)')
        # 1. the icon at launcher sizes, on white and on dark, square-rounded and circular
        sheet = Image.new('RGB', (980, 560), '#FFFFFF'); sheet.paste(Image.new('RGB', (980, 280), '#1B1B1F'), (0, 280))
        for row, y in ((0, 30), (1, 310)):
            x = 30
            for px in (48, 72, 96, 144, 192):
                small = await render(page, icon_full(), px, px)
                for frac in (0.22, 0.5):
                    r = rounded(small, frac); sheet.paste(r, (x, y + (192 - px) // 2), r); x += px + 18
        save(sheet, os.path.join(STORE, 'preview-icon-sizes.png'), 'RGB')
        # 2. the adaptive icon as Android composes it: 108 dp layers, 72 dp visible, in three mask shapes; and themed
        comp = Image.alpha_composite(bg.convert('RGBA'), fg)
        vis = comp.crop((171, 171, 853, 853))          # the middle 72/108
        sheet = Image.new('RGB', (1100, 330), '#ECECEC'); x = 30
        for frac in (0.5, 0.30, 0.16):
            r = rounded(vis.resize((256, 256), Image.LANCZOS), frac); sheet.paste(r, (x, 37), r); x += 276
        themed = Image.new('RGBA', (1024, 1024), '#D7E3FF'); tint = Image.new('RGBA', (1024, 1024), '#17305E'); tint.putalpha(mono.split()[3])
        themed = Image.alpha_composite(themed, tint).crop((171, 171, 853, 853)).resize((192, 192), Image.LANCZOS)
        r = rounded(themed, 0.5); sheet.paste(r, (x, 69), r); x += 212
        tiny = rounded(vis.resize((48, 48), Image.LANCZOS), 0.5); sheet.paste(tiny, (x, 141), tiny)
        save(sheet, os.path.join(STORE, 'preview-adaptive.png'), 'RGB')
        # 3. the splash as the phone shows it: paper background, roundel in the middle
        ph = Image.new('RGB', (540, 1170), PAPER); s2 = sp.resize((330, 330), Image.LANCZOS); ph.paste(s2, (105, 420), s2)
        save(ph, os.path.join(STORE, 'preview-splash.png'), 'RGB')
        # 4. the feature graphic with the outer 15 per cent dimmed
        dim = feat.convert('RGBA'); veil = Image.new('RGBA', dim.size, (0, 0, 0, 120)); hole = Image.new('L', dim.size, 255)
        from PIL import ImageDraw
        ImageDraw.Draw(hole).rectangle([int(1024 * .15), int(500 * .15), int(1024 * .85), int(500 * .85)], fill=0); veil.putalpha(hole.point(lambda v: 120 if v else 0))
        save(Image.alpha_composite(dim, veil), os.path.join(STORE, 'preview-feature-safe-area.png'), 'RGB')
        await b.close()

if __name__ == '__main__':
    asyncio.run(main())
