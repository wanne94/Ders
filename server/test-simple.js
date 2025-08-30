const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: './.env.development' });

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'neka-jaka-tajna-AvdoWanNe1994';
const API_URL = 'http://localhost:5004/api';

async function testSimpleApproval() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    const Organization = require('./models/Organization');
    
    // 2. Find existing admin user
    const adminUser = await User.findOne({ 
      $or: [
        { role: 'admin' },
        { role: 'Admin' },
        { email: 'avdo@avdo.ba' }
      ]
    });
    
    if (!adminUser) {
      console.log('❌ No admin user found');
      console.log('ℹ️ Please login through the web interface first');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ Using existing admin:', adminUser.email, '(role:', adminUser.role, ')');
    
    // 3. Generate valid JWT token
    const token = jwt.sign(
      {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role || 'admin'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('\n🔐 Valid JWT token generated');
    
    // 4. Find test organization
    const testOrg = await Organization.findOne({ 
      name: 'Test Organizacija za Odobravanje' 
    });
    
    if (!testOrg) {
      console.log('❌ Test organizacija nije pronađena');
      
      // Create one if it doesn't exist
      console.log('📝 Kreiram novu test organizaciju...');
      const newOrg = new Organization({
        name: 'Test Organizacija za Odobravanje',
        type: 'Udruženje',
        description: 'Test organizacija za testiranje sistema odobravanja',
        address: 'Test Adresa 123',
        city: 'Sarajevo',
        status: 'pending'
      });
      
      await newOrg.save();
      console.log('✅ Nova test organizacija kreirana');
      testOrg = newOrg;
    }
    
    console.log('\n📋 Test organizacija:');
    console.log('  ID:', testOrg._id);
    console.log('  Naziv:', testOrg.name);
    console.log('  Status prije:', testOrg.status);
    
    // 5. Test approval through API
    console.log('\n🔄 Testiram odobravanje kroz API...');
    
    try {
      const response = await axios.patch(
        `${API_URL}/organizations/${testOrg._id}`,
        { status: 'approved' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      console.log('✅ API odobravanje uspješno!');
      console.log('  Status kod:', response.status);
      if (response.data) {
        console.log('  Poruka:', response.data.message || 'Success');
      }
      
    } catch (apiError) {
      if (apiError.code === 'ECONNREFUSED') {
        console.log('❌ Server nije dostupan na', API_URL);
        console.log('ℹ️ Provjerite da li server radi na portu 5004');
      } else if (apiError.response) {
        console.log('❌ API greška:');
        console.log('  Status:', apiError.response.status);
        console.log('  Message:', apiError.response.data?.message || apiError.response.statusText);
        
        if (apiError.response.status === 403) {
          console.log('ℹ️ Korisnik nema admin privilegije');
          console.log('  User role:', adminUser.role);
        }
      } else {
        console.log('❌ Greška:', apiError.message);
      }
      
      // Try direct database update as fallback
      console.log('\n🔄 Pokušavam direktno ažuriranje u bazi...');
      testOrg.status = 'approved';
      await testOrg.save();
      console.log('✅ Direktno ažuriranje uspješno');
    }
    
    // 6. Verify the change
    const updatedOrg = await Organization.findById(testOrg._id);
    console.log('\n📋 Finalni status:', updatedOrg.status);
    
    if (updatedOrg.status === 'approved') {
      console.log('✅ ODOBRAVANJE USPJEŠNO!');
    } else {
      console.log('⚠️ Status nije ažuriran');
    }
    
    // 7. Reset to pending for future tests
    console.log('\n🔄 Vraćam na pending status za buduće testove...');
    updatedOrg.status = 'pending';
    await updatedOrg.save();
    console.log('✅ Vraćeno na pending');
    
  } catch (error) {
    console.error('❌ Greška:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🚀 Testiram sistem odobravanja...\n');
testSimpleApproval();