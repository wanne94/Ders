const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  rid: {
    type: Number,
    unique: true,
    required: false,
    default: null
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    sparse: true, // Allows multiple null values but unique non-null values
    lowercase: true,
    trim: true,
    set: v => (v === '' ? null : v),
    validate: {
      validator: function(v) {
        // If email is provided, it must be valid
        return !v || /\S+@\S+\.\S+/.test(v);
      },
      message: 'Email format nije ispravan'
    }
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  // Profile information
  firstName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  profileImage: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  organization: {
    type: String,
    trim: true,
    maxlength: 200
  },
  expertise: [{
    type: String,
    trim: true
  }],
  // Contact information
  phone: {
    type: String,
    trim: true,
    maxlength: 30
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  city: {
    type: String,
    trim: true,
    maxlength: 100
  },
  // Sigurnosno pitanje za resetovanje lozinke
  securityQuestionIndex: {
    type: Number,
    required: false,
    min: 0,
    max: 9 // Imamo 10 pitanja (indeksi 0-9)
  },
  securityAnswer: {
    type: String,
    required: true,
    lowercase: true, // Čuvamo odgovor u malim slovima za lakše poređenje
    trim: true
  },
}, {
  timestamps: true
});

// Pre-save middleware to auto-generate RID
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.rid) {
    try {
      // Find the highest RID and increment by 1
      const lastUser = await this.constructor.findOne({}, {}, { sort: { 'rid': -1 } });
      this.rid = lastUser ? lastUser.rid + 1 : 1;
      console.log('🔢 Generated RID:', this.rid);
    } catch (error) {
      console.error('❌ Error generating RID:', error);
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 