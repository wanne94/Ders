// Mapiranje dersova na daije (daija ref) i udruženja (organizationId ref). SAMO DEV BAZA.
// Dry-run po defaultu (ispis mapiranja); --confirm piše u bazu. Odbija URI bez "ders_dev".
// Iz server/:
//   NODE_ENV=development node -r dotenv/config scripts/restore/map-lectures.js dotenv_config_path=.env.development [--confirm]
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const CONFIRM = process.argv.includes('--confirm');
const wayback = require('./wayback-data.json');
const IMG_DIR = path.join(__dirname, '..', '..', 'uploads', 'images');

const Lecture = require('../../models/Lecture');
const Daija = require('../../models/Daija');
const Organization = require('../../models/Organization');

// ---------- Konfiguracija mapiranja ----------
// Alias (trim + lowercase tekst iz Lecture.organization) → tačan naziv postojećeg udruženja
const ORG_ALIASES = {
  'mesdžid kurtuba': 'Mesdžid Kurtuba O.U',
  'savjet': 'U.G. Savjet', 'ug savjet': 'U.G. Savjet',
  'sebilj': 'Udruženje Sebilj',
  'svjetlost bugojno': 'Udruženje Svjetlost Bugojno',
  'svjetlost maglaj': 'Udruženje Svjetlost Maglaj', 'udruzez svjetlost maglaj': 'Udruženje Svjetlost Maglaj',
  'tempo vogošća': 'Udruženje Tempo Vogošća',
  'u.g ehlus-sunne': 'U.G. Ehlus-Sunne',
  'kutbhana visoko': 'Udruženje Kutubhana - Visoko',
  'dobro aktiv': 'Udruženje Dobri Aktiv',
  'fokus zenica': 'Udruženje Fokus Zenica',
  'riznica': 'Udruženje Riznica'
  // 'oaza tuzla' se poklapa po imenu (OAZA Tuzla) case-insensitive
};
// Nova udruženja: naziv → varijante teksta (lowercase)
const NEW_ORGS = {
  'Sultan': ['sultan'],
  'Pozitiva': ['pozitiva'],
  'Pozitiva Banovići': ['pozitiva banovići'],
  'Tullabul Ilm': ['tullabul ilm', 'talibul ilm'],
  'Elif': ['elif'],
  'Izvor Osjek': ['izvor osjek'],
  'Zora': ['zora', 'ug zora'],
  'Bistri Izvor': ['bistri izvor'],
  'Sloga': ['sloga'],
  'Oaza Zavidovići': ['oaza zavidovići'],
  'Izvor Selsebil': ['izvor selsebil'],
  'Džemat Sarajevo': ['džemat sarajevo']
};
// Nove daije (muške; hfz. Emina Ljubunčić namjerno izostavljena)
const NEW_DAIJE = [
  { name: 'Adnan Fetić', title: 'prof' },
  { name: 'Harun Ekinović', title: 'prof' },
  { name: 'hfz. Sead Subašić', title: 'prof' },
  { name: 'Amir Durmić', title: 'prof' }, // bez titule u izvoru → default
  { name: 'Fahret Kadrić', title: 'mr' },
  { name: 'Mersed Suljkanović', title: 'prof' },
  { name: 'Nisad Drndić', title: 'prof' }, // bez titule u izvoru → default
  { name: 'Adnan Muratović', title: 'prof' },
  { name: 'Adis Memić', title: 'prof' }
];

// ---------- Helperi ----------
const strip = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
const lc = (s) => String(s || '').trim().toLowerCase();
// Ime daije bez titula, interpunkcije i dijakritika
const personKey = (s) => strip(s).toLowerCase()
  .replace(/\b(prof|mr|dr|hfz|ef|ef\.)\b\.?/g, ' ')
  .replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const initials = (n) => String(n).split(' ').filter((w) => /^[\p{L}]/u.test(w) && !/\./.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const PALETTES = [['#0f766e', '#134e4a'], ['#1d4ed8', '#1e3a8a'], ['#7c3aed', '#4c1d95'], ['#b45309', '#78350f'], ['#be123c', '#881337'], ['#047857', '#064e3b']];
const avatar = (i, name) => {
  const [a, b] = PALETTES[i % PALETTES.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="600" height="600" rx="300" fill="url(#g)"/>
  <text x="300" y="350" font-family="sans-serif" font-weight="700" font-size="220" fill="#fff" text-anchor="middle">${esc(initials(name))}</text></svg>`;
};
const slug = (s) => personKey(s).replace(/\s+/g, '-');

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.includes('ders_dev')) {
    console.error('❌ Odbijeno: MONGODB_URI nije postavljen ili ne sadrži "ders_dev":', uri ? uri.replace(/\/\/.*@/, '//…@') : uri);
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log(`✅ Povezan: ${uri} | ${CONFIRM ? 'CONFIRM (piše)' : 'DRY-RUN'}`);

  const [orgs, daije, lectures] = await Promise.all([
    Organization.find().lean(), Daija.find().lean(), Lecture.find().lean()
  ]);
  const wbLecture = new Map(wayback.lectures.map((l) => [l._id, l]));
  const before = {
    daija: lectures.filter((l) => l.daija).length,
    org: lectures.filter((l) => l.organizationId).length
  };

  // ---- 1. Trim naziva udruženja ----
  const orgOps = [];
  const orgByName = new Map(); // lc(trim name) → {_id, name}
  const orgById = new Map();
  for (const o of orgs) {
    const name = (o.name || '').trim();
    if (name !== o.name) orgOps.push({ updateOne: { filter: { _id: o._id }, update: { $set: { name } } } });
    orgByName.set(lc(name), { _id: o._id, name });
    orgById.set(String(o._id), { _id: o._id, name });
  }

  // ---- 2c. Nova udruženja (samo ako ne postoje) ----
  const variantToNew = new Map();
  for (const [name, variants] of Object.entries(NEW_ORGS)) variants.forEach((v) => variantToNew.set(v, name));
  const newOrgs = new Map(); // naziv → doc
  const cityVotes = {};
  const resolveOrg = (text) => {
    const t = lc(text);
    if (!t) return null;
    if (orgByName.has(t)) return orgByName.get(t);
    if (ORG_ALIASES[t] && orgByName.has(lc(ORG_ALIASES[t]))) return orgByName.get(lc(ORG_ALIASES[t]));
    const newName = variantToNew.get(t);
    if (newName) {
      if (orgByName.has(lc(newName))) return orgByName.get(lc(newName));
      if (!newOrgs.has(newName)) newOrgs.set(newName, { _id: new mongoose.Types.ObjectId(), name: newName });
      return newOrgs.get(newName);
    }
    return null;
  };

  // ---- 3. Daije ----
  const daijaByKey = new Map(daije.map((d) => [personKey(d.name), d._id]));
  const newDaijaByKey = new Map();
  const resolveDaija = (speaker) => {
    const k = personKey(speaker);
    if (!k) return null;
    if (daijaByKey.has(k)) return { _id: daijaByKey.get(k), isNew: false };
    if (newDaijaByKey.has(k)) return { _id: newDaijaByKey.get(k)._id, isNew: true };
    const spec = NEW_DAIJE.find((d) => personKey(d.name) === k);
    if (!spec) return null;
    const doc = { ...spec, _id: new mongoose.Types.ObjectId() };
    newDaijaByKey.set(k, doc);
    return { _id: doc._id, isNew: true };
  };

  // ---- Plan po dersu ----
  const lectureOps = [];
  const rows = [];
  const unmappedOrg = [];
  const unmappedDaija = [];
  for (const l of lectures) {
    const wb = wbLecture.get(String(l._id)) || {};
    const $set = {};
    let orgRes = null;
    let how = '';

    // a) organizationId iz wayback-a, ako postoji u bazi
    const wbOrgId = wb.organizationId && (wb.organizationId._id || wb.organizationId);
    if (wbOrgId && orgById.has(String(wbOrgId))) { orgRes = orgById.get(String(wbOrgId)); how = 'wayback-id'; }
    // b/c) po tekstu (alias / novo)
    else if (l.organization) { orgRes = resolveOrg(l.organization); how = orgRes ? 'tekst' : ''; }
    if (orgRes) {
      if (l.city) (cityVotes[orgRes.name] ||= {})[l.city.trim()] = ((cityVotes[orgRes.name] || {})[l.city.trim()] || 0) + 1;
      $set.organizationId = orgRes._id;
      $set.organization = orgRes.name;
    } else {
      unmappedOrg.push(`${l._id} | org="${l.organization ?? ''}" | ${l.city || ''}`);
    }

    // daija
    let dj = null;
    if (!l.daija) {
      dj = resolveDaija(wb.speaker);
      if (dj) $set.daija = dj._id;
      else unmappedDaija.push(`${l._id} | speaker="${wb.speaker ?? ''}"`);
    }

    if (Object.keys($set).length) lectureOps.push({ updateOne: { filter: { _id: l._id }, update: { $set } } });
    if (orgRes || dj) rows.push(`${String(l._id).slice(-6)}  org: ${orgRes ? `${orgRes.name} (${how}${newOrgs.has(orgRes.name) ? ', NOVO' : ''})` : '—'}  |  daija: ${dj ? `${wb.speaker?.trim()}${dj.isNew ? ' (NOVA)' : ''}` : (l.daija ? 'već ima' : '—')}`);
  }

  // Gradovi novih udruženja (najčešći iz dersova)
  for (const o of newOrgs.values()) {
    const v = cityVotes[o.name] || {};
    o.city = Object.entries(v).sort((a, b) => b[1] - a[1])[0]?.[0];
  }

  // ---- Ispis ----
  console.log('\n— Mapiranje (samo dersovi s promjenom) —');
  rows.forEach((r) => console.log(r));
  console.log(`\n— Trim naziva udruženja: ${orgOps.length}`);
  console.log(`— Nova udruženja (${newOrgs.size}): ${[...newOrgs.values()].map((o) => `${o.name} [${o.city || '?'}]`).join(', ') || 'nema'}`);
  console.log(`— Nove daije (${newDaijaByKey.size}): ${[...newDaijaByKey.values()].map((d) => `${d.title} ${d.name}`).join(', ') || 'nema'}`);
  console.log(`\n— Dersovi bez udruženja (${unmappedOrg.length}):`);
  unmappedOrg.forEach((r) => console.log('  ', r));
  console.log(`\n— Dersovi bez daije (${unmappedDaija.length}):`);
  unmappedDaija.forEach((r) => console.log('  ', r));

  const after = {
    daija: before.daija + lectureOps.filter((o) => o.updateOne.update.$set.daija).length,
    org: new Set(lectureOps.filter((o) => o.updateOne.update.$set.organizationId).map((o) => String(o.updateOne.filter._id)))
      .size + lectures.filter((l) => l.organizationId && !lectureOps.some((o) => String(o.updateOne.filter._id) === String(l._id) && o.updateOne.update.$set.organizationId)).length
  };
  console.log(`\nStatistika (od ${lectures.length}): daija ${before.daija} → ${after.daija}, organizationId ${before.org} → ${after.org}`);

  if (!CONFIRM) {
    console.log('\nℹ️  Dry-run. Dodaj --confirm za pisanje u bazu.');
    await mongoose.disconnect();
    return;
  }

  // ---- Pisanje ----
  if (orgOps.length) await Organization.bulkWrite(orgOps, { timestamps: false });
  if (newOrgs.size) {
    await Organization.insertMany([...newOrgs.values()].map((o) => ({ ...o, type: 'Udruženje', status: 'approved' })));
  }
  if (newDaijaByKey.size) {
    fs.mkdirSync(IMG_DIR, { recursive: true });
    const sharp = require('sharp');
    let i = 0;
    const docs = [];
    for (const d of newDaijaByKey.values()) {
      const rel = `/uploads/images/placeholder-daija-${slug(d.name)}.webp`;
      const file = path.join(IMG_DIR, path.basename(rel));
      if (!fs.existsSync(file)) await sharp(Buffer.from(avatar(i, d.name))).webp({ quality: 85 }).toFile(file); // nikad ne prepisuj
      docs.push({ _id: d._id, name: d.name, title: d.title, image: rel, status: 'approved' });
      i++;
    }
    await Daija.insertMany(docs);
  }
  if (lectureOps.length) await Lecture.bulkWrite(lectureOps, { timestamps: false });

  const [wd, wo] = await Promise.all([
    Lecture.countDocuments({ daija: { $exists: true, $ne: null } }),
    Lecture.countDocuments({ organizationId: { $exists: true, $ne: null } })
  ]);
  console.log(`✅ Gotovo. U bazi: dersova s daijom ${wd}, s organizationId ${wo}`);
  await mongoose.disconnect();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
