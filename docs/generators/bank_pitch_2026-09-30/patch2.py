# -*- coding: utf-8 -*-
"""Word count of prose only (tokens with letters), and a timezone-aware clock."""
import io
p = 'pitch_build.py'
s = io.open(p, encoding='utf-8').read()
R = [("PKT = datetime.datetime.utcnow() + datetime.timedelta(hours=5)",
      "PKT = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=5)"),
     ("                wn += len(t.split())",
      "                wn += len([w for w in t.split() if re.search('[A-Za-z]', w)])")]
for a, b in R:
    assert s.count(a) == 1, a
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)
print('ok')
