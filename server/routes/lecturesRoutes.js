const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Lecture = require('../models/Lecture');
const { authMiddleware: authenticateToken } = require('../utils/jwt');
const { isAdminOrSuperAdmin } = require('../middleware/auth');

// GET /public - Vraca sve lectures (samo image + date)
router.get('/public', async (req, res) => {
  try {
    const lectures = await Lecture.find({})
      .sort({ date: -1 })
      .populate('daija', 'name title')
      .lean();

    res.json(lectures);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Greska pri dohvacanju predavanja' });
  }
});

// GET /latest - Najnovija predavanja
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const lectures = await Lecture.find({})
      .sort({ date: -1 })
      .limit(limit)
      .populate('daija', 'name title')
      .lean();

    res.json(lectures);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Greska pri dohvacanju predavanja' });
  }
});

// GET /:id - Jedno predavanje po ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID format' });
    }

    const lecture = await Lecture.findById(req.params.id).populate('daija', 'name title').lean();

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Predavanje nije pronadjeno' });
    }

    res.json(lecture);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Greska pri dohvacanju predavanja' });
  }
});

// POST / - Kreiranje novog predavanja
router.post('/', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const { title, image, date, daija, organization, address, city, time } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Datum je obavezan.' });
    }

    // Validacija: datum ne smije biti u proslosti
    const lectureDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lectureDate < today) {
      return res.status(400).json({ success: false, message: 'Datum predavanja ne moze biti u proslosti.' });
    }

    const newLecture = new Lecture({
      title: title || '',
      daija: mongoose.Types.ObjectId.isValid(daija) ? daija : undefined,
      organization: organization || '',
      address: address || '',
      city: city || '',
      time: time || '',
      image: image || '',
      date: lectureDate
    });

    const savedLecture = await newLecture.save();

    res.status(201).json({
      success: true,
      message: 'Predavanje uspjesno kreirano',
      lecture: savedLecture
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Greska pri kreiranju predavanja', error: error.message });
  }
});

// PUT /:id - Update predavanja (samo image i date)
router.put('/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID format' });
    }

    const { title, image, date, daija, organization, address, city, time } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (daija !== undefined) updateData.daija = mongoose.Types.ObjectId.isValid(daija) ? daija : null;
    if (organization !== undefined) updateData.organization = organization;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (time !== undefined) updateData.time = time;
    if (image !== undefined) updateData.image = image;
    if (date !== undefined) updateData.date = new Date(date);

    const updatedLecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedLecture) {
      return res.status(404).json({ success: false, message: 'Predavanje nije pronadjeno' });
    }

    res.json({
      success: true,
      message: 'Predavanje uspjesno azurirano',
      lecture: updatedLecture
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Greska pri azuriranju predavanja', error: error.message });
  }
});

// DELETE /:id - Brisanje predavanja
router.delete('/:id', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Neispravan ID format' });
    }

    const lecture = await Lecture.findByIdAndDelete(req.params.id);

    if (!lecture) {
      return res.status(404).json({ success: false, message: 'Predavanje nije pronadjeno' });
    }

    res.json({
      success: true,
      message: 'Predavanje uspjesno obrisano'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Greska pri brisanju predavanja', error: error.message });
  }
});

// POST /bulk/delete - Bulk brisanje (admin)
router.post('/bulk/delete', authenticateToken, isAdminOrSuperAdmin, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'IDs su obavezni' });
    }

    const result = await Lecture.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `Uspjesno obrisano ${result.deletedCount} predavanja`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Greska pri brisanju predavanja', error: error.message });
  }
});

module.exports = router;
