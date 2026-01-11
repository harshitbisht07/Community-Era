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
      { $match: { ...matchStage, parentReport: null } }, // Only fetch parents
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
      // Lookup Children
      {
        $lookup: {
          from: 'problemreports',
          localField: '_id',
          foreignField: 'parentReport',
          as: 'childReports'
        }
      },
      // Aggregate Children Data
      {
        $addFields: {
          clusterCount: { $add: [{ $size: "$childReports" }, 1] }, // self + children
          totalVotes: { 
            $add: [
              "$votes", 
              { $ifNull: [{ $sum: "$childReports.votes" }, 0] }
            ] 
          },
          // Merge images: Parent images + Flattened Child images
          allImages: {
             $concatArrays: [ "$images", { $reduce: {
                input: "$childReports.images",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] }
             }}]
          }
        }
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit },
      // Populate reportedBy
      {
        $lookup: {
          from: 'users',
          localField: 'reportedBy',
          foreignField: '_id',
          pipeline: [{ $project: { username: 1 } }],
          as: 'reportedBy'
        }
      },
      { $unwind: { path: '$reportedBy', preserveNullAndEmptyArrays: true } }
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

    const { category, lat, lng, city, area } = req.body;
    const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };

    // Check for clustering (duplicate within 100m)
    const existingParent = await ProblemReport.findOne({
      category: category,
      status: { $in: ['open', 'in-progress'] },
      parentReport: null,
      $expr: {
        $and: [
          { $lt: [{ $abs: { $subtract: ["$location.coordinates.lat", coordinates.lat] } }, 0.001] },
          { $lt: [{ $abs: { $subtract: ["$location.coordinates.lng", coordinates.lng] } }, 0.001] }
        ]
      }
    });

    const reportData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        severity: req.body.severity,
        status: req.body.status || 'open',
        location: {
            coordinates: coordinates,
            address: req.body.address,
            city: req.body.city || '',
            area: req.body.area || ''
        },
        reportedBy: req.user._id,
        images: req.file 
          ? [`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`] 
          : [],
        parentReport: existingParent ? existingParent._id : null
    };

    const report = new ProblemReport(reportData);

    await report.save();
    
    // If clustered, assume the user also "votes" for the parent implicitly? 
    // The requirement says "summation". We will handle summation in GET.
    // Ideally, we could also add the user to parent's voters, but let's keep it clean via aggregation.

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

// Maintenance: Retroactively cluster existing reports
router.get('/maintenance/cluster', async (req, res) => {
  try {
    const reports = await ProblemReport.find({
      status: { $in: ['open', 'in-progress'] },
      parentReport: null
    });

    let clusteredCount = 0;

    for (const parent of reports) {
      if (!parent.location || !parent.location.coordinates) continue;

      const children = await ProblemReport.find({
        _id: { $ne: parent._id },
        category: parent.category,
        status: { $in: ['open', 'in-progress'] },
        parentReport: null,
        $expr: {
          $and: [
            { $lt: [{ $abs: { $subtract: ["$location.coordinates.lat", parent.location.coordinates.lat] } }, 0.002] }, // Increased to ~200m for easier grouping
            { $lt: [{ $abs: { $subtract: ["$location.coordinates.lng", parent.location.coordinates.lng] } }, 0.002] }
          ]
        }
      });

      if (children.length > 0) {
        for (const child of children) {
          child.parentReport = parent._id;
          await child.save();
          clusteredCount++;
        }
      }
    }

    res.json({ message: `Clustering complete. Grouped ${clusteredCount} reports.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
