const jwt = require('jsonwebtoken');
const JWT_SECRET = 'neka-jaka-tajna-AvdoWanNe1994';

// Generiši token kao super_admin
const token = jwt.sign(
  {
    id: '683f7e5a3cf9e5613ae39548',
    username: 'Avdo',
    role: 'super_admin'
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('Token za testiranje:');
console.log(token);
console.log('\nCURL komanda:');
console.log(`curl -X PATCH http://localhost:5004/api/organizations/68b2076a9a55d127bc3806a4 \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{"status":"approved"}'`);