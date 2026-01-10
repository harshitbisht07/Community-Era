const express = require('express');
const { body, validationResult, query } = require('express-validator');
const ProblemReport = require('../models/ProblemReport');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

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

    const matchStage = {};
    if (req.query.category) matchStage.category = req.query.category;
    if (req.query.status) matchStage.status = req.query.status;
    if (req.query.search) {
      matchStage.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    let sortStage = {};
    switch (req.query.sort) {
      case 'votes':
        sortStage = { votes: -1 };
        break;
      case 'date':
        sortStage = { createdAt: -1 };
        break;
      case 'severity':
        sortStage = { severityWeight: -1 };
        break;
      default:
        sortStage = { votes: -1, createdAt: -1 };
    }

    const pipeline = [
      { $match: matchStage },
      // Add weight for severity sorting
      {
        $addFields: {
          severityWeight: {
            $switch: {
              branches: [
                { case: { $eq: ["$severity", "critical"] }, then: 4 },
                { case: { $eq: ["$severity", "high"] }, then: 3 },
                { case: { $eq: ["$severity", "medium"] }, then: 2 },
                { case: { $eq: ["$severity", "low"] }, then: 1 }
              ],
              default: 0
            }
          }
        }
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit },
      // Populate reportedBy (manual lookup for aggregation)
      {
        $lookup: {
          from: 'users',
          localField: 'reportedBy',
          foreignField: '_id',
          pipeline: [{ $project: { username: 1 } }],
          as: 'reportedBy'
        }
      },
      { $unwind: { path: '$reportedBy', preserveNullAndEmptyArrays: true } },
      // Duplicate Detection: Count similar reports nearby (~100m)
      {
        $lookup: {
          from: 'problemreports',
          let: { 
            currentLat: "$location.coordinates.lat", 
            currentLng: "$location.coordinates.lng", 
            currentCat: "$category", 
            currentId: "$_id" 
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$currentCat"] },
                    { $ne: ["$_id", "$$currentId"] },
                    // Simple bounding box check (approx 100-111m)
                    { $lt: [{ $abs: { $subtract: ["$location.coordinates.lat", "$$currentLat"] } }, 0.001] },
                    { $lt: [{ $abs: { $subtract: ["$location.coordinates.lng", "$$currentLng"] } }, 0.001] }
                  ]
                }
              }
            },
            { $count: "count" }
          ],
          as: "similarReports"
        }
      },
      {
        $addFields: {
          similarReportCount: { 
            $ifNull: [{ $arrayElemAt: ["$similarReports.count", 0] }, 0] 
          }
        }
      }
    ];

    const reports = await ProblemReport.aggregate(pipeline);
    const total = await ProblemReport.countDocuments(matchStage);

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
router.post('/', auth, upload.single('image'), [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['road', 'water', 'electricity', 'sanitation', 'other']).withMessage('Invalid category'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('lat').isFloat().withMessage('Valid latitude required'),
  body('lng').isFloat().withMessage('Valid longitude required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reportData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        severity: req.body.severity,
        status: req.body.status || 'open',
        location: {
            coordinates: {
                lat: parseFloat(req.body.lat),
                lng: parseFloat(req.body.lng)
            },
            address: req.body.address
        },
        reportedBy: req.user._id,
        images: req.file ? [`/uploads/${req.file.filename}`] : []
    };

    const report = new ProblemReport(reportData);

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
