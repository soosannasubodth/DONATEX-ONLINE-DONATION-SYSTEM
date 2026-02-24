import MySQLdb

cfg = dict(host='127.0.0.1', port=3307, user='root', passwd='Susu@2005', db='donatex')

conn = MySQLdb.connect(**cfg)
cur = conn.cursor()
cur.execute("""
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA=%s
ORDER BY TABLE_NAME, ORDINAL_POSITION
""", (cfg['db'],))
rows = cur.fetchall()
cur.close()
conn.close()

from collections import defaultdict
tables = defaultdict(list)
for tbl, col, ctype, is_null, ckey, cdef, extra in rows:
    tables[tbl].append({'name': col, 'type': ctype, 'nullable': is_null, 'key': ckey, 'default': cdef, 'extra': extra})

for tbl in sorted(tables):
    print(tbl)
    for col in tables[tbl]:
        print(f"  - {col['name']}: {col['type']}, nullable={col['nullable']}, key={col['key']}, default={col['default']}, extra={col['extra']}")
    print()
