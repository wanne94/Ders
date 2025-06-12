// Load environment-specific configuration
const path = require('path');
const dotenv = require('dotenv');

// Determine which .env file to load based on NODE_ENV
const envFile = process.env.NODE_ENV === 'development' 
  ? '.env.development' 
  : process.env.NODE_ENV === 'production' 
    ? '.env' 
    : '.env.local';

console.log(`🔧 Loading environment from: ${envFile}`);
dotenv.config({ path: path.resolve(__dirname, envFile) });

const mongoose = require('mongoose');

// Connect to MongoDB using environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Predavanja';
console.log(`🔗 Connecting to: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')}`);
mongoose.connect(MONGODB_URI);

// Define schema (copy from the model)
const daijaSchema = new mongoose.Schema({
  name: String,
  title: String,
  dateOfBirth: Date,
  biography: String,
  shortDescription: String,
  education: [String],
  image: String,
  status: String,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
});

const Daija = mongoose.model('Daija', daijaSchema);

async function checkDB() {
  try {
    console.log('🔄 Checking database...');
    
    const daije = await Daija.find().limit(1);
    
    if (daije.length > 0) {
      const firstDaija = daije[0];
      console.log('🔍 First daija from DB:');
      console.log('  _id:', firstDaija._id);
      console.log('  name:', firstDaija.name);
      console.log('  title:', firstDaija.title);
      console.log('  All fields:', Object.keys(firstDaija.toObject()));
      console.log('  Raw object:', firstDaija.toObject());
    } else {
      console.log('❌ No daije found in database');
    }
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDB(); 