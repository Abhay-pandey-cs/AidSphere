const mongoose = require('mongoose');

const fundraisingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['disaster', 'medical', 'education', 'general'],
    required: true,
  },
  targetAmount: {
    type: Number,
    required: true,
  },
  raisedAmount: {
    type: Number,
    default: 0,
  },
  beneficiary: {
    type: String,
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  images: [String],
  donations: [{
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    message: String,
    date: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'halted'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Fundraising', fundraisingSchema);
