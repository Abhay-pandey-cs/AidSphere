const mongoose = require('mongoose');

const scrapedSignalSchema = new mongoose.Schema({
  originalId: { type: String, required: true, unique: true },
  platform: { type: String, required: true },
  author: { type: String, default: 'ANONYMOUS' },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    region: { type: String, default: 'UNKNOWN' }
  },
  link: { type: String },
  neuralScore: { type: Number, default: 50 },
  confidence: { type: Number, default: 90 },
  impactRadius: { type: String, default: '5km' },
  analysis: { type: String, default: 'Pending L1 Scan' },
  rawCategory: { type: String, default: 'General Emergency' },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('ScrapedSignal', scrapedSignalSchema);
