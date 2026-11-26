import json, sys, math, random
from statistics import mean, pstdev
from rs import sp, perm, rank
R = [r for r in json.load(open(sys.argv[1])) if r.get('route')]
def z(vals): m, s = mean(vals), pstdev(vals) or 1; return [(v - m) / s for v in vals]
# unit-weighted composites; sign so that larger = harder. Weights fixed in advance from doc 07 (set A), not fitted.
TERMS = {
 'model': lambda r: math.log(r['model']),
 'j1': lambda r: r['j1'], 'recv': lambda r: -min(r['recvMin'], 6), 'lane': lambda r: -min(r['laneMin'], 6),
 'spare': lambda r: r['spareTight'], 'j2': lambda r: r['j2'], 'spd': lambda r: r['spd'], 'ratio': lambda r: r['ratio'],
}
COMPS = {
 'S0 model alone': ['model'],
 'S1 model + tight touches (J1)': ['model', 'j1'],
 'S2 model + J1 + reception + lane + spare': ['model', 'j1', 'recv', 'lane', 'spare'],
 'S3 route only: J1 + reception + lane + spare': ['j1', 'recv', 'lane', 'spare'],
 'S4 S2 + defender speed': ['model', 'j1', 'recv', 'lane', 'spare', 'spd'],
 'S5 S2 + bot/clock': ['model', 'j1', 'recv', 'lane', 'spare', 'ratio'],
}
Z = {k: z([f(r) for r in R]) for k, f in TERMS.items()}
def comp(terms): return [sum(Z[t][i] for t in terms) / len(terms) for i in range(len(R))]
subsets = [('all', lambda r: True), ('first plays', lambda r: r['first']), ('first, fixture 5+', lambda r: r['first'] and not (r['set'] == 'A' and int(r['test']) <= 4)),
           ('A only (where doc 07 found the measures)', lambda r: r['set'] == 'A'), ('B-E (out of sample)', lambda r: r['set'] != 'A'), ('D-E first plays (new levels)', lambda r: r['first'] and r['set'] in 'DE')]
print('| Signal | ' + ' | '.join(f'{n} (n {sum(1 for r in R if s(r))})' for n, s in subsets) + ' |')
print('|---|' + '---|' * len(subsets))
for name, terms in COMPS.items():
    c = comp(terms); cells = []
    for n, s in subsets:
        idx = [i for i, r in enumerate(R) if s(r)]
        a = [c[i] for i in idx]; t = [R[i]['takes'] for i in idx]
        cells.append(f'{sp(a, t):+.2f} (p {perm(a, t, 1000):.2f})')
    print(f'| {name} | ' + ' | '.join(cells) + ' |')
