const express = require('express');
const { getVolunteers, updateVolunteerStatus } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware inside the route to ensure admin only
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

router.get('/volunteers', protect, admin, getVolunteers);
router.put('/volunteers/:id/verify', protect, admin, updateVolunteerStatus);

module.exports = router;
