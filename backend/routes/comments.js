const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Comment = require('../models/Comment');
const User = require('../models/User'); // Ensure User model is loaded

// GET /api/comments/:reportId
// Get all comments for a report
router.get('/:reportId', async (req, res) => {
  try {
    const comments = await Comment.find({ report: req.params.reportId })
      .populate('user', 'username role')
      .sort({ createdAt: -1 }); // Newest first
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/comments/:reportId
// Add a new comment
router.post('/:reportId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
        return res.status(400).json({ message: 'Comment text is required' });
    }

    const comment = new Comment({
      report: req.params.reportId,
      user: req.user._id,
      text: text.trim()
    });

    await comment.save();

    // Populate user details for immediate display
    await comment.populate('user', 'username role');

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
