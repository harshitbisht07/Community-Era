const express = require('express');
const User = require('../models/User');
const ProblemReport = require('../models/ProblemReport');
const Vote = require('../models/Vote');

const router = express.Router();

// Get participation statistics
router.get('/', async (req, res) => {
  try {
    const { city, area } = req.query;

    // Build location filter
    const locationFilter = {};
    if (city) locationFilter['location.city'] = city;
    if (area) locationFilter['location.area'] = area;

    // Get total registered users in area
    const totalUsers = await User.countDocuments(locationFilter);

    // Get users who have participated (reported or voted)
    const usersWithReports = await ProblemReport.distinct('reportedBy', locationFilter);
    const usersWithVotes = await Vote.distinct('user');
    const allParticipatingUserIds = [...new Set([...usersWithReports.map(id => id.toString()), ...usersWithVotes.map(id => id.toString())])];

    // Filter participating users by location if specified
    let participatingUsers = allParticipatingUserIds.length;
    if (city || area) {
      const participatingUsersList = await User.find({
        _id: { $in: allParticipatingUserIds },
        ...locationFilter
      });
      participatingUsers = participatingUsersList.length;
    }

    // Calculate participation percentage
    const participationPercentage = totalUsers > 0 
      ? ((participatingUsers / totalUsers) * 100).toFixed(2)
      : 0;

    // Get recent activity stats
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentReports = await ProblemReport.countDocuments({
      ...locationFilter,
      createdAt: { $gte: last30Days }
    });

    const recentVotes = await Vote.countDocuments({
      createdAt: { $gte: last30Days }
    });

    res.json({
      totalUsers,
      participatingUsers,
      participationPercentage: parseFloat(participationPercentage),
      recentActivity: {
        reports: recentReports,
        votes: recentVotes,
        period: '30 days'
      },
      location: { city, area }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get participation by area (for map visualization)
router.get('/by-area', async (req, res) => {
  try {
    const { city } = req.query;

    const matchFilter = {};
    if (city) matchFilter['location.city'] = city;

    // Aggregate participation by area
    const participationByArea = await User.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$location.area',
          totalUsers: { $sum: 1 }
        }
      }
    ]);

    // Get participating users by area
    const reportsByArea = await ProblemReport.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$location.area',
          uniqueReporters: { $addToSet: '$reportedBy' }
        }
      }
    ]);

    const result = participationByArea.map(area => {
      const reportData = reportsByArea.find(r => r._id === area._id);
      const participatingUsers = reportData ? reportData.uniqueReporters.length : 0;
      const participationPercentage = area.totalUsers > 0
        ? ((participatingUsers / area.totalUsers) * 100).toFixed(2)
        : 0;

      return {
        area: area._id,
        totalUsers: area.totalUsers,
        participatingUsers,
        participationPercentage: parseFloat(participationPercentage)
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

