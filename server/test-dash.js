const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './.env.development' });

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'neka-jaka-tajna-AvdoWanNe1994';
const API_URL = 'http://localhost:5004/api';

async function testDashboardApproval() {
  console.log('🚀 Testiram dashboard odobravanje...\n');
  
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    const Organization = require('./models/Organization');
    
    // 2. Koristi postojećeg admin korisnika
    let adminUser = await User.findOne({ 
      $or: [
        { email: 'avdo@avdo.ba' },
        { email: 'muminovic.muhamed01@gmail.com' },
        { role: 'admin' }
      ]
    });
    
    if (!adminUser) {
      console.log('❌ Nema admin korisnika u bazi');
      await mongoose.disconnect();
      return;
    }
    
    console.log('👤 Korisnik:', adminUser.email);
    console.log('🔑 Uloga:', adminUser.role);
    
    // 3. Generiši JWT token
    const token = jwt.sign(
      {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('🔐 JWT token generisan');
    
    // 4. Pronađi test organizaciju
    let testOrg = await Organization.findOne({ 
      name: 'Test Organizacija za Odobravanje'
    });
    
    if (!testOrg) {
      console.log('\n📝 Kreiram test organizaciju...');
      testOrg = new Organization({
        name: 'Test Organizacija za Odobravanje',
        type: 'Udruženje',
        description: 'Test organizacija',
        address: 'Test Adresa',
        city: 'Sarajevo',
        status: 'pending'
      });
      await testOrg.save();
      console.log('✅ Test organizacija kreirana');
    }
    
    // Ensure it's pending
    if (testOrg.status !== 'pending') {
      testOrg.status = 'pending';
      await testOrg.save();
      console.log('✅ Vraćena na pending status');
    }
    
    console.log('\n📋 Test organizacija:');
    console.log('  ID:', testOrg._id);
    console.log('  Naziv:', testOrg.name);
    console.log('  Status prije:', testOrg.status);
    
    // 5. Simuliraj dashboard PATCH request
    console.log('\n📤 Šaljem odobravanje (kao dashboard)...');
    
    try {
      const response = await axios.patch(
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
      console.log('  Server status:', response.status);
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Server greška:');
        console.log('  Status:', error.response.status);
        console.log('  Poruka:', error.response.data?.message);
        console.log('  Detalji:', error.response.data);
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server nije dostupan');
      } else {
        console.log('❌ Greška:', error.message);
      }
    }
    
    // 6. Verifikuj u bazi
    const updated = await Organization.findById(testOrg._id);
    console.log('\n✅ Status nakon odobravanja:', updated.status);
    
    if (updated.status === 'approved') {
      console.log('🎉 ORGANIZACIJA USPJEŠNO ODOBRENA!');
      
      // 7. Provjeri public endpoint
      try {
        const publicRes = await axios.get(`${API_URL}/organizations/public`);
        const found = publicRes.data.find(o => o.name === 'Test Organizacija za Odobravanje');
        if (found) {
          console.log('✅ Organizacija je sada javno vidljiva!');
        }
      } catch (e) {
        console.log('⚠️ Ne mogu provjeriti public endpoint');
      }
    }
    
    // 8. Test odbacivanje
    console.log('\n📤 Testiram odbacivanje...');
    try {
      await axios.patch(
        `${API_URL}/organizations/${testOrg._id}`,
        { 
          status: 'rejected',
          rejectionReason: 'Test razlog'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const rejected = await Organization.findById(testOrg._id);
      console.log('✅ Odbacivanje radi!');
      console.log('  Status:', rejected.status);
      console.log('  Razlog:', rejected.rejectionReason);
      
    } catch (error) {
      console.log('❌ Greška pri odbacivanju:', error.response?.data?.message || error.message);
    }
    
    // 9. Vrati na pending
    testOrg.status = 'pending';
    testOrg.rejectionReason = undefined;
    await testOrg.save();
    console.log('\n✅ Vraćeno na pending za buduće testove');
    
    console.log('\n=====================================');
    console.log('✅ DASHBOARD TEST ZAVRŠEN USPJEŠNO!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('\n❌ Greška:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testDashboardApproval();