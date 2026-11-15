// Ekstrakcija ders.ba podataka iz Wayback Machine snapshotova (Next.js RSC payload).
// Pokretanje (iz server/): node scripts/restore/extract-wayback.js
// Izlaz: scripts/restore/wayback-data.json  { lectures, daijas, organizations }
const fs = require('fs');
const path = require('path');

const PATHS = ['/', '/daije', '/organizations', '/lectures'];
const FROM = '202510';
const TO = '202608';
const OUT = path.join(__dirname, 'wayback-data.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch (_) { /* retry */ }
    await sleep(1500 * (i + 1));
  }
  return null;
}

async function snapshots(p) {
  const url = `http://web.archive.org/cdx/search/cdx?url=ders.ba${p}&output=json&fl=timestamp,statuscode&filter=statuscode:200&from=${FROM}&to=${TO}&collapse=digest`;
  const txt = await get(url);
  if (!txt) return [];
  try { return JSON.parse(txt).slice(1).map((r) => r[0]); } catch { return []; }
}

// Spaja sve self.__next_f.push([1,"..."]) stringove u jedan tekst.
function rscText(html) {
  let out = '';
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let m;
  while ((m = re.exec(html))) {
    try { out += JSON.parse(m[1]); } catch { /* preskoči */ }
  }
  return out;
}

// Izvlači balansirane JSON objekte koji sadrže "_id".
function extractObjects(text) {
  const found = [];
  const re = /"_id":"([0-9a-f]{24})"/g;
  let m;
  while ((m = re.exec(text))) {
    let start = text.lastIndexOf('{', m.index);
    while (start >= 0) {
      const obj = balanced(text, start);
      if (obj && obj.includes(m[0])) {
        try {
          const parsed = JSON.parse(obj);
          if (parsed._id === m[1]) { found.push(parsed); break; }
        } catch { /* probaj vanjski { */ }
      }
      start = text.lastIndexOf('{', start - 1);
    }
  }
  return found;
}

function balanced(text, start) {
  let depth = 0, inStr = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === '\\') i++;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

// Pages Router: <script id="__NEXT_DATA__">{json}</script> → rekurzivno šetanje.
function nextDataObjects(html) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) return [];
  let data;
  try { data = JSON.parse(m[1]); } catch { return []; }
  const out = [];
  (function walk(v) {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') {
      if (typeof v._id === 'string' && /^[0-9a-f]{24}$/.test(v._id)) out.push(v);
      Object.values(v).forEach(walk);
    }
  })(data);
  return out;
}

function classify(o) {
  if (o.date && (o.daija !== undefined || o.title !== undefined || o.time !== undefined)) return 'lectures';
  if (o.biography !== undefined || o.education !== undefined || o.dateOfBirth !== undefined ||
      (o.title && ['prof', 'dr', 'mr'].includes(o.title))) return 'daijas';
  if (o.name && (o.facebook !== undefined || o.instagram !== undefined || o.telegram !== undefined ||
      o.viber !== undefined || o.address !== undefined || o.city !== undefined)) return 'organizations';
  return null;
}

(async () => {
  const jobs = [];
  for (const p of PATHS) {
    const ts = await snapshots(p);
    console.log(`${p}: ${ts.length} snapshotova`);
    ts.forEach((t) => jobs.push({ p, t }));
  }
  jobs.sort((a, b) => a.t.localeCompare(b.t)); // stariji prvo → noviji pobjeđuje

  const store = { lectures: new Map(), daijas: new Map(), organizations: new Map() };
  for (const { p, t } of jobs) {
    const html = await get(`https://web.archive.org/web/${t}id_/https://ders.ba${p}`);
    if (!html) { console.log(`  ✗ ${t} ${p}`); continue; }
    const objs = [...nextDataObjects(html), ...extractObjects(rscText(html))];
    let n = 0;
    for (const o of objs) {
      const kind = classify(o);
      if (!kind) continue;
      store[kind].set(o._id, { ...(store[kind].get(o._id) || {}), ...o });
      n++;
    }
    console.log(`  ✓ ${t} ${p}: ${objs.length} objekata (${n} klasifikovano)`);
    await sleep(500);
  }

  const result = {
    lectures: [...store.lectures.values()],
    daijas: [...store.daijas.values()],
    organizations: [...store.organizations.values()]
  };
  fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(`\n✅ ${result.lectures.length} dersova, ${result.daijas.length} daija, ${result.organizations.length} organizacija → ${OUT}`);
})().catch((e) => { console.error('❌', e); process.exit(1); });
