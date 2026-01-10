import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers,
  FiTrendingUp,
  FiFileText,
  FiThumbsUp,
  FiAlertCircle,
} from "react-icons/fi";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [areaStats, setAreaStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: "", area: "" });

  useEffect(() => {
    fetchStats();
    fetchAreaStats();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append("city", filters.city);
      if (filters.area) params.append("area", filters.area);

      const res = await axios.get(`/api/participation?${params}`);
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append("city", filters.city);

      const res = await axios.get(`/api/participation/by-area?${params}`);
      setAreaStats(res.data);
    } catch (error) {
      console.error("Error fetching area stats:", error);
    }
  };

  const getParticipationColor = (percentage) => {
    if (percentage >= 70) return "text-green-600 bg-green-100";
    if (percentage >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Participation Awareness Dashboard
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City (Optional)
            </label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="Filter by city"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area (Optional)
            </label>
            <input
              type="text"
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
              placeholder="Filter by area"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Main Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="text-blue-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiTrendingUp className="text-green-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Reports
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.participatingUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div
                className={`p-3 rounded-lg ${getParticipationColor(
                  stats.participationPercentage
                )}`}
              >
                <FiAlertCircle className="text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Participation Rate
                </p>
                <p className="text-2xl font-bold">
                  {stats.participationPercentage}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiFileText className="text-purple-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Recent Reports
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.recentActivity.reports}
                </p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participation Progress Bar */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Community Participation
          </h2>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Participation Progress</span>
              <span>{stats.participationPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  stats.participationPercentage >= 70
                    ? "bg-green-500"
                    : stats.participationPercentage >= 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(stats.participationPercentage, 100)}%`,
                }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            {stats.participatingUsers} requests received from {stats.totalUsers}{" "}
            registered users
            {stats.location.city && ` in ${stats.location.city}`}
            {stats.location.area && `, ${stats.location.area}`}
          </p>
        </div>
      )}

      {/* Area-wise Breakdown */}
      {areaStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Participation by Area
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participation Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {areaStats.map((area, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {area.area || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {area.totalUsers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {area.participatingUsers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getParticipationColor(
                          area.participationPercentage
                        )}`}
                      >
                        {area.participationPercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
