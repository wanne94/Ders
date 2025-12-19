const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authMiddleware } = require('../utils/jwt');

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
    
    // Hash security answer for secure storage
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);
    
    const user = new User({
      username,
      email: emailValue,
      password: hashedPassword,
      securityQuestionIndex,
      securityAnswer: hashedSecurityAnswer
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

// POST /api/users/refresh-token - Refresh JWT token
router.post('/refresh-token', authMiddleware, async (req, res) => {
  try {
    // Korisnik je već autentifikovan kroz authMiddleware
    const userId = req.user.id || req.user.userId || req.user._id;
    
    // Pronađi korisnika u bazi da dobijemo najnovije podatke
    const user = await User.findById(userId).select('-password -securityAnswer');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Korisnik nije pronađen.' 
      });
    }

    // Generiši novi token sa produženim rokom
    const newToken = generateToken({ 
      id: user._id, 
      email: user.email,
      username: user.username, 
      role: user.role 
    });

    console.log('✅ Token refreshed for user:', user.username);

    res.json({ 
      success: true, 
      token: newToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Greška pri osvježavanju tokena.' 
    });
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

// GET /api/users/profile - Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -securityAnswer');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Korisnik nije pronađen.' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        rid: user.rid,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Greška pri dohvatanju profila:', error);
    res.status(500).json({ success: false, message: 'Greška na serveru.' });
  }
});

// PUT /api/users/profile - Update user profile (email)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { email, currentPassword } = req.body;

    if (!email || !currentPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email i trenutna lozinka su obavezni.' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Korisnik nije pronađen.' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Trenutna lozinka nije ispravna.' 
      });
    }

    // Check if email is already taken
    const emailExists = await User.findOne({ 
      email: email.trim().toLowerCase(),
      _id: { $ne: user._id }
    });
    if (emailExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email je već u upotrebi.' 
      });
    }

    // Update email
    user.email = email.trim().toLowerCase();
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.securityAnswer;

    res.json({
      success: true,
      message: 'Email je uspješno ažuriran.',
      user: userObj
    });
  } catch (error) {
    console.error('❌ Greška pri ažuriranju profila:', error);
    res.status(500).json({ success: false, message: 'Greška na serveru.' });
  }
});

// POST /api/users/change-password - Change user password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sva polja su obavezna.' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nova lozinka i potvrda se ne slažu.' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nova lozinka mora imati najmanje 6 karaktera.' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Korisnik nije pronađen.' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Trenutna lozinka nije ispravna.' 
      });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Lozinka je uspješno promijenjena.'
    });
  } catch (error) {
    console.error('❌ Greška pri promjeni lozinke:', error);
    res.status(500).json({ success: false, message: 'Greška na serveru.' });
  }
});

// DELETE /api/users/profile/delete - Delete own profile
router.delete('/profile/delete', authMiddleware, async (req, res) => {
  try {
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Trenutna lozinka je obavezna za brisanje profila.' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Korisnik nije pronađen.' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Trenutna lozinka nije ispravna.' 
      });
    }

    // Delete the user
    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: 'Profil je uspješno obrisan.'
    });
  } catch (error) {
    console.error('❌ Greška pri brisanju profila:', error);
    res.status(500).json({ success: false, message: 'Greška na serveru.' });
  }
});

// GET /api/users/:id/public - Get public user profile by ID
// 🔒 SECURITY: Protected - only return non-sensitive data
// Email is NOT included to prevent email harvesting attacks
router.get('/:id/public', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -securityAnswer -securityQuestionIndex -email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Korisnik nije pronađen.'
      });
    }

    // 🔒 SECURITY: Return ONLY truly public data - NO email, NO sensitive info
    const publicUserData = {
      _id: user._id,
      id: user._id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json(publicUserData);
  } catch (error) {
    console.error('❌ Greška pri dohvatanju javnog profila:', error);
    res.status(500).json({
      success: false,
      message: 'Greška na serveru.'
    });
  }
});

module.exports = router; 