const SOS = require('../models/SOS');
const analyzeDistress = require('../utils/distressDetector');

// @desc    Create new SOS request
// @route   POST /api/sos
// @access  Private
const createSOS = async (req, res) => {
  const { type, description, location, urgency } = req.body;

  try {
    // Intelligent distress detection
    const analysis = analyzeDistress(description);
    
    // Higher of user-provided urgency and detected urgency
    const finalUrgency = urgency || analysis.priority;

    const sos = await SOS.create({
      user: req.user._id,
      type,
      description,
      location,
      urgency: finalUrgency,
      logs: [{
        status: 'pending',
        message: 'SOS Signal Broadcasted',
        actor: req.user._id
      }]
    });

    // Populate user info for socket broadcast
    const populatedSOS = await SOS.findById(sos._id).populate('user', 'name phone role');

    // Emit socket event (to be handled in server.js)
    if (req.io) {
      req.io.emit('newSOS', populatedSOS);
    }

    res.status(201).json(populatedSOS);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all SOS requests (for map)
// @route   GET /api/sos
// @access  Public
const getAllSOS = async (req, res) => {
  try {
    const sosList = await SOS.find({})
      .populate('user', 'name role')
      .sort({ createdAt: -1 });
    res.json(sosList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single SOS request
// @route   GET /api/sos/:id
// @access  Private
const getSOSById = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id)
      .populate('user', 'name phone role')
      .populate('assignedTo', 'name phone organizationName')
      .populate('donations.donor', 'name phone')
      .populate('logs.actor', 'name role');

    if (sos) {
      res.json(sos);
    } else {
      res.status(404).json({ message: 'SOS request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update SOS status
// @route   PUT /api/sos/:id
// @access  Private
const updateSOSStatus = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);

    if (sos) {
      const oldStatus = sos.status;
      const { status, assignedTo, logMessage } = req.body;

      // Trust Level & Role Logic
      if (status === 'assigned' && req.user.role === 'volunteer') {
        if (sos.urgency === 'critical' && !req.user.isVerified) {
          return res.status(403).json({ 
            message: 'You must be DigiLocker verified to handle critical emergencies.' 
          });
        }
        sos.assignedTo = req.user._id;
      }

      if (assignedTo && req.user.role === 'admin') {
        sos.assignedTo = assignedTo;
        if (status !== 'assigned') sos.status = 'assigned';
      }

      if (status && status !== oldStatus) {
        sos.status = status;
      }

      // Add Log Entry
      sos.logs.push({
        status: sos.status,
        message: logMessage || `Mission updated to ${sos.status}`,
        actor: req.user._id
      });
      
      const updatedSOS = await (await sos.save()).populate([
        { path: 'user', select: 'name phone role' },
        { path: 'assignedTo', select: 'name phone' },
        { path: 'logs.actor', select: 'name role' }
      ]);
      
      if (req.io) {
        req.io.emit('updateSOS', updatedSOS);
      }
      
      res.json(updatedSOS);
    } else {
      res.status(404).json({ message: 'SOS request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSOS,
  getAllSOS,
  getSOSById,
  updateSOSStatus,
};
