// Preuzima arhivirane kopije slika (Wayback `_next/image?url=...`) i sprema ih pod ORIGINALNIM imenom.
// Pokretanje (iz server/):  node scripts/restore/download-wayback-images.js [--replace]
// - bez --replace: postojeći fajlovi se ne diraju (sigurno za produkciju)
// - --replace: prepisuje postojeće fajlove (koristiti samo u devu da zamijeni placeholdere)
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const REPLACE = process.argv.includes('--replace');
const data = require('./wayback-data.json');
const IMG_DIR = path.join(__dirname, '..', '..', 'uploads', 'images');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRetry(url, binary, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(90000) });
      if (res.ok) return binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
      if (res.status === 404) return null;
    } catch (_) { /* retry */ }
    await sleep(2000 * (i + 1));
  }
  return null;
}

(async () => {
  const want = new Set([...data.lectures, ...data.daijas, ...data.organizations].map((o) => o.image).filter(Boolean));
  const cdx = await fetchRetry('http://web.archive.org/cdx/search/cdx?url=ders.ba/_next/image*&output=json&fl=timestamp,original,statuscode&filter=statuscode:200&limit=20000');
  const rows = JSON.parse(cdx).slice(1);

  // putanja → najbolja kopija (najšira, pa najnovija)
  const best = {};
  for (const [ts, original] of rows) {
    const u = new URL(original);
    const src = u.searchParams.get('url');
    if (!src) continue;
    let p;
    try { p = new URL(src, 'https://ders.ba').pathname; } catch { continue; }
    if (!want.has(p)) continue;
    const w = +u.searchParams.get('w') || 0;
    const cur = best[p];
    if (!cur || w > cur.w || (w === cur.w && ts > cur.ts)) best[p] = { ts, original, w };
  }

  fs.mkdirSync(IMG_DIR, { recursive: true });
  let ok = 0, skipped = 0, failed = 0;
  for (const [p, { ts, original, w }] of Object.entries(best)) {
    const file = path.join(IMG_DIR, path.basename(p));
    if (fs.existsSync(file) && !REPLACE) { skipped++; continue; }
    const buf = await fetchRetry(`https://web.archive.org/web/${ts}im_/${original}`, true);
    if (!buf || buf.length < 500) { console.log(`  ✗ ${p}`); failed++; continue; }
    try {
      const img = sharp(buf);
      await (/\.jpe?g$/i.test(file) ? img.jpeg({ quality: 90 }) : /\.png$/i.test(file) ? img.png() : img.webp({ quality: 90 })).toFile(file);
      console.log(`  ✓ ${path.basename(p)} (w=${w}, ${Math.round(buf.length / 1024)} KB)`);
      ok++;
    } catch (e) { console.log(`  ✗ ${p}: ${e.message}`); failed++; }
    await sleep(500);
  }
  console.log(`\n✅ Pokriveno ${Object.keys(best).length}/${want.size}; preuzeto ${ok}, preskočeno ${skipped}, neuspjelo ${failed}`);
})().catch((e) => { console.error('❌', e); process.exit(1); });
