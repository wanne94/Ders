// Import podataka izvučenih iz Wayback-a (wayback-data.json) u MongoDB.
// Bez --confirm: samo dry-run (ispis brojeva, bez konekcije na bazu i bez pisanja slika).
// Dev (iz server/):
//   NODE_ENV=development node -r dotenv/config scripts/restore/import-wayback.js dotenv_config_path=.env.development --confirm
// Prod: isti poziv sa .env.production (tek uz odobrenje i nakon backupa).
//
// - upsert po ORIGINALNOM _id (veze daija→ders ostaju iste)
// - slike: placeholder .webp/.jpg pod ISTIM imenom; postojeći fajl se NIKAD ne prepisuje
const fs = require('fs');
const path = require('path');

const { titleTspans } = require('../lib/poster-title');

const CONFIRM = process.argv.includes('--confirm');
const REGEN = process.argv.includes('--regen-posters');
const GENERIC = '/uploads/images/predavanjeslika.jpg'; // default slika aplikacije, nikad se ne prepisuje
const data = require('./wayback-data.json');
const IMG_DIR = path.join(__dirname, '..', '..', 'uploads', 'images');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const initials = (n) => String(n).split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const PALETTES = [
  ['#0f766e', '#134e4a'], ['#1d4ed8', '#1e3a8a'], ['#7c3aed', '#4c1d95'],
  ['#b45309', '#78350f'], ['#be123c', '#881337'], ['#047857', '#064e3b'],
  ['#0369a1', '#0c4a6e'], ['#a21caf', '#701a75']
];
const grad = (i) => {
  const [a, b] = PALETTES[i % PALETTES.length];
  return `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
};
const poster = (i, title, sub, city) => `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1131">${grad(i)}
  <rect width="800" height="1131" fill="url(#g)"/>
  <rect x="60" y="60" width="680" height="1011" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="3"/>
  <text x="400" y="200" font-family="sans-serif" font-size="36" fill="#fff" opacity="0.8" text-anchor="middle" letter-spacing="8">PREDAVANJE</text>
  ${titleTspans(title)}
  ${titleTspans(sub, { cy: 720, maxLines: 1, fontSize: 40, minFont: 28, weight: 400 })}
  <text x="400" y="960" font-family="sans-serif" font-size="40" fill="#fff" opacity="0.9" text-anchor="middle">${esc(city)}</text></svg>`;
const avatar = (i, name, round) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">${grad(i + 3)}
  <rect width="600" height="600" rx="${round ? 300 : 60}" fill="url(#g)"/>
  <text x="300" y="350" font-family="sans-serif" font-weight="700" font-size="220" fill="#fff" text-anchor="middle">${esc(initials(name))}</text></svg>`;

const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const nameOf = (v) => (v && typeof v === 'object' ? v.name : v) || '';
const toDate = (v) => (v ? new Date(v) : undefined);

// --- Normalizacija ---
const daije = data.daijas.map((d) => ({
  _id: d._id, name: d.name, title: d.title, dateOfBirth: toDate(d.dateOfBirth),
  biography: d.biography || '', shortDescription: d.shortDescription || '',
  education: d.education || [], image: d.image, status: 'approved',
  createdAt: toDate(d.createdAt), updatedAt: toDate(d.updatedAt)
}));
const orgs = data.organizations.map((o) => ({
  _id: o._id, name: o.name, description: o.description, address: o.address, city: o.city,
  facebook: o.facebook, instagram: o.instagram, telegram: o.telegram, viber: o.viber,
  image: o.image, status: 'approved', createdAt: toDate(o.createdAt), updatedAt: toDate(o.updatedAt)
}));
const lectures = data.lectures.map((l) => {
  const dj = (l.daijaId && daije.find((d) => d._id === l.daijaId)) || null;
  return {
    _id: l._id,
    title: l.title,
    daija: l.daijaId || undefined,
    organization: (nameOf(l.organization) || nameOf(l.organizationId)).trim() || undefined,
    address: l.address, city: l.city, time: l.time,
    date: new Date(l.date),
    image: (!l.image || l.image === GENERIC) ? `/uploads/images/restored-lecture-${l._id}.webp` : l.image,
    _sub: dj ? `${dj.title}. ${dj.name}` : (l.speaker || '')
  };
});

const bad = [...daije.filter((d) => !['prof', 'mr', 'dr'].includes(d.title)).map((d) => `daija ${d._id} title=${d.title}`),
  ...lectures.filter((l) => isNaN(l.date)).map((l) => `ders ${l._id} loš datum`)];
console.log(`📦 Wayback: ${lectures.length} dersova, ${daije.length} daija, ${orgs.length} organizacija`);
const imgs = new Map(); // putanja → generator SVG-a
lectures.forEach((l, i) => imgs.set(l.image, () => poster(hash(l.image), l.title, l._sub, l.city || '')));
daije.forEach((d, i) => d.image && imgs.set(d.image, () => avatar(i, d.name, true)));
orgs.forEach((o, i) => o.image && imgs.set(o.image, () => avatar(i + 2, o.name, false)));
const missing = [...imgs.keys()].filter((p) => !fs.existsSync(path.join(IMG_DIR, path.basename(p))));
console.log(`🖼️  Slika: ${imgs.size} jedinstvenih putanja, ${missing.length} nedostaje (dobiće placeholder)`);
if (bad.length) console.log('⚠️  Problemi:', bad);

// --regen-posters: bez baze; prepisuje samo placeholdere dersova (tačno 800×1131), prave slike ostaju.
if (REGEN) {
  const sharp = require('sharp');
  (async () => {
    let regen = 0, skipped = 0;
    for (const l of lectures) {
      const file = path.join(IMG_DIR, path.basename(l.image));
      if (!fs.existsSync(file)) { skipped++; continue; }
      const m = await sharp(file).metadata();
      if (m.width !== 800 || m.height !== 1131) { skipped++; continue; }
      const img = sharp(Buffer.from(imgs.get(l.image)()));
      const buf = await (/\.jpe?g$/i.test(file) ? img.jpeg({ quality: 85 }) : /\.png$/i.test(file) ? img.png() : img.webp({ quality: 85 })).toBuffer();
      fs.writeFileSync(file, buf);
      regen++;
    }
    console.log(`✅ Regenerisano postera: ${regen}, preskočeno (nije placeholder/ne postoji): ${skipped}`);
  })().catch((e) => { console.error('❌', e.message); process.exit(1); });
  return;
}

if (!CONFIRM) {
  console.log('ℹ️  Dry-run. Dodaj --confirm za stvarni import.');
  process.exit(0);
}

const mongoose = require('mongoose');
const sharp = require('sharp');
const Lecture = require('../../models/Lecture');
const Daija = require('../../models/Daija');
const Organization = require('../../models/Organization');

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('❌ MONGODB_URI nije postavljen'); process.exit(1); }
  fs.mkdirSync(IMG_DIR, { recursive: true });
  await mongoose.connect(uri);
  console.log('✅ Povezan:', uri);

  const up = (Model, docs) => Model.bulkWrite(docs.map(({ _sub, ...doc }) => {
    Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
    return { updateOne: { filter: { _id: doc._id }, update: { $set: doc }, upsert: true } };
  }), { timestamps: false });

  await up(Daija, daije);
  await up(Organization, orgs);
  await up(Lecture, lectures);

  let made = 0;
  for (const p of missing) {
    const file = path.join(IMG_DIR, path.basename(p));
    if (fs.existsSync(file)) continue; // nikad ne prepisuj
    const img = sharp(Buffer.from(imgs.get(p)()));
    await (/\.jpe?g$/i.test(file) ? img.jpeg({ quality: 85 }) : /\.png$/i.test(file) ? img.png() : img.webp({ quality: 85 })).toFile(file);
    made++;
  }

  const [l, d, o] = await Promise.all([Lecture.countDocuments(), Daija.countDocuments(), Organization.countDocuments()]);
  console.log(`✅ Gotovo. U bazi: ${l} dersova, ${d} daija, ${o} organizacija. Napravljeno placeholdera: ${made}`);
  await mongoose.disconnect();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
