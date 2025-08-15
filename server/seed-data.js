const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/Predavanja';

// Schemas
const lectureSchema = new mongoose.Schema({
  naziv: String,
  opis: String,
  mjesto: String,
  datum: Date,
  vrijeme: String,
  slug: String,
  imageUrl: String,
  status: { type: String, default: 'odobreno' }
}, { timestamps: true });

const daijaSchema = new mongoose.Schema({
  naziv: String,
  opis: String,
  mjesto: String,
  datum: Date,
  vrijeme: String,
  slug: String,
  imageUrl: String,
  status: { type: String, default: 'odobreno' }
}, { timestamps: true });

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Povezano sa MongoDB');

    const Lecture = mongoose.model('Lecture', lectureSchema);
    const Daija = mongoose.model('Daija', daijaSchema);

    // Clear existing data
    await Lecture.deleteMany({});
    await Daija.deleteMany({});
    console.log('🗑️ Obrisani postojeći podaci');

    // Seed lectures
    const lectures = [
      {
        naziv: "Ramazan - mjesec posta",
        opis: "Predavanje o značaju i pravilima ramazanskog posta",
        mjesto: "Džamija Kralj Fahd, Sarajevo",
        datum: new Date('2025-03-01'),
        vrijeme: "20:00",
        slug: "ramazan-mjesec-posta",
        imageUrl: "/uploads/images/predavanjeslika.jpg",
        status: "odobreno"
      },
      {
        naziv: "Namaz - stub islama",
        opis: "Učenje o važnosti i načinu klanjanja namaza",
        mjesto: "Gazi Husrev-begova džamija, Sarajevo",
        datum: new Date('2025-02-15'),
        vrijeme: "18:30",
        slug: "namaz-stub-islama",
        imageUrl: "/uploads/images/predavanjeslika.jpg",
        status: "odobreno"
      },
      {
        naziv: "Porodica u islamu",
        opis: "Važnost porodičnih vrijednosti u islamskoj tradiciji",
        mjesto: "Islamski centar Mostar",
        datum: new Date('2025-02-20'),
        vrijeme: "19:00",
        slug: "porodica-u-islamu",
        imageUrl: "/uploads/images/predavanjeslika.jpg",
        status: "odobreno"
      }
    ];

    const daije = [
      {
        naziv: "Učenje Kur'ana za početnike",
        opis: "Osnovni kurs učenja pravilnog učenja Kur'ana",
        mjesto: "Online - Zoom",
        datum: new Date('2025-02-10'),
        vrijeme: "17:00",
        slug: "ucenje-kurana-za-pocetnike",
        imageUrl: "/uploads/images/daijaslika.jpg",
        status: "odobreno"
      },
      {
        naziv: "Tefsir sure El-Fatiha",
        opis: "Detaljno tumačenje prve sure Kur'ana",
        mjesto: "Behram-begova medresa, Tuzla",
        datum: new Date('2025-02-25'),
        vrijeme: "16:00",
        slug: "tefsir-sure-el-fatiha",
        imageUrl: "/uploads/images/daijaslika.jpg",
        status: "odobreno"
      }
    ];

    await Lecture.insertMany(lectures);
    await Daija.insertMany(daije);

    console.log('✅ Dodano', lectures.length, 'predavanja');
    console.log('✅ Dodano', daije.length, 'daija');

    // Verify data
    const lectureCount = await Lecture.countDocuments();
    const daijaCount = await Daija.countDocuments();
    console.log('\n📊 Statistika baze:');
    console.log('- Predavanja:', lectureCount);
    console.log('- Daije:', daijaCount);

    await mongoose.disconnect();
    console.log('\n✅ Seed završen uspješno!');
  } catch (error) {
    console.error('❌ Greška:', error);
    process.exit(1);
  }
}

seedDatabase();