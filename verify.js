// Checks for the Jam Cycle Map. Data invariants over jam-framework.json, then
// build integrity of index.html. Exits non-zero if anything fails.
const fs = require('fs');

let failures = 0;
function check(name, fn) {
  let msg;
  try { msg = fn(); } catch (e) { msg = e.message; }
  if (msg) { console.error('FAIL  ' + name + ': ' + msg); failures++; }
  else { console.log('ok    ' + name); }
}

const D = JSON.parse(fs.readFileSync('jam-framework.json', 'utf8'));
const W = D.meta.cycleWeeks;

/* ---------- data invariants ---------- */

check('milestone ids are unique', () => {
  const ids = D.milestones.map(m => m.id);
  const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  return dupes.length ? 'duplicate ids: ' + dupes.join(', ') : null;
});

check('every milestone at is a half-week step inside the cycle', () => {
  const bad = D.milestones.filter(m =>
    m.at !== null && !(typeof m.at === 'number' && m.at >= 0 && m.at <= W && m.at * 2 === Math.round(m.at * 2)));
  return bad.length ? 'bad at: ' + bad.map(m => m.id + '=' + m.at).join(', ') : null;
});

check('meta.groups lists the seven visible audience groups', () => {
  const want = ['org', 'build', 'leadership', 'gtm', 'product', 'design', 'engineering'];
  const got = (D.meta.groups || []).map(g => g.id);
  return got.join(',') === want.join(',') ? null : 'expected ' + want.join(',') + ' got ' + got.join(',');
});

check('every group has id, name, short and default', () => {
  const bad = (D.meta.groups || []).filter(g =>
    !g.id || !g.name || !g.short || typeof g.default !== 'boolean');
  return bad.length ? 'incomplete groups: ' + bad.map(g => g.id || '(no id)').join(', ') : null;
});

check('every milestone kind is a known group or a hidden kind', () => {
  const known = new Set((D.meta.groups || []).map(g => g.id).concat(['team', 'gate']));
  const bad = D.milestones.filter(m => !known.has(m.kind));
  return bad.length ? 'unknown kinds: ' + bad.map(m => m.id + '=' + m.kind).join(', ') : null;
});

check('mid-week milestones read as "Middle of week N"', () => {
  // Mirrors boundaryName() in template.html. If this drifts, the page lies about timing.
  const name = b => b % 1 !== 0
    ? 'Middle of week ' + Math.ceil(b)
    : b === 0 ? 'Start of week 1'
    : b === W ? 'End of week ' + W
    : 'End of week ' + b + ' / start of week ' + (b + 1);
  const cases = [[0.5, 'Middle of week 1'], [1.5, 'Middle of week 2'], [4.5, 'Middle of week 5'],
                 [0, 'Start of week 1'], [1, 'End of week 1 / start of week 2'], [8, 'End of week 8']];
  const bad = cases.filter(([b, want]) => name(b) !== want);
  return bad.length ? bad.map(([b, want]) => b + ' gave "' + name(b) + '" want "' + want + '"').join('; ') : null;
});

check('every function meeting is placed as the spec says', () => {
  const want = {
    'refine-1':             {at: 0.5, kind: 'product',     repeats: 'per opportunity'},
    'eng-leader-planning':  {at: 1,   kind: 'engineering', repeats: null},
    'refine-2':             {at: 1.5, kind: 'product',     repeats: 'per opportunity'},
    'pitchback':            {at: 2,   kind: 'engineering', repeats: 'per pod'},
    'design-shareout-team': {at: 2.5, kind: 'design',      repeats: null},
    'design-shareout-pod':  {at: 3,   kind: 'design',      repeats: 'per opportunity'},
    'opp-proposals':        {at: 4,   kind: 'product',     repeats: 'weekly, weeks 3-4'},
    'pitch-discovery':      {at: 4.5, kind: 'product',     repeats: 'per opportunity'},
    'portfolio-dry-run':    {at: 5,   kind: 'product',     repeats: null},
    'delivery-check-1':     {at: 5,   kind: 'engineering', repeats: 'per pod'},
    'delivery-check-2':     {at: 6,   kind: 'engineering', repeats: 'per pod'},
    'opp-intake':           {at: 7,   kind: 'product',     repeats: 'per opportunity'},
  };
  const by = Object.fromEntries(D.milestones.map(m => [m.id, m]));
  const problems = [];
  for (const [id, w] of Object.entries(want)) {
    const m = by[id];
    if (!m) { problems.push(id + ' missing'); continue; }
    if (m.at !== w.at) problems.push(id + ' at=' + m.at + ' want ' + w.at);
    if (m.kind !== w.kind) problems.push(id + ' kind=' + m.kind + ' want ' + w.kind);
    if ((m.repeats || null) !== w.repeats) problems.push(id + ' repeats=' + (m.repeats || 'none') + ' want ' + (w.repeats || 'none'));
  }
  if (by.brp) problems.push('brp should have been renamed to eng-leader-planning');
  if (by.shareouts) problems.push('shareouts should have been split into design-shareout-team and design-shareout-pod');
  return problems.length ? problems.join('; ') : null;
});

check('every milestone has audience prose and at least one outcome', () => {
  const bad = D.milestones.filter(m => !m.audience || !(m.outcomes && m.outcomes.length));
  return bad.length ? 'incomplete: ' + bad.map(m => m.id).join(', ') : null;
});

check('every document either has checkpoints or states a cadence', () => {
  const bad = D.artifacts.filter(a => !(a.checkpoints && a.checkpoints.length) && !a.cadence);
  return bad.length ? 'no checkpoints and no cadence: ' + bad.map(a => a.id).join(', ') : null;
});

check('document checkpoints sit on whole week boundaries', () => {
  const bad = [];
  D.artifacts.forEach(a => (a.checkpoints || []).forEach(c => {
    if (!(typeof c.at === 'number' && c.at >= 0 && c.at <= W && c.at % 1 === 0)) bad.push(a.id + '=' + c.at);
  }));
  return bad.length ? bad.join(', ') : null;
});

/* ---------- build integrity ---------- */

function embedded() {
  const h = fs.readFileSync('index.html', 'utf8');
  const unesc = s => s.replace(/<\\\//g, '</');
  const get = id => {
    const m = h.match(new RegExp('<script id="' + id + '" type="application/json">([\\s\\S]*?)</script>'));
    return m ? JSON.parse(unesc(m[1])) : null;
  };
  return { h, data: get('data'), tpl: get('tpl') };
}

check('index.html embeds the current data and template', () => {
  const { data, tpl } = embedded();
  if (!data) return 'no embedded data block';
  if (JSON.stringify(data) !== JSON.stringify(D)) return 'embedded data differs from jam-framework.json — run ./build.sh';
  if (tpl !== fs.readFileSync('template.html', 'utf8')) return 'embedded template differs from template.html — run ./build.sh';
  return null;
});

check('the page script parses', () => {
  const { h } = embedded();
  const tplEnd = h.indexOf('</script>', h.indexOf('<script id="tpl"')) + 9;
  const js = h.slice(h.indexOf('<script>', tplEnd) + 8, h.lastIndexOf('</script>'));
  new Function(js);
  return null;
});

console.log(failures
  ? '\n' + failures + ' check(s) failed'
  : '\nall checks passed | ' + D.meta.version);
process.exit(failures ? 1 : 0);
