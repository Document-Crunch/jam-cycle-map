#!/bin/sh
# Inlines jam-framework.json (data) and template.html (its own source, for in-page saves) into index.html
cd "$(dirname "$0")"
python3 - <<'PY'
import json,pathlib
data=json.loads(pathlib.Path('jam-framework.json').read_text())
tpl=pathlib.Path('template.html').read_text()
esc=lambda s: s.replace('</','<\\/')
out=tpl.replace('__DATA__', esc(json.dumps(data, ensure_ascii=False)), 1).replace('__TPL__', esc(json.dumps(tpl, ensure_ascii=False)), 1)
pathlib.Path('index.html').write_text(out)
print('built index.html', len(out), 'bytes')
PY
