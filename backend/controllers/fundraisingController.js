const Fundraising = require('../models/Fundraising');

// @desc    Create new fundraising campaign
// @route   POST /api/fundraising
// @access  Private
const createFundraising = async (req, res) => {
  const { title, description, category, targetAmount, beneficiary } = req.body;

  try {
    const campaign = await Fundraising.create({
      title,
      description,
      category,
      targetAmount,
      beneficiary,
      organizer: req.user._id,
    });
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active campaigns
// @route   GET /api/fundraising
// @access  Public
const getFundraising = async (req, res) => {
  try {
    const campaigns = await Fundraising.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Donate to a campaign
// @route   POST /api/fundraising/:id/donate
// @access  Private
const donateToCampaign = async (req, res) => {
  const { amount, message } = req.body;

  try {
    const campaign = await Fundraising.findById(req.params.id);

    if (campaign) {
      campaign.donations.push({
        donor: req.user._id,
        amount,
        message,
      });
      campaign.raisedAmount += Number(amount);
      
      if (campaign.raisedAmount >= campaign.targetAmount) {
        campaign.status = 'completed';
      }
      
      const updatedCampaign = await campaign.save();
      res.json(updatedCampaign);
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFundraising,
  getFundraising,
  donateToCampaign,
};
