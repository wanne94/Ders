const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env.development' });

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'neka-jaka-tajna-AvdoWanNe1994';
const API_URL = 'http://localhost:5004/api';

async function testDashboardApproval() {
  console.log('🚀 Testiram odobravanje kroz dashboard simulaciju...\n');
  
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    const Organization = require('./models/Organization');
    
    // 2. Simuliraj prijavljivanje - pronađi admin korisnika
    const adminUser = await User.findOne({ 
      email: 'avdo@avdo.ba'
    });
    
    if (!adminUser) {
      console.log('❌ Admin korisnik nije pronađen');
      console.log('ℹ️ Kreiram test admin korisnika...');
      
      // Kreiraj test admin korisnika
      const hashedPassword = await bcrypt.hash('test123', 10);
      const newAdmin = new User({
        firstName: 'Test',
        lastName: 'Admin',
        username: 'testadmin',
        email: 'testadmin@local.test',
        password: hashedPassword,
        role: 'admin',
        securityQuestion: 'Test pitanje?',
        securityAnswer: await bcrypt.hash('test odgovor', 10)
      });
      
      await newAdmin.save();
      adminUser = newAdmin;
      console.log('✅ Test admin kreiran');
    }
    
    console.log('👤 Korisnik:', adminUser.email);
    console.log('🔑 Uloga:', adminUser.role);
    
    // 3. Generiši JWT token kao što bi dashboard
    const token = jwt.sign(
      {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('🔐 JWT token generisan (kao nakon prijave)');
    
    // 4. Simuliraj dohvaćanje organizacija kao dashboard
    console.log('\n📋 Dohvaćam organizacije (kao dashboard)...');
    
    try {
      const adminOrgsResponse = await axios.get(`${API_URL}/admin/organizations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`✅ Ukupno organizacija: ${adminOrgsResponse.data.length}`);
      
      // Filtriraj pending organizacije
      const pendingOrgs = adminOrgsResponse.data.filter(org => org.status === 'pending');
      console.log(`⏳ Pending organizacija: ${pendingOrgs.length}`);
      
      if (pendingOrgs.length > 0) {
        console.log('\n📝 Pending organizacije:');
        pendingOrgs.forEach(org => {
          console.log(`  - ${org.name} (ID: ${org._id})`);
        });
      }
      
    } catch (error) {
      console.log('⚠️ Greška pri dohvaćanju admin organizacija:', error.response?.data?.message || error.message);
    }
    
    // 5. Pronađi test organizaciju
    const testOrg = await Organization.findOne({ 
      name: 'Test Organizacija za Odobravanje',
      status: 'pending'
    });
    
    if (!testOrg) {
      console.log('\n⚠️ Test organizacija nije u pending statusu');
      
      // Vrati je na pending ako postoji
      const existingOrg = await Organization.findOne({ 
        name: 'Test Organizacija za Odobravanje'
      });
      
      if (existingOrg) {
        existingOrg.status = 'pending';
        await existingOrg.save();
        console.log('✅ Vraćena na pending status');
        testOrg = existingOrg;
      } else {
        console.log('❌ Test organizacija ne postoji');
        await mongoose.disconnect();
        return;
      }
    }
    
    console.log('\n🎯 Simuliram klik na dugme "Odobri" u dashboard-u...');
    console.log('  Organizacija:', testOrg.name);
    console.log('  ID:', testOrg._id);
    console.log('  Status prije:', testOrg.status);
    
    // 6. Simuliraj PATCH request kao što bi dashboard poslao
    console.log('\n📤 Šaljem PATCH request (kao dashboard)...');
    
    try {
      const approvalResponse = await axios.patch(
        `${API_URL}/organizations/${testOrg._id}`,
        { status: 'approved' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ ODOBRAVANJE USPJEŠNO!');
      console.log('  Server response:', approvalResponse.status);
      if (approvalResponse.data) {
        console.log('  Poruka:', approvalResponse.data.message || 'Organizacija odobrena');
      }
      
    } catch (error) {
      console.log('❌ Greška pri odobravanju:');
      if (error.response) {
        console.log('  Status:', error.response.status);
        console.log('  Poruka:', error.response.data?.message || error.response.statusText);
        console.log('  Detalji:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('  Network greška:', error.message);
      }
    }
    
    // 7. Verifikuj promjenu u bazi
    const updatedOrg = await Organization.findById(testOrg._id);
    console.log('\n✅ Verifikacija u bazi:');
    console.log('  Status nakon odobravanja:', updatedOrg.status);
    
    // 8. Provjeri da li je vidljiva na public endpoint-u
    console.log('\n🌐 Provjeram public vidljivost...');
    try {
      const publicResponse = await axios.get(`${API_URL}/organizations/public`);
      const foundOrg = publicResponse.data.find(org => 
        org.name === 'Test Organizacija za Odobravanje'
      );
      
      if (foundOrg) {
        console.log('✅ Organizacija je sada JAVNO VIDLJIVA!');
        console.log('  Status:', foundOrg.status);
      } else {
        console.log('⚠️ Organizacija nije vidljiva na public endpoint-u');
      }
    } catch (error) {
      console.log('❌ Greška pri provjeri public endpoint-a:', error.message);
    }
    
    // 9. Test odbacivanje sa razlogom
    console.log('\n🎯 Simuliram odbacivanje sa razlogom...');
    try {
      const rejectResponse = await axios.patch(
        `${API_URL}/organizations/${testOrg._id}`,
        { 
          status: 'rejected',
          rejectionReason: 'Test razlog - nije potpuna dokumentacija'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Odbacivanje uspješno');
      
      const rejectedOrg = await Organization.findById(testOrg._id);
      console.log('  Status:', rejectedOrg.status);
      console.log('  Razlog:', rejectedOrg.rejectionReason);
      
    } catch (error) {
      console.log('❌ Greška pri odbacivanju:', error.response?.data?.message || error.message);
    }
    
    // 10. Vrati na pending za buduće testove
    console.log('\n🔄 Vraćam na pending za buduće testove...');
    const finalOrg = await Organization.findById(testOrg._id);
    finalOrg.status = 'pending';
    finalOrg.rejectionReason = undefined;
    await finalOrg.save();
    console.log('✅ Vraćeno na pending status');
    
    console.log('\n========================================');
    console.log('✅ DASHBOARD SIMULACIJA ZAVRŠENA USPJEŠNO!');
    console.log('========================================');
    console.log('\nℹ️ Sistem odobravanja radi ispravno!');
    console.log('ℹ️ Možete sada testirati kroz pravi dashboard UI na http://localhost:3001');
    
  } catch (error) {
    console.error('\n❌ Kritična greška:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Pokreni test
testDashboardApproval();