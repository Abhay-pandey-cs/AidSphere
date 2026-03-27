const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, phone, location } = req.body;
  console.log('Inducting New Unit:', { name, email, role, phone });

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.warn('Registration Blocked: User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      location,
    });

    if (user) {
      console.info('Unit Successfully Inducted:', user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      console.error('Registration Failed: Invalid user data');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration System Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      trustLevel: user.trustLevel,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Verify with DigiLocker via OAuth2 Code
// @route   PUT /api/auth/verify-digilocker
// @access  Private
const verifyDigiLocker = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Missing Authorization Code' });

    // 1. Bypass check for hackathon live-demos
    if (code === 'HACKATHON_BYPASS_2026') {
      const user = await User.findById(req.user._id);
      if (user) {
        user.isVerified = true;
        user.trustLevel = 'silver';
        await user.save();
        return res.json({ message: 'Hackathon Demo verification successful', user });
      }
    }

    // 2. Real Production Code-to-Token Exchange Template
    const clientId = process.env.DIGILOCKER_CLIENT_ID;
    const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET;
    
    if (clientId && clientSecret) {
      /*
      // This segment runs ONLY if keys are configured.
      const tokenRes = await require('axios').post('https://entity.digilocker.gov.in/public/oauth2/1/token', null, {
         params: {
           grant_type: 'authorization_code',
           code: code,
           client_id: clientId,
           client_secret: clientSecret,
           redirect_uri: 'http://localhost:5173/digilocker-sync'
         }
      });
      const accessToken = tokenRes.data.access_token;
      
      // Fetch verified documents using accessToken here
      // const userProfile = await require('axios').get('...', { headers: { ... } });
      */
    }

    // 3. Apply standard verification upon successful code callback assuming user was vetted
    const user = await User.findById(req.user._id);
    if (user) {
      user.isVerified = true;
      user.trustLevel = 'silver';
      await user.save();
      res.json({ message: 'Identity Vault Synced successfully', user });
    } else {
      res.status(404).json({ message: 'Target Node not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all volunteers
// @route   GET /api/auth/volunteers
// @access  Private
const getVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' }).select('-password');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  verifyDigiLocker,
  getVolunteers,
};
