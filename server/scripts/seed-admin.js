// Jednokratna skripta za kreiranje prvog admin naloga.
// Pokreni sa env varijablama, npr:
// ADMIN_USERNAME=admin ADMIN_EMAIL=admin@ders.ba ADMIN_PASSWORD='...' ADMIN_SECURITY_ANSWER='...' node scripts/seed-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ders_production';

async function seedAdmin() {
  const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SECURITY_ANSWER } = process.env;

  if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_SECURITY_ANSWER) {
    console.error('❌ Nedostaju env varijable: ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SECURITY_ANSWER');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Povezan na MongoDB:', MONGODB_URI);

    const existing = await User.findOne({ $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }] });
    if (existing) {
      console.log('❌ Korisnik sa ovim username/email već postoji:', existing.username, existing.email, existing.role);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const hashedSecurityAnswer = await bcrypt.hash(ADMIN_SECURITY_ANSWER.toLowerCase().trim(), 10);

    const admin = new User({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'super_admin',
      securityQuestionIndex: 0,
      securityAnswer: hashedSecurityAnswer
    });

    await admin.save();

    console.log('✅ Admin nalog kreiran:', admin.username, admin.email, admin.role, admin._id.toString());
  } catch (error) {
    console.error('❌ Greška:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
