import json, sys, itertools, random
from statistics import mean
R = json.load(open(sys.argv[1]))
def rank(v):
    s = sorted(range(len(v)), key=lambda i: v[i]); r = [0]*len(v); i = 0
    while i < len(s):
        j = i
        while j+1 < len(s) and v[s[j+1]] == v[s[i]]: j += 1
        for k in range(i, j+1): r[s[k]] = (i+j)/2
        i = j+1
    return r
def sp(a, b):
    ra, rb = rank(a), rank(b); ma, mb = mean(ra), mean(rb)
    num = sum((x-ma)*(y-mb) for x, y in zip(ra, rb)); den = (sum((x-ma)**2 for x in ra)*sum((y-mb)**2 for y in rb))**0.5
    return num/den if den else 0
def perm(a, b, n=2000):
    r0 = abs(sp(a, b)); rnd = random.Random(1); bb = b[:]; c = 0
    for _ in range(n): rnd.shuffle(bb); c += abs(sp(a, bb)) >= r0 - 1e-12
    return c/n
feats = ['model', 'modelMiddle', 'j1', 'j2', 'laneMin', 'recvMin', 'spareTight', 'aimMin', 'spd', 'nDef', 'rounds', 'ratio', 'clock']
for name, sel in [('all rated plays', lambda r: True), ('first plays', lambda r: r['first']), ('first plays, fixtures 5+ (no tutorials)', lambda r: r['first'] and not (r['set']=='A' and int(r['test'])<=4)), ('sets B-E', lambda r: r['set']!='A')]:
    rs = [r for r in R if sel(r) and r.get('route')]
    print(f'\n{name}: n={len(rs)}')
    t = [r['takes'] for r in rs]
    for f in feats:
        v = [r[f] if r.get(f) is not None else 99 for r in rs]
        print(f'  {f:12s} {sp(v, t):+.2f}  p {perm(v, t, 1000):.3f}')
