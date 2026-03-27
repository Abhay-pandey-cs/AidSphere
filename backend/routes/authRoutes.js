const express = require('express');
const {
  registerUser,
  authUser,
  getUserProfile,
  verifyDigiLocker,
  getVolunteers,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/digilocker-sync', async (req, res) => {
  try {
    const { code } = req.body;
    // Real Implementation: Hit https://api.digitallocker.gov.in/public/oauth2/1/token
    // Then hit https://api.digitallocker.gov.in/public/oauth2/1/user
    
    // For Demonstration/Safety: Mock the successful retrieval
    console.log('Syncing Identity via DigiLocker Code:', code);
    
    // Mocked User Data from DigiLocker
    res.json({
      uuid: 'DL' + Math.random().toString(36).substr(2, 9),
      name: 'DigiLocker Verified User',
      email: null,
      phone: null
    });
  } catch (err) {
    res.status(500).json({ message: 'DigiLocker Sync Blocked' });
  }
});
router.get('/digilocker-redirect', (req, res) => {
  const clientId = process.env.DIGILOCKER_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.DIGILOCKER_REDIRECT_URI);
  const state = 'aidsphere_auth';
  const url = `https://api.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
  res.json({ url });
});
router.get('/digilocker-callback', async (req, res) => {
  const { code, state } = req.query;
  // Implementation will exchange code for token and then call Get User Details
  // For now, redirect to a success/failure page with the code
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/digilocker-sync?code=${code}`);
});
router.get('/profile', protect, getUserProfile);
router.put('/verify-digilocker', protect, verifyDigiLocker);
router.get('/volunteers', protect, getVolunteers);

module.exports = router;
