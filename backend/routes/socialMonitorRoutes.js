const express = require('express');
const { getMonitoredFeed, triggerScrape, upvoteSignal } = require('../controllers/socialMonitorController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/feed', protect, getMonitoredFeed);
router.post('/scrape', protect, triggerScrape);
router.post('/upvote/:id', protect, upvoteSignal);

module.exports = router;
