#!/bin/sh
# Build, check, push, and do not exit 0 until the live company page actually
# serves the version in jam-framework.json. Usage: ./ship.sh "commit message"
set -e
cd "$(dirname "$0")"

LIVE="https://document-crunch.github.io/jam-cycle-map/"
REPO="Document-Crunch/jam-cycle-map"

./build.sh
node verify.js

WANT=$(python3 -c "import json;print(json.load(open('jam-framework.json'))['meta']['version'])")
echo "shipping: $WANT"

if [ -n "$(git status --porcelain)" ]; then
  [ -n "$1" ] || { echo "there are changes to commit but no commit message was given" >&2; exit 1; }
  git add -A
  git commit -q -m "$1"
fi

git push -q origin main
echo "pushed $(git rev-parse --short HEAD)"

# Wait for the Pages build, then for the CDN to actually serve it.
i=0
while [ $i -lt 40 ]; do
  GOT=$(curl -sH 'Cache-Control: no-cache' "$LIVE?cb=$$-$i" | python3 -c "
import json,re,sys
h=sys.stdin.read()
m=re.search(r'\"version\": \"([^\"]+)\"', h)
print(m.group(1) if m else 'none')
" 2>/dev/null || echo fetch-failed)
  if [ "$GOT" = "$WANT" ]; then
    echo "live: $LIVE is serving $GOT"
    exit 0
  fi
  i=$((i + 1))
  printf '.'
  sleep 10
done

echo >&2
echo "FAILED: the live page still serves \"$GOT\", expected \"$WANT\"" >&2
gh api "repos/$REPO/pages/builds/latest" --jq '"pages build: status=\(.status) commit=\(.commit[0:7]) error=\(.error.message // "none")"' >&2 || true
exit 1
