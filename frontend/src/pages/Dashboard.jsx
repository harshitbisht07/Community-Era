import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers,
  FiTrendingUp,
  FiFileText,
  FiThumbsUp,
  FiSearch,
  FiInfo,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import SkeletonLoader from "../components/SkeletonLoader";

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
      const params = new URLSearchParams(filters);
      const res = await axios.get(`/api/participation?${params}`);
      setStats(res.data);
    } catch (error) {
      console.error(error);
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
      console.error(error);
    }
  };

  const getParticipationColor = (percentage) => {
    if (percentage >= 70)
      return "text-emerald-700 bg-emerald-50 ring-emerald-600/10";
    if (percentage >= 40) return "text-amber-700 bg-amber-50 ring-amber-600/10";
    return "text-red-700 bg-red-50 ring-red-600/10";
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">
          Participation Insights
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-6">
          {["city", "area"].map((field) => (
            <div key={field} className="relative flex-1">
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                {field}
              </label>
              <div className="relative group">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={filters[field]}
                  onChange={(e) =>
                    setFilters({ ...filters, [field]: e.target.value })
                  }
                  placeholder={`Filter by ${field}...`}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Users",
              value: stats?.totalUsers,
              icon: FiUsers,
              color: "blue",
            },
            {
              label: "Reports Filed",
              value: stats?.totalReports,
              icon: FiTrendingUp,
              color: "emerald",
            },
            {
              label: "Total Votes",
              value: stats?.totalVotes,
              icon: FiThumbsUp,
              color: "amber",
            },
            {
              label: "Recent Activity",
              value: stats?.recentActivity?.total,
              icon: FiFileText,
              color: "purple",
              sub: "Last 30 days",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              {loading ? (
                <>
                  <SkeletonLoader
                    width={48}
                    height={48}
                    className="rounded-xl"
                  />
                  <div className="space-y-2">
                    <SkeletonLoader width={80} height={16} />
                    <SkeletonLoader width={40} height={24} />
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`p-3 rounded-xl bg-${item.color}-50 text-${item.color}-600`}
                  >
                    <item.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {item.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {item.value || 0}
                    </p>
                    {item.sub && (
                      <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">
                        {item.sub}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Reports Trend</h3>
              <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">
                Last 7 Days
              </span>
            </div>
            <div className="h-72">
              {loading ? (
                <SkeletonLoader
                  width="100%"
                  height="100%"
                  className="rounded-xl"
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.charts?.daily || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      tickFormatter={(v) => new Date(v).getDate()}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Distribution
            </h3>
            <div className="h-72">
              {loading ? (
                <SkeletonLoader
                  width="100%"
                  height="100%"
                  className="rounded-xl"
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.charts?.categories || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(stats?.charts?.categories || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      iconType="circle"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Engagement Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          {loading ? (
            <div className="space-y-4">
              <SkeletonLoader width={200} height={24} />
              <SkeletonLoader
                width="100%"
                height={12}
                className="rounded-full"
              />
            </div>
          ) : (
            stats && (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Engagement Goal
                </h2>
                <div className="mb-4">
                  <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                    <div className="flex items-center gap-1 group relative cursor-help">
                      Participation Rate <FiInfo />
                      <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-xs p-2 rounded w-48 hidden group-hover:block">
                        Ratio of active users to total registered users.
                      </div>
                    </div>
                    <span className="text-gray-900">
                      {Math.min(stats.participationPercentage || 0, 100)}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        (stats.participationPercentage || 0) >= 70
                          ? "bg-emerald-500"
                          : (stats.participationPercentage || 0) >= 40
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          stats.participationPercentage || 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  <strong className="text-gray-900">
                    {stats.participatingUsers || 0}
                  </strong>{" "}
                  active residents out of{" "}
                  <strong className="text-gray-900">
                    {stats.totalUsers || 0}
                  </strong>{" "}
                  registered.
                </p>
              </>
            )
          )}
        </div>

        {/* Area Table */}
        {areaStats.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Geographic Breakdown
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Area</th>
                    <th className="px-6 py-3">Registered</th>
                    <th className="px-6 py-3">Active</th>
                    <th className="px-6 py-3">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {areaStats.map((area, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {area.area || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {area.totalUsers}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {area.participatingUsers}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getParticipationColor(
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
    </div>
  );
};

export default Dashboard;
