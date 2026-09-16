#!/bin/sh
# Inlines jam-framework.json into template.html and writes index.html
cd "$(dirname "$0")"
python3 - <<'PY'
import json,pathlib
data=json.loads(pathlib.Path('jam-framework.json').read_text())
tpl=pathlib.Path('template.html').read_text()
out=tpl.replace('__DATA__', json.dumps(data).replace('</','<\\/'))
pathlib.Path('index.html').write_text(out)
print('built index.html', len(out), 'bytes')
PY
