const axios = require('axios');

async function testAPI() {
  try {
    console.log('🔄 Testing API...');
    const response = await axios.get('http://localhost:5003/api/daije');
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Number of daije:', response.data.length);
    
    if (response.data.length > 0) {
      const firstDaija = response.data[0];
      console.log('🔍 First daija structure:');
      console.log('  _id:', firstDaija._id);
      console.log('  title:', firstDaija.title);
      console.log('  name:', firstDaija.name);
      console.log('  firstName:', firstDaija.firstName);
      console.log('  lastName:', firstDaija.lastName);
      console.log('  All keys:', Object.keys(firstDaija));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI(); 