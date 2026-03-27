const express = require('express');
const {
  createFundraising,
  getFundraising,
  donateToCampaign,
} = require('../controllers/fundraisingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createFundraising);
router.get('/', getFundraising);
router.post('/:id/donate', protect, donateToCampaign);

module.exports = router;
