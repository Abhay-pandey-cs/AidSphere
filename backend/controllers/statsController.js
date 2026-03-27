const User = require('../models/User');
const SOS = require('../models/SOS');

// @desc    Get Global System Stats
// @route   GET /api/stats
// @access  Public
const getGlobalStats = async (req, res) => {
  try {
    const activeMissions = await SOS.countDocuments({ status: { $ne: 'resolved' } });
    const verifiedResponders = await User.countDocuments({ role: 'volunteer', isVerified: true });
    const totalRequests = await SOS.countDocuments();
    const volunteerCount = await User.countDocuments({ role: 'volunteer' });

    res.json({
      activeMissions,
      verifiedResponders,
      totalRequests,
      volunteerCount,
      neuralSignals: Math.floor(totalRequests * 1.5) // Derived from signals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGlobalStats };
