const express = require('express');
const { body, validationResult } = require('express-validator');
const ProjectTimeline = require('../models/ProjectTimeline');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const projects = await ProjectTimeline.find(filter)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    // Auto-update milestone statuses
    for (const project of projects) {
      let updated = false;
      for (const milestone of project.milestones) {
        if (!milestone.completedAt && milestone.status !== 'completed') {
          const now = new Date();
          if (now > milestone.deadline) {
            milestone.status = 'delayed';
            updated = true;
          } else if (milestone.status === 'delayed' && now <= milestone.deadline) {
            milestone.status = 'on-time';
            updated = true;
          }
        }
      }
      if (updated) {
        await project.save();
      }
    }

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await ProjectTimeline.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project (Admin only)
router.post('/', adminAuth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['road', 'water', 'electricity', 'sanitation', 'other']).withMessage('Invalid category'),
  body('milestones').isArray().withMessage('Milestones must be an array'),
  body('milestones.*.title').trim().isLength({ min: 3 }).withMessage('Milestone title required'),
  body('milestones.*.deadline').isISO8601().withMessage('Valid deadline required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = new ProjectTimeline({
      ...req.body,
      createdBy: req.user._id
    });

    await project.save();
    await project.populate('createdBy', 'username');

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project (Admin only)
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const project = await ProjectTimeline.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    Object.assign(project, req.body);
    project.updatedAt = new Date();
    await project.save();
    await project.populate('createdBy', 'username');

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add milestone to project (Admin only)
router.post('/:id/milestones', adminAuth, [
  body('title').trim().isLength({ min: 3 }).withMessage('Milestone title required'),
  body('deadline').isISO8601().withMessage('Valid deadline required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await ProjectTimeline.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.milestones.push(req.body);
    project.updatedAt = new Date();
    await project.save();
    await project.populate('createdBy', 'username');

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update milestone (Admin only)
router.patch('/:id/milestones/:milestoneId', adminAuth, async (req, res) => {
  try {
    const project = await ProjectTimeline.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    Object.assign(milestone, req.body);
    if (req.body.completedAt) {
      milestone.completedAt = new Date(req.body.completedAt);
      milestone.status = 'completed';
    }

    project.updatedAt = new Date();
    await project.save();
    await project.populate('createdBy', 'username');

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const project = await ProjectTimeline.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

