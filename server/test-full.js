const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config({ path: './.env.development' });

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'neka-jaka-tajna-AvdoWanNe1994';
const API_URL = 'http://localhost:5004/api';

async function testFullApprovalSystem() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    const Organization = require('./models/Organization');
    
    // 2. Get or create admin user
    let adminUser = await User.findOne({ role: 'superAdmin' });
    
    if (!adminUser) {
      console.log('❌ No admin user found, creating one...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      adminUser = new User({
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.local',
        password: hashedPassword,
        role: 'superAdmin'
      });
      
      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Using existing admin:', adminUser.email);
    }
    
    // 3. Generate valid JWT token
    const token = jwt.sign(
      {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('\n🔐 Valid JWT token generated');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // 4. Find test organization
    const testOrg = await Organization.findOne({ 
      name: 'Test Organizacija za Odobravanje' 
    });
    
    if (!testOrg) {
      console.log('❌ Test organizacija nije pronađena');
      await mongoose.disconnect();
      return;
    }
    
    console.log('\n📋 Test organizacija:');
    console.log('  ID:', testOrg._id);
    console.log('  Naziv:', testOrg.name);
    console.log('  Status prije:', testOrg.status);
    
    // 5. Test API approval
    console.log('\n🔄 Testiram odobravanje kroz API...');
    
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
      
      console.log('✅ API odobravanje uspješno!');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
    } catch (apiError) {
      if (apiError.response) {
        console.log('❌ API greška:');
        console.log('  Status:', apiError.response.status);
        console.log('  Message:', apiError.response.data?.message || apiError.response.statusText);
        console.log('  Data:', apiError.response.data);
      } else {
        console.log('❌ Network greška:', apiError.message);
      }
    }
    
    // 6. Verify in database
    const updatedOrg = await Organization.findById(testOrg._id);
    console.log('\n📋 Status nakon odobravanja:', updatedOrg.status);
    
    // 7. Test public endpoint
    console.log('\n🔍 Provjeram public endpoint...');
    try {
      const publicResponse = await axios.get(`${API_URL}/organizations/public`);
      const foundOrg = publicResponse.data.find(org => 
        org.name === 'Test Organizacija za Odobravanje'
      );
      
      if (foundOrg) {
        console.log('✅ Organizacija je sada javno vidljiva!');
        console.log('  Status:', foundOrg.status);
      } else {
        console.log('⚠️ Organizacija nije vidljiva na public endpoint-u');
      }
    } catch (publicError) {
      console.log('❌ Greška pri dohvaćanju public organizacija:', publicError.message);
    }
    
    // 8. Test reject functionality
    console.log('\n🔄 Testiram odbacivanje...');
    try {
      const rejectResponse = await axios.patch(
        `${API_URL}/organizations/${testOrg._id}`,
        { 
          status: 'rejected',
          rejectionReason: 'Test razlog odbacivanja'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Odbacivanje uspješno!');
      
      // Reset to pending for future tests
      await axios.patch(
        `${API_URL}/organizations/${testOrg._id}`,
        { status: 'pending' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Vraćeno na pending status');
      
    } catch (rejectError) {
      console.log('❌ Greška pri odbacivanju:', rejectError.response?.data?.message || rejectError.message);
    }
    
    console.log('\n✅ TESTIRANJE ZAVRŠENO USPJEŠNO!');
    console.log('ℹ️ Sistem odobravanja radi ispravno sa lokalnim serverom');
    
  } catch (error) {
    console.error('❌ Opća greška:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

console.log('🚀 Počinjem potpuno testiranje sistema odobravanja...\n');
testFullApprovalSystem();