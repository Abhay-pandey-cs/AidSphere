const SOS = require('../models/SOS');
const analyzeDistress = require('../utils/distressDetector');
const { analyzeSignal } = require('../utils/geminiAnalyzer');

// @desc    Create new SOS request
// @route   POST /api/sos
// @access  Private
const createSOS = async (req, res) => {
  const { type, description, location, urgency, photo } = req.body;

  try {
    let finalUrgency = urgency;
    let finalDescription = description;

    if (photo) {
      // Deep Gemini Image+Text Analysis
      const aiEvaluation = await analyzeSignal(description, photo);
      
      if (!aiEvaluation.isDisaster) {
        return res.status(400).json({ 
          message: `SOS Request Blocked by Neural Protocol: ${aiEvaluation.aiReasoning}` 
        });
      }
      
      finalUrgency = aiEvaluation.urgency === 'critical' || aiEvaluation.urgency === 'high' ? aiEvaluation.urgency : finalUrgency;
      finalDescription = `${description}\n\n[NEURAL CAMERA VERIFIED: ${aiEvaluation.aiReasoning} // SENTIMENT: ${aiEvaluation.sentiment}]`;
    } else {
      // Legacy text-only heuristic fallback if no photo
      const analysis = analyzeDistress(description);
      finalUrgency = urgency || analysis.priority;
    }

    const sos = await SOS.create({
      user: req.user._id,
      type,
      description: finalDescription,
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

// @desc    Analyze live camera frames
// @route   POST /api/sos/analyze-frame
// @access  Private
const analyzeFrame = async (req, res) => {
  const { photo } = req.body;
  if (!photo) return res.status(400).json({ message: 'No frame provided' });

  try {
    const aiEvaluation = await analyzeSignal("Visual scene scan only. Describe the scene briefly. Is there an absolute, critical physical emergency requiring SOS responders? Be very strict. Focus on physical disaster, fire, accident, or flood.", photo);
    
    // Explicitly clamp distress score if it's perfectly safe
    let finalScore = aiEvaluation.confidenceScore || 0;
    if (!aiEvaluation.isDisaster) {
       finalScore = Math.min(finalScore, 40); // Cap safe scenes
       if (finalScore === 0) finalScore = Math.floor(Math.random() * 10) + 1; // 1-10 nominal
    }

    res.json({
      distressScore: finalScore,
      sentiment: aiEvaluation.sentiment || (aiEvaluation.isDisaster ? 'critical' : 'scene nominal (safe)'),
      isDisaster: aiEvaluation.isDisaster
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createSOS,
  getAllSOS,
  getSOSById,
  updateSOSStatus,
  analyzeFrame,
};
