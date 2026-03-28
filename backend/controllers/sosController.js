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
      // Deep Gemini Image+Text Analysis - only block if clearly NOT an emergency
      try {
        const aiEvaluation = await analyzeSignal(description, photo);
        
        // Only hard-block if Gemini is very confident (score < 15) it's NOT a disaster
        if (!aiEvaluation.isDisaster && aiEvaluation.confidenceScore < 15) {
          return res.status(400).json({ 
            message: `SOS Blocked: ${aiEvaluation.aiReasoning}` 
          });
        }
        
        // Enrich urgency and description with AI findings
        if (aiEvaluation.urgency === 'critical' || aiEvaluation.urgency === 'high') {
          finalUrgency = aiEvaluation.urgency;
        }
        finalDescription = `${description}\n\n[NEURAL CAMERA VERIFIED: ${aiEvaluation.aiReasoning} // SENTIMENT: ${aiEvaluation.sentiment}]`;
      } catch (aiErr) {
        // AI failed — don't block the SOS, just log and continue
        console.warn('[SOS] Gemini photo analysis failed, proceeding without AI tag:', aiErr.message);
        finalDescription = `${description}\n\n[AI_ANALYSIS_UNAVAILABLE]`;
      }
    } else {
      // Text-only analysis: AI enriches but NEVER blocks
      try {
        const aiEvaluation = await analyzeSignal(description);
        if (aiEvaluation.isDisaster) {
          if (aiEvaluation.urgency === 'critical' || aiEvaluation.urgency === 'high') {
            finalUrgency = aiEvaluation.urgency;
          }
          finalDescription = `${description}\n\n[TEXT AI VERIFIED: ${aiEvaluation.aiReasoning} // SENTIMENT: ${aiEvaluation.sentiment}]`;
        }
        // If AI says not a disaster for text-only, we still let it through — user knows best
      } catch (aiErr) {
        console.warn('[SOS] Gemini text analysis failed, proceeding without AI tag:', aiErr.message);
      }
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
    console.error('[SOS] Create error:', error.message);
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
  const { photo, category } = req.body;
  if (!photo) return res.status(400).json({ message: 'No frame provided' });

  try {
    const categoryContext = category ? `[PRIORITY SENSOR]: The user has tagged this as a "${category}" mission. Calibrate visual sensors to aggressively identify elements of ${category} (e.g., fire, medical trauma, flood lines).` : '[PRIORITY SENSOR]: General threat scan.';
    const prompt = `Perform a highly strict, deterministic visual forensic analysis of this image. Do NOT hallucinate danger.
${categoryContext}

Scoring Rubric (Strictly adhere to this exact band):
0-20: Completely safe, nominal, everyday scene. No danger. (e.g. a normal room, people smiling, everyday objects, selfies).
21-40: Minor anomaly or mess, but absolutely no immediate physical threat.
41-60: Moderate hazard or potential for injury (e.g. broken glass, minor flooding, localized hazard).
61-80: Severe emergency requiring immediate response (e.g. visible fire, trapped individuals, serious medical crisis).
81-100: Catastrophic, life-threatening disaster (e.g. massive structural collapse, raging inferno, severe casualties).

Rule 1: Start evaluating at 0. Only traverse upwards if you have UNDENIABLE visual evidence of distress.
Rule 2: Do NOT assume danger based on blurry, slightly dark, or ambiguous images. If ambiguous, the score MUST remain below 40.
Rule 3: Translate your finding into the exact 'confidenceScore' (integer only) and output the 'sentiment'.`;
    
    const aiEvaluation = await analyzeSignal(prompt, photo);
    
    // Simula-Aware Score Weighting
    let finalScore = typeof aiEvaluation.confidenceScore === 'number' ? aiEvaluation.confidenceScore : 0;
    const sentiment = aiEvaluation.sentiment ? aiEvaluation.sentiment.toUpperCase() : '';

    // Disaster Forensic Weighting (Simula logic)
    if (sentiment === 'HORROR' || sentiment === 'FEAR') {
       finalScore = Math.max(finalScore, 85); // Critical/Life-Threatening
    } else if (sentiment === 'ANXIETY' || sentiment === 'ANGER') {
       finalScore = Math.max(finalScore, 60); // Moderate to High Distress
    } else if (sentiment === 'RELIEF' || sentiment === 'JOY') {
       finalScore = Math.min(finalScore, 40); // Recovery phase, lower immediate urgency
    }

    if (!aiEvaluation.isDisaster) {
       finalScore = Math.min(finalScore, 20); // Cap safe scenes
       if (finalScore <= 5) finalScore = Math.floor(Math.random() * 8) + 1; // 1-8 nominal baseline
    }

    res.json({
      distressScore: finalScore,
      sentiment: aiEvaluation.sentiment || (aiEvaluation.isDisaster ? 'GENERIC_DISTRESS' : 'SCENE_NOMINAL'),
      isDisaster: aiEvaluation.isDisaster,
      aiReasoning: aiEvaluation.aiReasoning
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
