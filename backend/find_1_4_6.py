import sys, os
paths = [p for p in sys.path if p]
search_dirs = [p for p in paths if 'site-packages' in p.lower() or p.endswith('Lib')]
matches = []
for base in sorted(set(search_dirs)):
    for root, dirs, files in os.walk(base):
        for f in files:
            fp = os.path.join(root, f)
            try:
                with open(fp, 'r', encoding='utf-8', errors='ignore') as fh:
                    if '1.4.6' in fh.read():
                        matches.append(fp)
            except Exception:
                pass
for m in matches:
    print(m)
print('DONE:', len(matches), 'matches')
