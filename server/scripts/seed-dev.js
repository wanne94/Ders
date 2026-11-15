// DEV seed: generiše slike (sharp/SVG) i puni ders_dev bazu.
// Pokretanje (iz server/):
//   NODE_ENV=development node -r dotenv/config scripts/seed-dev.js dotenv_config_path=.env.development
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const sharp = require('sharp');

const { titleTspans } = require('./lib/poster-title');
const Lecture = require('../models/Lecture');
const Daija = require('../models/Daija');
const Organization = require('../models/Organization');

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI.includes('ders_dev')) {
  console.error('❌ Odbijeno: MONGODB_URI ne sadrži "ders_dev". Seed je samo za development.');
  process.exit(1);
}

const IMG_DIR = path.join(__dirname, '..', 'uploads', 'images');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const initials = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const PALETTES = [
  ['#0f766e', '#134e4a'], ['#1d4ed8', '#1e3a8a'], ['#7c3aed', '#4c1d95'],
  ['#b45309', '#78350f'], ['#be123c', '#881337'], ['#047857', '#064e3b'],
  ['#0369a1', '#0c4a6e'], ['#a21caf', '#701a75']
];

async function save(svg, name) {
  await sharp(Buffer.from(svg)).webp({ quality: 85 }).toFile(path.join(IMG_DIR, name));
  return `/uploads/images/${name}`;
}

const posterSvg = (i, title, daija, city, dateStr) => {
  const [a, b] = PALETTES[i % PALETTES.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1131">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="800" height="1131" fill="url(#g)"/>
  <circle cx="650" cy="180" r="220" fill="#fff" opacity="0.07"/>
  <circle cx="120" cy="980" r="260" fill="#fff" opacity="0.06"/>
  <rect x="60" y="60" width="680" height="1011" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="3"/>
  <text x="400" y="200" font-family="sans-serif" font-size="36" fill="#fff" opacity="0.8" text-anchor="middle" letter-spacing="8">PREDAVANJE</text>
  ${titleTspans(title)}
  ${titleTspans(daija, { cy: 720, maxLines: 1, fontSize: 44, minFont: 28, weight: 400 })}
  <text x="400" y="900" font-family="sans-serif" font-size="40" fill="#fff" opacity="0.9" text-anchor="middle">${esc(dateStr)}</text>
  <text x="400" y="960" font-family="sans-serif" font-size="40" fill="#fff" opacity="0.9" text-anchor="middle">${esc(city)}</text>
</svg>`;
};

const avatarSvg = (i, name, round) => {
  const [a, b] = PALETTES[(i + 3) % PALETTES.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="600" height="600" rx="${round ? 300 : 60}" fill="url(#g)"/>
  <text x="300" y="350" font-family="sans-serif" font-weight="700" font-size="220" fill="#fff" text-anchor="middle">${esc(initials(name))}</text>
</svg>`;
};

const daijeData = [
  { name: 'Safvet Halilović', title: 'prof', shortDescription: 'Profesor tefsira i islamske misli.', biography: 'Dugogodišnji predavač na fakultetu islamskih nauka, autor više knjiga iz oblasti tefsira.', education: ['Fakultet islamskih nauka, Sarajevo', 'Univerzitet u Kairu'] },
  { name: 'Almir Zukić', title: 'mr', shortDescription: 'Magistar fikha, redovni predavač.', biography: 'Aktivan u radu sa omladinom, održao stotine predavanja širom BiH.', education: ['Islamski pedagoški fakultet, Zenica'] },
  { name: 'Emir Hadžić', title: 'dr', shortDescription: 'Doktor šerijatskog prava.', biography: 'Doktorirao na temu savremenih pitanja u fikhu. Imam i predavač.', education: ['Univerzitet u Medini', 'Fakultet islamskih nauka, Sarajevo'] },
  { name: 'Mirza Kovačević', title: 'mr', shortDescription: 'Predavač iz oblasti akaida.', biography: 'Bavi se popularizacijom islamskog učenja kroz predavanja i radionice.', education: ['Fakultet islamskih nauka, Sarajevo'] },
  { name: 'Hasan Delić', title: 'dr', shortDescription: 'Doktor hadiskih nauka.', biography: 'Autor radova iz oblasti hadisa, saradnik više islamskih zajednica.', education: ['Univerzitet u Rijadu'] },
  { name: 'Adnan Selimović', title: 'prof', shortDescription: 'Profesor arapskog jezika i književnosti.', biography: 'Predaje arapski jezik i drži predavanja o Kur\'anu i jeziku.', education: ['Filozofski fakultet, Tuzla', 'Univerzitet Al-Azhar'] }
];

const orgsData = [
  { name: 'Udruženje Behram', city: 'Sarajevo', address: 'Ferhadija 12', description: 'Udruženje za obrazovanje i kulturu mladih u Sarajevu.' },
  { name: 'Udruženje Nur', city: 'Tuzla', address: 'Maršala Tita 5', description: 'Organizuje predavanja i radionice za porodice.' },
  { name: 'Udruženje Iqra', city: 'Zenica', address: 'Fra Ivana Jukića 3', description: 'Edukativni programi i kružoci čitanja.' },
  { name: 'Udruženje Hidaje', city: 'Mostar', address: 'Rade Bitange 8', description: 'Humanitarni i obrazovni rad u Hercegovini.' },
  { name: 'Udruženje Vrelo', city: 'Bihać', address: 'Bosanska 21', description: 'Kulturno-obrazovno udruženje Unsko-sanskog kantona.' }
];

const lecturesData = [
  { title: 'Smisao života', city: 'Sarajevo', daija: 0, offset: -12 },
  { title: 'Odgoj djece', city: 'Tuzla', daija: 1, offset: -3 },
  { title: 'Sabur u iskušenju', city: 'Zenica', daija: 2, offset: 2 },
  { title: 'Ljepota Kur\'ana', city: 'Mostar', daija: 3, offset: 5 },
  { title: 'Mladi i vjera', city: 'Bihać', daija: 4, offset: 9 },
  { title: 'Porodica i brak', city: 'Sarajevo', daija: 5, offset: 14 },
  { title: 'Ramazan i duša', city: 'Tuzla', daija: 0, offset: 21 },
  { title: 'Vrijeme i bereket', city: 'Zenica', daija: 2, offset: 30 }
];

(async () => {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Povezan:', MONGODB_URI);

  // Čišćenje starih mock slika i prethodnih seed slika
  for (const f of fs.readdirSync(IMG_DIR)) {
    if (f.startsWith('mock-') || f.startsWith('seed-')) fs.unlinkSync(path.join(IMG_DIR, f));
  }
  await Promise.all([Lecture.deleteMany({}), Daija.deleteMany({}), Organization.deleteMany({})]);

  const fmt = new Intl.DateTimeFormat('bs-BA', { day: 'numeric', month: 'long', year: 'numeric' });

  const daije = [];
  for (let i = 0; i < daijeData.length; i++) {
    const d = daijeData[i];
    const image = await save(avatarSvg(i, d.name, true), `seed-daija-${i + 1}.webp`);
    daije.push(await Daija.create({ ...d, image, status: 'approved' }));
  }

  for (let i = 0; i < orgsData.length; i++) {
    const o = orgsData[i];
    const image = await save(avatarSvg(i + 2, o.name.replace('Udruženje ', ''), false), `seed-org-${i + 1}.webp`);
    await Organization.create({ ...o, image, status: 'approved' });
  }

  for (let i = 0; i < lecturesData.length; i++) {
    const l = lecturesData[i];
    const date = new Date();
    date.setDate(date.getDate() + l.offset);
    date.setHours(19, 30, 0, 0);
    const d = daijeData[l.daija];
    const image = await save(
      posterSvg(i, l.title, `${d.title}. ${d.name}`, l.city, fmt.format(date)),
      `seed-lecture-${i + 1}.webp`
    );
    const org = orgsData.find((o) => o.city === l.city) || orgsData[0];
    await Lecture.create({
      title: l.title,
      daija: daije[l.daija]._id,
      organization: org.name,
      address: org.address,
      city: l.city,
      time: i % 2 === 0 ? '19:30' : '20:00',
      image,
      date
    });
  }

  console.log(`✅ Seed gotov: ${lecturesData.length} predavanja, ${daijeData.length} daija, ${orgsData.length} udruženja`);
  await mongoose.disconnect();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
