import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "../context/useAuthContext";
import { FiThumbsUp, FiMapPin, FiAlertCircle, FiClock } from "react-icons/fi";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: "", sort: "votes" });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuthContext();

  // Resolve image URL so it loads reliably in dev (proxy) and show a fallback if missing
  const resolveImage = (url) => {
    if (!url) return "";
    // If the backend stored a relative path like "/uploads/...", fetch directly from backend in dev
    if (url.startsWith("/uploads")) {
      const backendBase = `${window.location.protocol}//${window.location.hostname}:5001`;
      return `${backendBase}${url}`;
    }
    return url;
  };

  useEffect(() => {
    fetchReports();
  }, [filter, page]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sort: filter.sort,
      });
      if (filter.category) params.append("category", filter.category);

      const res = await axios.get(`/api/reports?${params}`);
      if (page === 1) {
        setReports(res.data.reports);
      } else {
        setReports([...reports, ...res.data.reports]);
      }
      setHasMore(res.data.pagination.page < res.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reportId) => {
    if (!user) {
      alert("Please login to vote");
      return;
    }

    try {
      const hasVoted = await axios.get(`/api/votes/check/${reportId}`);
      if (hasVoted.data.hasVoted) {
        await axios.delete(`/api/votes/${reportId}`);
      } else {
        await axios.post("/api/votes", { reportId });
      }
      fetchReports();
    } catch (error) {
      console.error("Error voting:", error);
      alert(error.response?.data?.message || "Failed to vote");
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      road: "bg-red-100 text-red-800",
      water: "bg-blue-100 text-blue-800",
      electricity: "bg-yellow-100 text-yellow-800",
      sanitation: "bg-green-100 text-green-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: "text-red-600",
      high: "text-orange-600",
      medium: "text-yellow-600",
      low: "text-green-600",
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Infrastructure Reports
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filter.category}
              onChange={(e) => {
                setFilter({ ...filter, category: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              <option value="road">Road</option>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="sanitation">Sanitation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filter.sort}
              onChange={(e) => {
                setFilter({ ...filter, sort: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="votes">Most Voted</option>
              <option value="date">Newest First</option>
              <option value="severity">Severity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading && reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No reports found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {report.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        report.category
                      )}`}
                    >
                      {report.category}
                    </span>
                    <span
                      className={`text-sm font-medium ${getSeverityColor(
                        report.severity
                      )}`}
                    >
                      {report.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{report.description}</p>
                  {report.images && report.images.length > 0 && (
                    <img
                      src={resolveImage(report.images[0])}
                      alt="report"
                      className="w-full max-h-80 object-cover rounded-md mb-3"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/800x400?text=Image+Unavailable";
                      }}
                    />
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <FiMapPin className="mr-1" />
                      {report.location?.address || "Location not specified"}
                    </span>
                    <span className="flex items-center">
                      <FiClock className="mr-1" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span>By {report.reportedBy?.username || "Anonymous"}</span>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        report.status === "resolved" ||
                        report.status === "closed"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : report.status === "in-progress"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-orange-100 text-orange-800 border-orange-200"
                      }`}
                    >
                      Status:{" "}
                      {report.status === "in-progress"
                        ? "On Work"
                        : report.status === "resolved"
                        ? "Completed"
                        : report.status === "open"
                        ? "Pending"
                        : report.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleVote(report._id)}
                  className={`ml-4 flex flex-col items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                    report.voters?.some(
                      (v) => v._id === user?.id || v === user?.id
                    )
                      ? "border-primary-600 bg-primary-50 text-primary-600"
                      : "border-gray-300 hover:border-primary-500 text-gray-700"
                  }`}
                >
                  <FiThumbsUp className="text-xl mb-1" />
                  <span className="text-sm font-semibold">
                    {report.votes || 0}
                  </span>
                </button>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={() => setPage(page + 1)}
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
