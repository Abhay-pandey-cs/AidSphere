const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['victim', 'donor', 'ngo', 'volunteer', 'govt', 'admin'],
    default: 'victim',
  },
  phone: {
    type: String,
    required: true,
  },
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  trustLevel: {
    type: String,
    enum: ['none', 'silver', 'gold'],
    default: 'none',
  },
  skills: [String],
  // Volunteer specific fields
  volunteerType: {
    type: String,
    enum: ['trained', 'untrained', null],
    default: null,
  },
  certificates: [String], // URLs to certificates
  // NGO/Govt specific fields
  organizationName: String,
  verificationId: String, // DigiLocker ID or other govt ID
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error('Secret Hashing Failure: ' + error.message);
  }
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
