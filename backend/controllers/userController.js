const User = require('../models/User');

// @desc    Get all volunteers for Admin Force Management
// @route   GET /api/users/volunteers
// @access  Private/Admin
const getVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).select('-password');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update volunteer verification, skills, and trust level
// @route   PUT /api/users/volunteers/:id/verify
// @access  Private/Admin
const updateVolunteerStatus = async (req, res) => {
  const { isVerified, trustLevel, volunteerType, skills } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isVerified = isVerified !== undefined ? isVerified : user.isVerified;
      user.trustLevel = trustLevel || user.trustLevel;
      user.volunteerType = volunteerType || user.volunteerType;
      
      if (skills) {
        user.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        trustLevel: updatedUser.trustLevel,
        volunteerType: updatedUser.volunteerType,
        skills: updatedUser.skills
      });
    } else {
      res.status(404).json({ message: 'Volunteer User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVolunteers,
  updateVolunteerStatus,
};
