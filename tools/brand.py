"""The One-Man Team identity, "A. Ghost trail" (chosen 27 Nov 2026, docs/brand/2026-11-27-name-and-logo-options.md).

One module draws every logo and icon, so the web build, the app and the store art always agree:
  icon(k, ...)        the app icon: the same No. 1 three times on felt, two dashed ghosts on a dotted run and the live
                      figure in its mustard ring. k shrinks the art about its centre for maskable / adaptive safe zones.
  icon_small()        the same mark redrawn for 16-48 px (favicon): one ghost, a bigger live figure.
  wordmark(...)       ONE-MAN TEAM in Anton, outlined, over a tomato offset print and a dashed tomato "ghost" of itself
                      shifted back along the run. Single line or stacked on two lines.

All lettering is converted to outlines (HarfBuzz shaping with kerning, fontTools outlines) from the fonts in
one-man-team/fonts, so the SVGs render identically anywhere, with no web font. Ported from the concept generator in
/home/claude/brandgen (lib.py, concepts.py: OMT_Ghost). Needs: python3, uharfbuzz, fonttools (with brotli for woff2).
"""
import io, math, os

import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
FONTS = os.path.join(ROOT, 'one-man-team', 'fonts')

NAME = 'One-Man Team'
WORD = 'ONE-MAN TEAM'
LINES = ('ONE-MAN', 'TEAM')

PAPER, PAPER_SHADE, INK, INK_SOFT = '#F2EAD8', '#E6DCC3', '#14213D', '#4A5573'
FELT, FELT_DARK, CHALK = '#2F7D4F', '#2A7046', '#FBF8F0'
TOMATO, MUSTARD, SKY, SKIN, HAIR = '#E4572E', '#F2B705', '#8EC5D6', '#F1CDA6', '#3B2A20'


def f(v):
    return ('%.1f' % v).rstrip('0').rstrip('.') if abs(v) >= 0.05 else '0'


class Font:
    def __init__(self, fname):
        tt = TTFont(os.path.join(FONTS, fname))
        tt.flavor = None
        buf = io.BytesIO(); tt.save(buf)
        self.tt = TTFont(io.BytesIO(buf.getvalue()))
        self.gs = self.tt.getGlyphSet()
        self.order = self.tt.getGlyphOrder()
        self.upem = self.tt['head'].unitsPerEm
        self.hbfont = hb.Font(hb.Face(hb.Blob(buf.getvalue())))
        self.cap = getattr(self.tt['OS/2'], 'sCapHeight', 0) or self.upem * 0.7
        hh = self.tt['hhea']
        self.asc, self.desc = hh.ascent / self.upem, -hh.descent / self.upem   # in em, as Chromium lays out a line

    def glyphs(self, text, size, track=0.0):
        b = hb.Buffer(); b.add_str(text); b.guess_segment_properties()
        hb.shape(self.hbfont, b, {'kern': True, 'liga': False})
        s = size / self.upem; x = 0; out = []
        for info, pos in zip(b.glyph_infos, b.glyph_positions):
            out.append((self.order[info.codepoint], x + pos.x_offset * s))
            x += pos.x_advance * s + track * size
        return out, x - track * size

    def width(self, text, size, track=0.0):
        return self.glyphs(text, size, track)[1]

    def d(self, text, size, x, y, track=0.0, anchor='start'):
        gl, w = self.glyphs(text, size, track)
        if anchor == 'middle': x -= w / 2
        elif anchor == 'end': x -= w
        out = []
        s = size / self.upem
        for name, gx in gl:
            pen = SVGPathPen(self.gs, ntos=lambda v: ('%.1f' % v).rstrip('0').rstrip('.'))
            self.gs[name].draw(TransformPen(pen, (s, 0, 0, -s, x + gx, y)))
            out.append(pen.getCommands())
        return ''.join(out), w

    def capH(self, size):
        return self.cap * size / self.upem


ANTON = Font('anton-latin-400-normal.woff2')
BC7 = Font('barlow-condensed-latin-700-normal.woff2')
TRACK = 0.01                      # Anton tracking, as .title in the game's CSS (letter-spacing: .01em)


def svg(w, h, body, bg=None, attrs=''):
    b = '<rect width="%s" height="%s" fill="%s"/>' % (f(w), f(h), bg) if bg else ''
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s"%s>%s%s</svg>' % (f(w), f(h), attrs, b, body)


# ------------------------------------------------------------------------------------------------------------- icon
def felt(w=1024, h=1024, bands=4):
    out = '<rect width="%s" height="%s" fill="%s"/>' % (w, h, FELT)
    bh = h / bands
    for i in range(0, bands, 2):
        out += '<rect y="%s" width="%s" height="%s" fill="%s"/>' % (f(i * bh), w, f(bh), FELT_DARK)
    return out


def figure(cx, cy, R, num='1', rot=0, kit=TOMATO, ring=None, ink_w=None, mono=False):
    """Top-down tabletop figure: ink-edged base in the kit colour, paper deck, shoulders and head, squad number."""
    iw = ink_w or max(R * 0.07, 3)
    ink, paper, skin, hair = (INK, PAPER, SKIN, HAIR) if not mono else ('#000', '#000', '#000', '#000')
    o = ''
    if ring:
        o += '<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="%s" stroke-width="%s"/>' % (f(cx), f(cy), f(R * 1.2), ring, ink, f(iw))
    o += '<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="%s" stroke-width="%s"/>' % (f(cx), f(cy), f(R), kit, ink, f(iw))
    o += '<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="%s" stroke-width="%s"/>' % (f(cx), f(cy), f(R * 0.74), paper, ink, f(iw * 0.7))
    sw, sh = R * 0.92, R * 0.28
    g = '<g transform="translate(%s %s) rotate(%s)">' % (f(cx), f(cy - R * 0.3), f(rot))
    g += '<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s" stroke="%s" stroke-width="%s"/>' % (f(-sw / 2), f(-sh / 2), f(sw), f(sh), f(sh / 2), kit, ink, f(iw * 0.7))
    g += '<circle cx="0" cy="0" r="%s" fill="%s" stroke="%s" stroke-width="%s"/>' % (f(R * 0.15), skin, ink, f(iw * 0.6))
    g += '<path d="M%s 0 A%s %s 0 0 1 %s 0 Z" fill="%s"/>' % (f(-R * 0.15), f(R * 0.15), f(R * 0.15), f(R * 0.15), hair)
    o += g + '</g>'
    if num:
        d, _ = BC7.d(num, R * 0.5, cx, cy + R * 0.58, anchor='middle')
        o += '<path d="%s" fill="%s"/>' % (d, ink)
    return o


def ghost(cx, cy, R, num='1', col=CHALK, op=1.0, fill_op=0.14):
    dash = 2 * math.pi * R / 14
    o = '<g opacity="%s"><circle cx="%s" cy="%s" r="%s" fill="%s" fill-opacity="%s" stroke="%s" stroke-width="%s" stroke-dasharray="%s %s" stroke-linecap="round"/>' % (
        f(op) if op < 1 else '1', f(cx), f(cy), f(R), col, fill_op, col, f(R * 0.08), f(dash * 0.55), f(dash * 0.45))
    if num:
        size = R * 0.9
        d, _ = BC7.d(num, size, cx, cy + BC7.capH(size) / 2, anchor='middle')
        o += '<path d="%s" fill="%s"/>' % (d, col)
    return o + '</g>'


# The art's centre of mass, used when shrinking it into a safe zone.
ART_C = (510, 535)


def icon_art(k=1.0, cx0=None, cy0=None, mono=False):
    """The run, the two ghosts and the live figure. At k=1 this is the concept exactly; k<1 shrinks it about ART_C and
    re-centres it on (cx0, cy0) (default: the square's centre, nudged so the group reads as centred)."""
    if k == 1.0:
        tr = ''
    else:
        cx0 = 512 if cx0 is None else cx0; cy0 = 512 if cy0 is None else cy0
        tr = 'translate(%s %s) scale(%s) translate(%s %s)' % (f(cx0), f(cy0), k, -ART_C[0], -ART_C[1])
    ch = '#000' if mono else CHALK
    o = '<path d="M-20 1230 L90 1010 C130 930 160 880 200 840 S 380 690 420 650 S 590 470 680 370" fill="none" stroke="%s" stroke-width="16" stroke-linecap="round" stroke-dasharray="0 34" opacity=".9"/>' % ch
    o += ghost(200, 840, 100, '1', col=ch, op=.55, fill_op=0 if mono else .14)
    o += ghost(420, 650, 125, '1', col=ch, op=.85, fill_op=0 if mono else .14)
    if mono:
        o += '<circle cx="680" cy="370" r="%s" fill="#000"/>' % f(200 * 1.2 + 8)
    else:
        o += '<circle cx="700" cy="392" r="246" fill="#0B1A12" opacity=".28"/>'
        o += figure(680, 370, 200, '1', rot=-28, ring=MUSTARD, ink_w=15)
    return '<g transform="%s">%s</g>' % (tr, o) if tr else o


def icon_chalk():
    """The fragment of the centre circle, top left."""
    return '<path d="M-30 300 A 360 360 0 0 0 300 -30" fill="none" stroke="%s" stroke-opacity=".45" stroke-width="18"/>' % CHALK


def icon_body(k=1.0):
    return felt() + icon_chalk() + icon_art(k)


def icon(k=1.0):
    """1024 master, full bleed (stores and launchers apply their own mask)."""
    return svg(1024, 1024, icon_body(k))


def icon_small():
    """Redrawn for 16-48 px: the second ghost and the chalk arc drop out (they turn to noise), the live figure fills more
    of the square, and the nearer ghost keeps a corner so the trail still reads."""
    o = felt()
    o += '<path d="M60 1040 C120 960 200 860 300 760" fill="none" stroke="%s" stroke-width="40" stroke-linecap="round" stroke-dasharray="0 80" opacity=".9"/>' % CHALK
    o += ghost(250, 790, 170, '1', op=.8)
    o += '<circle cx="610" cy="440" r="330" fill="#0B1A12" opacity=".28"/>'
    o += figure(586, 414, 290, '1', rot=-28, ring=MUSTARD, ink_w=28)
    return svg(1024, 1024, o)


def icon_mono(k):
    """Android 13+ themed icon: only alpha counts. The art in black on transparent, the live figure punched out of its disc."""
    # a luminance mask: white keeps, black punches. The live figure: its ring, its base edge, its body and number.
    figure_holes = ('<circle cx="680" cy="370" r="%s" fill="#000"/>' % f(200 * 1.2 - 14) +
                    '<circle cx="680" cy="370" r="200" fill="#fff"/>' +
                    '<circle cx="680" cy="370" r="%s" fill="#000"/>' % f(200 * 0.74 - 10))
    sw, sh = 200 * 0.92, 200 * 0.28
    figure_holes += '<g transform="translate(680 310) rotate(-28)"><rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="#fff"/><circle r="34" fill="#fff"/></g>' % (f(-sw / 2), f(-sh / 2), f(sw), f(sh), f(sh / 2))
    d, _ = BC7.d('1', 100, 680, 370 + 116, anchor='middle')
    figure_holes += '<path d="%s" fill="#fff"/>' % d
    mask_body = icon_art(1.0, mono=True).replace('#000', '#fff') + figure_holes
    cx0 = cy0 = 512
    tr = 'translate(%s %s) scale(%s) translate(%s %s)' % (cx0, cy0, k, -ART_C[0], -ART_C[1])
    m = '<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024"><rect width="1024" height="1024" fill="#000"/><g transform="%s">%s</g></mask>' % (tr, mask_body)
    return svg(1024, 1024, '<defs>%s</defs><rect width="1024" height="1024" fill="#000" mask="url(#m)"/>' % m)


# --------------------------------------------------------------------------------------------------------- wordmark
def _shape(lines, size, lh):
    """Outline paths for each line, baselines placed as Chromium places Anton in a line box of lh em."""
    base0 = (lh - (ANTON.asc + ANTON.desc)) / 2 + ANTON.asc
    d = ''; widths = []
    for i, line in enumerate(lines):
        p, w = ANTON.d(line, size, 0, (base0 + i * lh) * size, TRACK)
        d += p; widths.append(w)
    return d, max(widths)


def wordmark(lines=(WORD,), lh=0.95, shadow=0.05, ghost_dx=0.13, ghost_w=0.03, dash=(0.075, 0.05), main='currentColor',
             uid='w', size=1000, pad_left=True, attrs='', title=None):
    """The Ghost trail wordmark as one SVG.

    Geometry is in em (size units per em). The viewBox origin is where the text box of `.title` starts, so the main
    lettering lands on exactly the same pixels as the live text it replaces; the dashed ghost spills `ghost_dx` em to
    the left (into the page padding) unless pad_left, which widens the box to hold it. The box is `lh` em per line high.
    main='currentColor' lets CSS set the ink colour."""
    d, w = _shape(lines, size, lh)
    gx, sh = ghost_dx * size, shadow * size
    left = gx + ghost_w * size if pad_left else 0
    W, H = left + w + sh, lh * size * len(lines)
    pid = 'omt-%s' % uid
    body = '<defs><path id="%s" d="%s"/></defs>' % (pid, d)
    body += '<g transform="translate(%s 0)">' % f(left) if left else '<g>'
    body += '<use href="#%s" fill="none" stroke="%s" stroke-width="%s" stroke-dasharray="%s %s" transform="translate(%s 0)"/>' % (
        pid, TOMATO, f(ghost_w * size), f(dash[0] * size), f(dash[1] * size), f(-gx))
    body += '<use href="#%s" fill="%s" transform="translate(%s %s)"/>' % (pid, TOMATO, f(sh), f(sh))
    body += '<use href="#%s" fill="%s"/>' % (pid, main)
    body += '</g>'
    t = '<title>%s</title>' % title if title else ''
    return svg(W, H, t + body, attrs=attrs), W, H


def wordmark_box(lines=(WORD,), lh=0.95, shadow=0.05, ghost_dx=0.13, ghost_w=0.03, pad_left=True, size=1000):
    d, w = _shape(lines, size, lh)
    left = (ghost_dx + ghost_w) * size if pad_left else 0
    return left + w + shadow * size, lh * size * len(lines), left


def lockup(dark=False, icon_px=260, gap=50, stacked=False):
    """Horizontal lockup: the icon tile (rounded square, ink edge) then the wordmark, on one line or stacked."""
    main = PAPER if dark else INK
    if stacked:
        wm, ww, wh = wordmark(lines=LINES, lh=0.9, shadow=0.042, ghost_dx=0.13, ghost_w=0.024, dash=(0.07, 0.048), main=main, uid='lk')
        scale = icon_px * 1.3 / wh
    else:
        wm, ww, wh = wordmark(main=main, uid='lk', lh=1.0, shadow=0.04, ghost_dx=0.13, ghost_w=0.022, dash=(0.07, 0.048), size=230)
        scale = icon_px * 0.86 / wh
    W = icon_px + gap + ww * scale
    H = max(icon_px, wh * scale)
    r = icon_px * 0.22
    iy = (H - icon_px) / 2
    o = '<defs><clipPath id="ic"><rect y="%s" width="%s" height="%s" rx="%s"/></clipPath></defs>' % (f(iy), icon_px, icon_px, f(r))
    o += '<g clip-path="url(#ic)"><g transform="translate(0 %s) scale(%s)">%s</g></g>' % (f(iy), icon_px / 1024, icon_body())
    o += '<rect x="1.5" y="%s" width="%s" height="%s" rx="%s" fill="none" stroke="%s" stroke-width="3"/>' % (f(iy + 1.5), icon_px - 3, icon_px - 3, f(r), INK)
    inner = wm[wm.index('>') + 1:-len('</svg>')]
    o += '<g transform="translate(%s %s) scale(%s)">%s</g>' % (f(icon_px + gap), f((H - wh * scale) / 2), '%.5f' % scale, inner)
    return svg(W, H, o), W, H
