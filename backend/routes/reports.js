const express = require('express');
const { body, validationResult, query } = require('express-validator');
const ProblemReport = require('../models/ProblemReport');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all reports with pagination and filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['road', 'water', 'electricity', 'sanitation', 'other']),
  query('sort').optional().isIn(['votes', 'date', 'severity'])
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;

    let sort = {};
    switch (req.query.sort) {
      case 'votes':
        sort = { votes: -1 };
        break;
      case 'date':
        sort = { createdAt: -1 };
        break;
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        sort = { severity: -1 };
        break;
      default:
        sort = { votes: -1, createdAt: -1 };
    }

    const reports = await ProblemReport.find(filter)
      .populate('reportedBy', 'username')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await ProblemReport.countDocuments(filter);

    res.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const report = await ProblemReport.findById(req.params.id)
      .populate('reportedBy', 'username')
      .populate('voters', 'username');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new report
router.post('/', auth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['road', 'water', 'electricity', 'sanitation', 'other']).withMessage('Invalid category'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('location.coordinates.lat').isFloat().withMessage('Valid latitude required'),
  body('location.coordinates.lng').isFloat().withMessage('Valid longitude required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const report = new ProblemReport({
      ...req.body,
      reportedBy: req.user._id
    });

    await report.save();
    await report.populate('reportedBy', 'username');

    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report status (admin or owner)
router.patch('/:id', auth, async (req, res) => {
  try {
    const report = await ProblemReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Only admin or report owner can update
    if (req.user.role !== 'admin' && report.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(report, req.body);
    report.updatedAt = new Date();
    await report.save();

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete report (admin or owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await ProblemReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.user.role !== 'admin' && report.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await report.deleteOne();
    res.json({ message: 'Report deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

