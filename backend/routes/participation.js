const express = require('express');
const User = require('../models/User');
const ProblemReport = require('../models/ProblemReport');
const Vote = require('../models/Vote');

const router = express.Router();

// Get participation statistics
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

    // Get report IDs for the location to filter votes
    const locationReports = await ProblemReport.find(locationFilter).select('_id');
    const locationReportIds = locationReports.map(r => r._id);

    // Get users who have participated (reported or voted)
    const usersWithReports = await ProblemReport.distinct('reportedBy', locationFilter);
    // FIX: Only count voters who voted on reports IN THIS LOCATION
    const usersWithVotes = await Vote.distinct('user', { report: { $in: locationReportIds } });
    
    // Combine unique users
    const allParticipatingUserIds = [...new Set([...usersWithReports.map(id => id.toString()), ...usersWithVotes.map(id => id.toString())])];

    // Filter participating users by location (Must live in the area AND have participated)
    let participatingUsers = 0;
    if (totalUsers > 0 && allParticipatingUserIds.length > 0) {
       // Only count if they are residents of the filtered area
       const residentParticipants = await User.countDocuments({
         _id: { $in: allParticipatingUserIds },
         ...locationFilter
       });
       participatingUsers = residentParticipants;
    } else if (!city && !area) {
        // If no location filter, only count participating users who VALIDLY EXIST in the database
        // This prevents "Ghost" participation (deleted users) from causing >100% stats
        participatingUsers = await User.countDocuments({
            _id: { $in: allParticipatingUserIds }
        });
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
      report: { $in: locationReportIds }, // Fix: use 'report' field not 'reportId' if schema is 'report'
      createdAt: { $gte: last30Days }
    });
    
    // Get total reports count matching the filter
    const totalReports = await ProblemReport.countDocuments(locationFilter);
    
    // Get resolved reports count
    const resolvedReports = await ProblemReport.countDocuments({
      ...locationFilter,
      status: 'resolved'
    });

    // Calculate Resolution Rate
    const resolutionRate = totalReports > 0 
      ? ((resolvedReports / totalReports) * 100).toFixed(0) 
      : 0;

    // --- Charts Data ---

    // 1. Category Distribution
    const categoryStats = await ProblemReport.aggregate([
      { $match: locationFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // 2. Reports Over Time (Last 7 Days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const dailyStats = await ProblemReport.aggregate([
      {
        $match: {
          ...locationFilter,
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get Active Cities (distinct cities in reports)
    const distinctCities = await ProblemReport.distinct('location.city');
    const activeCities = distinctCities.filter(c => c).length; // Filter out nulls

    // Get total votes matching the filter (votes on reports in this location)
    const totalVotes = await Vote.countDocuments({
      report: { $in: locationReportIds }
    });

    res.json({
      totalUsers,
      participatingUsers,
      totalReports,
      resolvedReports,
      resolutionRate,
      activeCities,
      totalVotes,
      participationPercentage: parseFloat(participationPercentage),
      recentActivity: {
        total: recentReports + recentVotes,
        reports: recentReports,
        votes: recentVotes,
        period: '30 days'
      },
      charts: {
        categories: categoryStats.map(c => ({ name: c._id, value: c.count })),
        daily: dailyStats.map(d => ({ date: d._id, count: d.count }))
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

    // 1. Total Users per Area
    const participationByArea = await User.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$location.area',
          totalUsers: { $sum: 1 }
        }
      }
    ]);

    // 2. Unique Reporters per Area
    const reportsByArea = await ProblemReport.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$location.area',
          uniqueReporters: { $addToSet: '$reportedBy' }
        }
      }
    ]);

    // 3. Unique Voters per Area (Complex: Vote -> Report -> Area)
    const votesByArea = await Vote.aggregate([
        {
            $lookup: {
                from: 'problemreports',
                localField: 'report',
                foreignField: '_id',
                as: 'reportParams'
            }
        },
        { $unwind: '$reportParams' },
        { 
            $match: { 
                ...(city ? { 'reportParams.location.city': city } : {}) 
            } 
        },
        {
            $group: {
                _id: '$reportParams.location.area',
                uniqueVoters: { $addToSet: '$user' }
            }
        }
    ]);

    // Merge Results
    const result = participationByArea.map(area => {
      const reportData = reportsByArea.find(r => r._id === area._id);
      const voteData = votesByArea.find(v => v._id === area._id);

      const reporters = reportData ? reportData.uniqueReporters.map(id => id.toString()) : [];
      const voters = voteData ? voteData.uniqueVoters.map(id => id.toString()) : [];
      
      const uniqueParticipants = new Set([...reporters, ...voters]);
      const participatingUsers = uniqueParticipants.size; // Note: This includes non-residents if they participated in this area. 
      // To be strictly consistent with main stats, we might want to filter by residency, but for "Area Breakdown" it's often better to show WHO is active in that area regardless of where they live. 
      // AND `participationByArea` (users) groups by RESIDENCE.
      // So `participatingUsers / totalUsers` implies RESIDENT PARTICIPATION.
      // Let's assume we want Resident Participation for consistency.
      // However, calculating Resident Participation per area from aggregates is hard without a massive lookup.
      // For now, let's keep it as "Active Users in Area" vs "Residents in Area".

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

