const mongoose = require('mongoose');
const Daija = require('./models/Daija');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ders');

const testDaije = [
  {
    name: 'Jasmin Durić',
    title: 'prof',
    biography: 'Šejh Jasmin Durić rođen je 3.1.1984. u Tuzli, odrastao u selu Gračanica kod Živinica. Hafiz je Kur\'ana i predavao je brojne cikluse predavanja u BiH.',
    shortDescription: 'Hafiz Kur\'ana i predavač iz akide, tefsira i hadisa',
    education: [
      '2004 – Odlazak u Damask i upis na Institut El-Fethul-islami',
      '2007 – Primljen na Islamski univerzitet u Medini',
      '2012 – Završio fakultet u Medini kao jedan od najboljih u generaciji'
    ],
    status: 'approved',
    image: '/uploads/images/daijaslika.jpg'
  },
  {
    name: 'Safet Kuduzović',
    title: 'dr',
    biography: 'Rođen u Velikoj Kladuši, Bosna i Hercegovina. Istaknuti islamski učenjak, predavač i autor brojnih knjiga.',
    shortDescription: 'Poznat po dubokom poznavanju hadiskih nauka i hanefijskog mezheba',
    education: [
      'Završio islamske nauke na Islamskom univerzitetu u Medini',
      'Magistrirao hadis na istom univerzitetu'
    ],
    status: 'approved',
    image: '/uploads/images/daijaslika.jpg'
  },
  {
    name: 'Adnan Mrkonjić',
    title: 'prof',
    biography: 'Rođen 1979. godine u Kotorskom kod Doboja. Završio Šerijatski fakultet u Kuvajtu s prosjekom 9,7 od 10.',
    shortDescription: 'Prvi Bošnjak koji je magistrirao na Šerijatskom odsjeku Univerziteta u Kuvajtu',
    education: [
      'Završio srednju islamsku školu u Kuvajtu',
      'Diplomirao na Fakultetu šerijata Kuvajtskog univerziteta',
      'Magistrirao na istom fakultetu 2013. godine'
    ],
    status: 'approved',
    image: '/uploads/images/daijaslika.jpg'
  },
  {
    name: 'Elvedin Pezić',
    title: 'dr',
    biography: 'Rođen 1977. godine u Travniku. Završio Fakultet šerijata na Islamskom univerzitetu u Medini. Autor knjige "Islamski priručnik bračne intime".',
    shortDescription: 'Doktor islamskih nauka i autor brojnih knjiga',
    education: [
      'Institut za arapski jezik u Medini',
      'Fakultet šerijata u Medini',
      'Magistrirao 2015. godine na Univerzitetu Qassim',
      'Doktorirao 2023. godine na Fakultetu za islamske studije u Novom Pazaru'
    ],
    status: 'approved',
    image: '/uploads/images/daijaslika.jpg'
  }
];

async function addTestDaije() {
  try {
    console.log('🔄 Adding test daije to local database...');
    
    // Clear existing daije
    await Daija.deleteMany({});
    console.log('🗑️ Cleared existing daije');
    
    // Add test daije
    const savedDaije = await Daija.insertMany(testDaije);
    console.log(`✅ Added ${savedDaije.length} test daije:`);
    
    savedDaije.forEach(daija => {
      console.log(`  - ${daija.title} ${daija.name} (${daija._id})`);
    });
    
    console.log('🎉 Test data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding test data:', error);
    process.exit(1);
  }
}

addTestDaije(); 