const express = require('express');
const {
  createSOS,
  getAllSOS,
  getSOSById,
  updateSOSStatus,
} = require('../controllers/sosController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createSOS);
router.get('/', getAllSOS);
router.get('/:id', protect, getSOSById);
router.put('/:id', protect, updateSOSStatus);

module.exports = router;
