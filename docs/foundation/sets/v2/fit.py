import json, sys, math
from statistics import mean, pstdev
from rs import sp, perm
R = [r for r in json.load(open(sys.argv[1])) if r.get('route')]
T = {'model': lambda r: math.log(r['model']), 'j1': lambda r: r['j1'], 'recv': lambda r: -min(r['recvMin'], 6), 'lane': lambda r: -min(r['laneMin'], 6), 'spare': lambda r: r['spareTight'], 'ratio': lambda r: r['ratio']}
def consts(rows): return {k: (mean([f(r) for r in rows]), pstdev([f(r) for r in rows]) or 1) for k, f in T.items()}
def cz(r, C): return sum((T[k](r) - C[k][0]) / C[k][1] for k in T) / len(T)
def lsq(x, y): mx, my = mean(x), mean(y); b = sum((a - mx) * (c - my) for a, c in zip(x, y)) / sum((a - mx) ** 2 for a in x); return my - b * mx, b
C = consts(R)
first = [r for r in R if r['first']]
a, b = lsq([cz(r, C) for r in first], [math.log(r['takes']) for r in first])
print('reference constants (mean, sd):', {k: (round(v[0], 4), round(v[1], 4)) for k, v in C.items()})
print(f'log takes = {a:.4f} + {b:.4f} * composite   (fitted on the {len(first)} first plays)')
# leave one set out: constants and fit from the other sets, prediction on the held-out set
print('\nleave one set out (constants and fit from the other four sets):')
allp, allt, allm = [], [], []
for s in 'ABCDE':
    tr = [r for r in R if r['set'] != s]; te = [r for r in R if r['set'] == s]
    Cs = consts(tr); f1 = [r for r in tr if r['first']]; a1, b1 = lsq([cz(r, Cs) for r in f1], [math.log(r['takes']) for r in f1])
    p = [math.exp(a1 + b1 * cz(r, Cs)) for r in te]; t = [r['takes'] for r in te]; m = [r['model'] for r in te]
    allp += p; allt += t; allm += m
    print(f'  set {s}: n {len(te)}, rank correlation with his takes: composite {sp(p, t):+.2f}, model alone {sp(m, t):+.2f}')
print(f'  pooled held-out predictions: composite {sp(allp, allt):+.2f} (p {perm(allp, allt, 2000):.3f}), model alone {sp(allm, allt):+.2f} (p {perm(allm, allt, 2000):.3f})')
# median absolute error in log2 units (factor), held-out
fe = lambda p, t: sorted(abs(math.log2(x / y)) for x, y in zip(p, t))[len(p) // 2]
print(f'  median factor off (held out): composite x{2 ** fe(allp, allt):.2f}, model alone x{2 ** fe(allm, allt):.2f}')
print('\nset D and E, in-sample fit:')
for r in R:
    if r['set'] in 'DE': print(f"  {r['set']}{r['test']} takes {r['takes']:>2}  model {r['model']:>4}  composite {math.exp(a + b * cz(r, C)):.1f}")
