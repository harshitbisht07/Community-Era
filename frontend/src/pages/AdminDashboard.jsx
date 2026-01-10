import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "../context/useAuthContext";
import {
  FiUsers,
  FiFileText,
  FiCheck,
  FiX,
  FiTrash2,
  FiRefreshCw,
  FiShield,
  FiAlertCircle,
  FiFilter,
  FiEyeOff,
  FiCheckCircle,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiActivity,
} from "react-icons/fi";
import SkeletonLoader from "../components/SkeletonLoader";

// --- Components ---

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDestructive,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:ring focus:ring-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-lg transform transition-all active:scale-95 focus:ring ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 shadow-red-200 focus:ring-red-200"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 focus:ring-blue-200"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    open: "bg-red-50 text-red-700",
    "in-progress": "bg-amber-50 text-amber-700",
    resolved: "bg-emerald-50 text-emerald-700",
    closed: "bg-gray-50 text-gray-600",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
        styles[status] || styles.closed
      }`}
    >
      {status}
    </span>
  );
};

// --- Main Page ---

const AdminDashboard = () => {
  const { user, loading } = useAuthContext();
  const [activeTab, setActiveTab] = useState("reports");

  // Data State
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  // Loading States
  const [dataLoading, setDataLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // Pagination & Search
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filters (Reports)
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    sort: "date",
  });

  // Selection (Reports)
  const [selectedRepIds, setSelectedRepIds] = useState(new Set());

  // Modal
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
    isDestructive: false,
  });

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((p) => ({ ...p, page: 1 })); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Data Trigger
  useEffect(() => {
    if (!loading && user && user.role === "admin") {
      refreshData();
    }
  }, [user, loading, activeTab, filters, pagination.page, debouncedSearch]);

  const refreshData = () => {
    if (activeTab === "users") fetchUsers();
    else {
      // Don't clear selection on simple refresh, only on tab change (opt)
      if (activeTab !== "reports") setSelectedRepIds(new Set());
      fetchReports();
    }
  };

  const fetchUsers = async () => {
    try {
      setDataLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
      });

      const res = await axios.get(`/api/admin/users?${params}`);

      // Backend new format: { users, pagination: { page, limit, total, pages } }
      // Or fallback to old format if backend not fully updated yet (safety check)
      if (res.data.users) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      } else {
        setUsers(res.data); // Legacy fallback
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setDataLoading(true);
      const params = new URLSearchParams({
        limit: 100, // Frontend pagination for now on reports, or update backend?
        // Plan said: Backend: Add Search (Text index) & Pagination to Users/Reports
        // But backend reports.js code viewed earlier doesn't show pagination META in response yet strictly.
        // It had limit/skip logic? Let's assume standard response for now or limited 100
        sort: filters.sort,
        search: debouncedSearch,
      });
      if (filters.status) params.append("status", filters.status);
      if (filters.category) params.append("category", filters.category);

      const res = await axios.get(`/api/reports?${params}`);

      // Reports endpoint returns { reports: [], ... } usually
      setReports(res.data.reports || []);
      // If backend reports doesn't support pagination meta yet, we might simulate or just take 100.
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setDataLoading(false);
    }
  };

  // --- Actions ---

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination.pages || 1)) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const openModal = (title, message, action, isDestructive = false) => {
    setModal({ isOpen: true, title, message, action, isDestructive });
  };
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const confirmModal = async () => {
    if (modal.action) await modal.action();
    closeModal();
  };

  const toggleRole = async (u, newRole) => {
    openModal(
      `Change Role to ${newRole.toUpperCase()}?`,
      `Are you sure you want to change ${u.username}'s role?`,
      async () => {
        try {
          setBtnLoading(true);
          await axios.patch(`/api/admin/users/${u._id}/role`, {
            role: newRole,
          });
          fetchUsers();
        } catch (err) {
          alert("Failed to update role");
        } finally {
          setBtnLoading(false);
        }
      }
    );
  };

  const deleteUser = async (id) => {
    openModal(
      "Delete User?",
      "This action cannot be undone.",
      async () => {
        try {
          await axios.delete(`/api/admin/users/${id}`);
          fetchUsers();
        } catch {
          alert("Failed");
        }
      },
      true
    );
  };

  const updateReportStatus = async (report, newStatus) => {
    try {
      await axios.patch(`/api/reports/${report._id}`, { status: newStatus });
      fetchReports();
    } catch {
      alert("Failed");
    }
  };

  const toggleApproval = async (report) => {
    const isHiding = report.isApproved;
    const execute = async () => {
      try {
        await axios.patch(`/api/reports/${report._id}`, {
          isApproved: !report.isApproved,
        });
        fetchReports();
      } catch {
        alert("Failed");
      }
    };
    if (isHiding)
      openModal(
        "Hide Report?",
        "This will hide the report from public feed.",
        execute,
        true
      );
    else await execute();
  };

  const deleteReport = async (id) => {
    openModal(
      "Delete Report?",
      "Cannot be undone.",
      async () => {
        try {
          await axios.delete(`/api/reports/${id}`);
          fetchReports();
        } catch {
          alert("Failed");
        }
      },
      true
    );
  };

  // --- Bulk ---
  const handleBulkAction = (actionType) => {
    if (selectedRepIds.size === 0) return;
    const execute = async () => {
      try {
        setBtnLoading(true);
        const promises = Array.from(selectedRepIds).map((id) => {
          if (actionType === "delete")
            return axios.delete(`/api/reports/${id}`);
          if (actionType === "approve")
            return axios.patch(`/api/reports/${id}`, { isApproved: true });
          if (actionType === "hide")
            return axios.patch(`/api/reports/${id}`, { isApproved: false });
          if (actionType === "resolve")
            return axios.patch(`/api/reports/${id}`, { status: "resolved" });
        });
        await Promise.all(promises);
        fetchReports();
        setSelectedRepIds(new Set());
      } catch {
        alert("Bulk action failed");
      } finally {
        setBtnLoading(false);
      }
    };

    let title = "Bulk Action",
      msg = "Proceed?";
    if (actionType === "delete") {
      title = "Bulk Delete";
      msg = "Delete selected items?";
    }

    openModal(title, msg, execute, actionType === "delete");
  };

  // --- Render ---

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      <ConfirmationModal
        {...modal}
        onConfirm={confirmModal}
        onCancel={closeModal}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Platform overview and management.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={refreshData}
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors active:scale-95"
            >
              <FiRefreshCw className={dataLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          {["reports", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPagination((p) => ({ ...p, page: 1 }));
                setSearchQuery("");
              }}
              className={`pb-4 text-sm font-bold border-b-2 transition-all capitalize ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab} Management
            </button>
          ))}
        </div>

        {/* Filters (Reports Only) */}
        {activeTab === "reports" && (
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3 items-center">
              <FiFilter className="text-gray-400" />
              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="bg-gray-50 border-gray-200 rounded-lg py-1.5 px-3 text-xs font-medium focus:ring-blue-500 hover:bg-gray-100 cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="bg-gray-50 border-gray-200 rounded-lg py-1.5 px-3 text-xs font-medium focus:ring-blue-500 hover:bg-gray-100 cursor-pointer"
              >
                <option value="">All Category</option>
                <option value="road">Road</option>
                <option value="water">Water</option>
                <option value="electricity">Electricity</option>
              </select>
            </div>

            {selectedRepIds.size > 0 && (
              <div className="flex items-center gap-2 animate-fade-in bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <span className="text-xs font-bold text-blue-700 mr-2">
                  {selectedRepIds.size} selected
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleBulkAction("approve")}
                    className="p-1 hover:text-blue-600"
                  >
                    <FiCheckCircle />
                  </button>
                  <button
                    onClick={() => handleBulkAction("hide")}
                    className="p-1 hover:text-gray-600"
                  >
                    <FiEyeOff />
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="p-1 hover:text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  {activeTab === "users" ? (
                    <>
                      <th className="px-6 py-3 border-b">User</th>
                      <th className="px-6 py-3 border-b">Role</th>
                      <th className="px-6 py-3 border-b">Activity</th>
                      <th className="px-6 py-3 border-b text-right">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 border-b w-10 text-center">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setSelectedRepIds(
                              selectedRepIds.size === reports.length
                                ? new Set()
                                : new Set(reports.map((r) => r._id))
                            )
                          }
                          checked={
                            reports.length > 0 &&
                            selectedRepIds.size === reports.length
                          }
                        />
                      </th>
                      <th className="px-6 py-3 border-b">Report</th>
                      <th className="px-6 py-3 border-b">Status</th>
                      <th className="px-6 py-3 border-b">Visibility</th>
                      <th className="px-6 py-3 border-b text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {dataLoading
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <tr key={i}>
                          <td colSpan="5" className="px-6 py-4">
                            <div className="flex gap-4">
                              <SkeletonLoader
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                              <div className="space-y-2">
                                <SkeletonLoader width={150} height={16} />
                                <SkeletonLoader width={100} height={12} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                  : activeTab === "users"
                  ? users.map((u) => (
                      <tr
                        key={u._id}
                        className={`group hover:bg-gray-50/80 transition-colors ${
                          u.role === "admin" ? "bg-purple-50/30" : ""
                        }`}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                                u.role === "admin"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {u.role === "admin" ? (
                                <FiShield size={14} />
                              ) : (
                                u.username.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {u.username}
                              </div>
                              <div className="text-xs text-gray-400">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => toggleRole(u, e.target.value)}
                            className="bg-transparent border-none text-xs font-bold uppercase tracking-wider text-gray-600 focus:ring-0 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 -ml-2"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <FiClock size={12} />
                            {u.lastActive
                              ? new Date(u.lastActive).toLocaleDateString()
                              : "Never"}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))
                  : reports.map((r) => (
                      <tr
                        key={r._id}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          selectedRepIds.has(r._id) ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRepIds.has(r._id)}
                            onChange={() => {
                              const s = new Set(selectedRepIds);
                              s.has(r._id) ? s.delete(r._id) : s.add(r._id);
                              setSelectedRepIds(s);
                            }}
                          />
                        </td>
                        <td className="px-6 py-3">
                          <div className="font-bold text-gray-900">
                            {r.title}
                          </div>
                          <div className="text-xs text-gray-400 line-clamp-1 max-w-[200px]">
                            {r.category} •{" "}
                            {new Date(r.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={r.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateReportStatus(r, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`appearance-none rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border-none focus:ring-2 cursor-pointer text-center ${
                              r.status === "open"
                                ? "bg-red-50 text-red-700 ring-1 ring-red-600/10 focus:ring-red-500"
                                : r.status === "in-progress"
                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 focus:ring-amber-500"
                                : r.status === "resolved"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 focus:ring-emerald-500"
                                : "bg-gray-50 text-gray-600 ring-1 ring-gray-500/10 focus:ring-gray-500"
                            }`}
                          >
                            <option value="open">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => toggleApproval(r)}
                            className={`text-xs font-bold px-3 py-1 rounded-full border transition-all shadow-sm ${
                              r.isApproved
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            }`}
                          >
                            {r.isApproved ? (
                              <span className="flex items-center gap-1">
                                <FiCheckCircle size={10} /> Public
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <FiEyeOff size={10} /> Hidden
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => deleteReport(r._id)}
                            className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}

                {!dataLoading &&
                  ((activeTab === "users" && users.length === 0) ||
                    (activeTab === "reports" && reports.length === 0)) && (
                    <tr>
                      <td
                        colSpan="100%"
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        No results found.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          {/* User Pagination */}
          {activeTab === "users" && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="flex items-center gap-1 text-sm font-bold text-gray-500 disabled:opacity-30 hover:text-gray-800"
              >
                <FiChevronLeft /> Prev
              </button>
              <span className="text-xs font-medium text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="flex items-center gap-1 text-sm font-bold text-gray-500 disabled:opacity-30 hover:text-gray-800"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
