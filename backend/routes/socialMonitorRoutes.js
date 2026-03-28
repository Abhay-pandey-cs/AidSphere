const express = require('express');
const { getMonitoredFeed, triggerScrape, upvoteSignal, convertSignalToSOS, dismissSignal, purgeAllSignals } = require('../controllers/socialMonitorController');
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

router.get('/feed', protect, getMonitoredFeed);
router.post('/scrape', protect, triggerScrape);
router.post('/upvote/:id', protect, upvoteSignal);
router.post('/convert/:id', protect, admin, convertSignalToSOS);
router.delete('/purge-all', protect, admin, purgeAllSignals);
router.delete('/:id', protect, admin, dismissSignal);

module.exports = router;
