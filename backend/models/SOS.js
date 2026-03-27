const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['disaster', 'community'],
    default: 'disaster',
  },
  type: {
    type: String,
    enum: [
      'medical', 'rescue', 'shelter', 'fire_safety', 'structural', 'hazard', // Major
      'food', 'water', 'clothing', 'blood', 'elderly_care', 'mental_health', // Minor
      'utility', 'education', 'logistics', 'sanitation', 'pet_rescue', 'child_care', 'other'
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'assigned', 'responding', 'resolved', 'cancelled'],
    default: 'pending',
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  images: [String], // URLs to uploaded images
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // NGO or Volunteer
  },
  logs: [{
    status: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  donations: [{
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resource: String,
    quantity: String,
    status: { type: String, default: 'pledged' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('SOS', sosSchema);
