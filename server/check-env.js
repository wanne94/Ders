require('dotenv').config();

console.log('=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@') : 'NOT SET');
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

console.log('\n=== .env file check ===');
const fs = require('fs');
if (fs.existsSync('.env')) {
  console.log('.env file exists');
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log('.env content (first 200 chars):', envContent.substring(0, 200));
} else {
  console.log('.env file does not exist');
}

if (fs.existsSync('.env.development')) {
  console.log('.env.development file exists');
} else {
  console.log('.env.development file does not exist');
} 