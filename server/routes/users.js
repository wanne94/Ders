const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const randomNoEmail = () => `noemail-${Math.floor(Math.random() * 1000) + 1}@example.com`;

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, securityQuestionIndex, securityAnswer } = req.body;
    if (!email || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Email je obavezan.' });
    }
    const emailValue = email.trim().toLowerCase();
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email: emailValue,
      password: hashedPassword,
      securityQuestionIndex,
      securityAnswer
    });
    await user.save();
    const token = generateToken({ id: user._id, username: user.username, role: user.role });
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.securityAnswer;
    return res.status(201).json({ success: true, message: 'Korisnik uspješno registrovan!', token, user: userObj });
  } catch (error) {
    console.error('❌ Greška pri registraciji:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Korisnik sa ovim emailom ili korisničkim imenom već postoji.' });
    }
    return res.status(400).json({ success: false, message: 'Greška pri registraciji', error: error.message });
  }
});

// POST /api/users/auth
router.post('/auth', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier može biti email ili username
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/korisničko ime i lozinka su obavezni.' });
    }

    // Pronađi korisnika po emailu ili username-u (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: identifier.trim().toLowerCase() },
        { username: identifier.trim() }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Korisnik sa ovim emailom/korisničkim imenom nije pronađen.' });
    }

    // Provjeri lozinku (pretpostavljam da koristiš bcrypt)
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Pogrešan email/korisničko ime ili lozinka.' });
    }

    const token = generateToken({ id: user._id, username: user.username, role: user.role });
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.securityAnswer;
    res.json({ message: 'Uspješna prijava! Dobrodošli.', token, user: userObj });
  } catch (error) {
    console.error('❌ Greška pri prijavi:', error);
    res.status(500).json({ message: 'Greška na serveru. Molimo pokušajte ponovo.' });
  }
});

module.exports = router; 