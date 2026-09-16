#!/usr/bin/env python3
"""Pull the framework data out of a saved copy of the Claude artifact's HTML and write jam-framework.json.
Usage: python3 promote.py path/to/artifact.html && ./build.sh
"""
import json,re,sys,pathlib
html=pathlib.Path(sys.argv[1]).read_text()
m=re.search(r'<script id="data" type="application/json">(.*?)</script>', html, re.S)
data=json.loads(m.group(1).replace('<\\/','</'))
s=json.dumps(data,indent=2,ensure_ascii=False)
s=re.sub(r'\[\s+((?:(?:"[^"]*"|-?\d+|true|false),?\s+)+)\]', lambda m: '['+', '.join(x.strip() for x in m.group(1).replace('\n',' ').split(',') if x.strip())+']', s)
pathlib.Path('jam-framework.json').write_text(s+"\n")
print('wrote jam-framework.json', data['meta'].get('version'), 'edited', data['meta'].get('lastEdited'), '| history entries:', len(data.get('history',[])))
