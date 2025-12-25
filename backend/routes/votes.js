const express = require('express');
const { body, validationResult } = require('express-validator');
const Vote = require('../models/Vote');
const ProblemReport = require('../models/ProblemReport');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Vote on a report
router.post('/', auth, [
  body('reportId').isMongoId().withMessage('Valid report ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reportId } = req.body;
    const userId = req.user._id;

    // Check if report exists
    const report = await ProblemReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if already voted
    const existingVote = await Vote.findOne({ report: reportId, user: userId });
    if (existingVote) {
      return res.status(400).json({ message: 'Already voted on this report' });
    }

    // Create vote
    const vote = new Vote({ report: reportId, user: userId });
    await vote.save();

    // Update report vote count
    report.votes += 1;
    report.voters.push(userId);
    await report.save();

    res.status(201).json({ message: 'Vote recorded', vote });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already voted on this report' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove vote
router.delete('/:reportId', auth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user._id;

    const vote = await Vote.findOneAndDelete({ report: reportId, user: userId });
    
    if (!vote) {
      return res.status(404).json({ message: 'Vote not found' });
    }

    // Update report vote count
    const report = await ProblemReport.findById(reportId);
    if (report) {
      report.votes = Math.max(0, report.votes - 1);
      report.voters = report.voters.filter(v => v.toString() !== userId.toString());
      await report.save();
    }

    res.json({ message: 'Vote removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user has voted
router.get('/check/:reportId', auth, async (req, res) => {
  try {
    const vote = await Vote.findOne({
      report: req.params.reportId,
      user: req.user._id
    });

    res.json({ hasVoted: !!vote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

