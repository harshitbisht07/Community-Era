import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "../context/useAuthContext";
import { useNavigate } from "react-router-dom";
import {
  FiThumbsUp,
  FiMapPin,
  FiAlertCircle,
  FiClock,
  FiFilter,
  FiArrowDown,
  FiUser,
  FiTrendingUp,
  FiCamera,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiMessageSquare,
} from "react-icons/fi";
import SkeletonLoader from "../components/SkeletonLoader";
import StatusPill from "../components/StatusPill";
import CommentSection from "../components/CommentSection";

const Reports = () => {
  // Data State
  const [reports, setReports] = useState([]);
  const [expandedComments, setExpandedComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination State
  const [filter, setFilter] = useState({ category: "", sort: "date" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCluster, setSelectedCluster] = useState(null);

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Logic
  useEffect(() => {
    fetchReports();
  }, [filter, page, debouncedSearch]);

  // Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) =>
          setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        (e) => console.error(e)
      );
    }
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10", // Smaller limit for better pagination feel
        sort: filter.sort,
        search: debouncedSearch,
      });
      if (filter.category) params.append("category", filter.category);

      const res = await axios.get(`/api/reports?${params}`);

      // Handle both backend structures (if backend is in transition)
      // Expecting { reports: [], pagination: { ... } } or just { reports: [] }
      setReports(res.data.reports || []);

      const meta = res.data.pagination || {};
      setTotalPages(meta.pages || 1);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const resolveImage = (url) => {
    if (!url) return "";
    if (url.startsWith("/uploads")) {
      const backendBase = `${window.location.protocol}//${window.location.hostname}:5001`;
      return `${backendBase}${url}`;
    }
    return url;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    if (d < 1) return `${Math.round(d * 1000)}m away`;
    return `${d.toFixed(1)}km away`;
  };

  const handleVote = async (reportId) => {
    if (!user) return alert("Please login to vote");

    const report = reports.find((r) => r._id === reportId);
    if (!report) return;

    const userId = user._id || user.id;
    // Check if user has voted using more robust ID comparison
    const isVoted = report.voters.some((v) => (v._id || v) === userId);

    // Optimistic Update
    setReports((prev) =>
      prev.map((r) => {
        if (r._id !== reportId) return r;
        return {
          ...r,
          votes: isVoted ? Math.max(0, r.votes - 1) : r.votes + 1,
          voters: isVoted
            ? r.voters.filter((v) => (v._id || v) !== userId)
            : [...r.voters, { _id: userId }],
        };
      })
    );

    try {
      if (isVoted) {
        await axios.delete(`/api/votes/${reportId}`);
      } else {
        await axios.post("/api/votes", { reportId });
      }
    } catch (error) {
      console.error("Vote failed", error);
      alert("Failed to vote");
      fetchReports(); // Revert on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 font-sans pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Community Calls
            </h1>
            <p className="text-gray-500 max-w-lg">
              Voicing local infrastructure issues. Vote on what matters most.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group flex-1 sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none shadow-sm transition-all"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={filter.category}
                  onChange={(e) => {
                    setFilter({ ...filter, category: e.target.value });
                    setPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm outline-none"
                >
                  <option value="">All Topics</option>
                  <option value="road">Road</option>
                  <option value="water">Water</option>
                  <option value="electricity">Electricity</option>
                  <option value="sanitation">Sanitation</option>
                </select>
                <FiArrowDown
                  className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                  size={12}
                />
              </div>
              <div className="relative">
                <select
                  value={filter.sort}
                  onChange={(e) => {
                    setFilter({ ...filter, sort: e.target.value });
                    setPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm outline-none"
                >
                  <option value="date">Newest</option>
                  <option value="votes">Most Voted</option>
                  <option value="severity">Severity</option>
                </select>
                <FiArrowDown
                  className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                  size={12}
                />
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-6">
          {loading &&
            reports.length === 0 &&
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-6"
                >
                  <SkeletonLoader
                    width={192}
                    height={192}
                    className="rounded-xl shrink-0"
                  />
                  <div className="w-full space-y-3">
                    <SkeletonLoader width="60%" height={24} />
                    <SkeletonLoader width="90%" height={16} />
                    <SkeletonLoader width="40%" height={16} />
                  </div>
                </div>
              ))}

          {!loading && reports.length === 0 && (
            <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiFilter className="text-blue-300 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No reports found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters.
              </p>
            </div>
          )}

          {reports.map((report, index) => (
            <div
              key={report._id}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col md:flex-row gap-8 cursor-pointer relative"
              onClick={() =>
                navigate("/map", {
                  state: {
                    center: [
                      report.location.coordinates.lat,
                      report.location.coordinates.lng,
                    ],
                  },
                })
              }
            >
              {/* Image */}
              <div className="w-full md:w-56 h-56 md:h-auto shrink-0 relative overflow-hidden rounded-xl bg-gray-100 border border-gray-50">
                {report.allImages?.[0] || report.images?.[0] ? (
                  <img
                    src={resolveImage(
                      report.allImages?.[0] || report.images[0]
                    )}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                    <FiCamera size={32} className="mb-2" />
                    <span className="text-xs font-semibold">No Image</span>
                  </div>
                )}
                {report.clusterCount > 1 && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md z-10">
                    +{report.clusterCount - 1} More
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col py-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <StatusPill status={report.status} />
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 capitalize">
                      {report.category}
                    </span>
                    {report.clusterCount > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCluster(report);
                        }}
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-600 border border-purple-200 flex items-center gap-1 hover:bg-purple-200 transition-colors cursor-pointer"
                      >
                        <FiTrendingUp className="text-[10px]" />
                        {report.clusterCount} Reports
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-400 flex items-center justify-end gap-1">
                      <FiClock />{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    {userLocation && (
                      <div className="text-xs font-bold text-blue-600 mt-1">
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          report.location.coordinates.lat,
                          report.location.coordinates.lng
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                  {report.title}
                </h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {report.description}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                    <span className="flex items-center gap-1.5 hover:text-blue-600 bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                      <FiMapPin />{" "}
                      {report.location?.address?.split(",")[0] || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiUser /> {report.reportedBy?.username || "Anonymous"}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(report._id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 z-10 ${
                      report.voters?.some(
                        (v) => (v._id || v) === (user?._id || user?.id)
                      )
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-gray-50 text-gray-600 hover:bg-white hover:border-gray-200 hover:shadow border border-transparent"
                    }`}
                  >
                    <FiThumbsUp
                      className={
                        report.voters?.some(
                          (v) => (v._id || v) === (user?._id || user?.id)
                        )
                          ? "fill-current"
                          : ""
                      }
                    />
                    {report.totalVotes !== undefined
                      ? report.totalVotes
                      : report.votes || 0}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedComments((prev) =>
                        prev.includes(report._id)
                          ? prev.filter((id) => id !== report._id)
                          : [...prev, report._id]
                      );
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gray-50 text-gray-600 hover:bg-white hover:border-gray-200 hover:shadow border border-transparent transition-all active:scale-95 z-10"
                  >
                    <FiMessageSquare />
                    Discuss
                  </button>
                </div>

                {/* Comment Section */}
                {expandedComments.includes(report._id) && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <CommentSection reportId={report._id} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <FiChevronLeft />
            </button>
            <div className="text-sm font-bold text-gray-600">
              Page <span className="text-gray-900">{page}</span> of {totalPages}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
      {/* Cluster Details Modal */}
      {selectedCluster && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Cluster Details
                </h2>
                <p className="text-sm text-gray-500">
                  This issue has been reported {selectedCluster.clusterCount}{" "}
                  times
                </p>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              {[selectedCluster, ...(selectedCluster.childReports || [])].map(
                (r, i) => (
                  <div
                    key={r._id || i}
                    className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2">
                        {i === 0 && (
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                        <span className="text-xs font-medium text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <StatusPill status={r.status} />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{r.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {r.description}
                    </p>

                    {/* Individual Image */}
                    {(r.images?.[0] ||
                      (i === 0 && selectedCluster.images?.[0])) && (
                      <img
                        src={resolveImage(
                          r.images?.[0] ||
                            (i === 0 && selectedCluster.images?.[0])
                        )}
                        alt="Evidence"
                        className="w-full h-48 object-cover rounded-lg bg-gray-100"
                      />
                    )}

                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiUser /> {r.reportedBy?.username || "Unknown"}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;