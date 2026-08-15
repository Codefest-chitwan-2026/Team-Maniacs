const RANKS = [
  { name: 'Newcomer', min: 0, max: 49 },
  { name: 'Helper', min: 50, max: 149 },
  { name: 'Responder', min: 150, max: 299 },
  { name: 'Guardian', min: 300, max: 599 },
  { name: 'Community Leader', min: 600, max: 999 },
  { name: 'Satark Hero', min: 1000, max: 1999 },
  { name: 'Satark Champion', min: 2000, max: null },
];
function getSatarkRank(points) {
  const pts = Number.isFinite(points) ? Math.max(0, Math.floor(points)) : 0;
  let current = RANKS[0];
  for (const r of RANKS) {
    if (r.max === null) {
      if (pts >= r.min) current = r;
    } else if (pts >= r.min && pts <= r.max) { current = r; break; }
    else if (pts >= r.min && r.max !== null && pts > r.max) { current = r; }
  }
  const currentIndex = RANKS.findIndex(r => r.name === current.name);
  const nextRankObj = RANKS[currentIndex + 1] || null;
  const pointsToNext = nextRankObj ? Math.max(0, nextRankObj.min - pts) : null;
  const nextMin = nextRankObj ? nextRankObj.min : null;
  let progressPercent = 0;
  if (!nextRankObj) progressPercent = 100;
  else {
    const span = nextRankObj.min - current.min;
    if (span <= 0) progressPercent = 100;
    else progressPercent = Math.min(100, Math.max(0, Math.round(((pts - current.min) / span) * 100)));
  }
  return { name: current.name, min: current.min, max: current.max, nextRank: nextRankObj? nextRankObj.name: null, pointsToNext, nextMin, progressPercent };
}
const tests = [0,49,50,149,150,299,300,599,600,999,1000,1999,2000,5000];
const results = tests.map(p => ({ points: p, rank: getSatarkRank(p) }));
console.log(JSON.stringify(results, null, 2));
