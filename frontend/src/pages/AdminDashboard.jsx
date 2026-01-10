import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/useAuthContext";

const AdminDashboard = () => {
  const { user, loading } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (!loading && user && user.role === "admin") {
      fetchUsers();
      fetchReports();
    }
  }, [user, loading]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchReports = async () => {
    try {
      // Fetch reports (ProblemReport) instead of projects
      // The API returns { reports: [...], pagination: {...} }
      // We'll fetch a larger limit to see most recent ones, or we could implement pagination later.
      const res = await axios.get("/api/reports?limit=50&sort=date");
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  };

  // --- Users Actions ---
  const toggleRole = async (u) => {
    if (u.role === "admin") return; // Existing logic from screenshot: Admin Role button seems disabled or static if already admin, but we'll just check existing logic
    if (!window.confirm(`Make ${u.username} an Admin?`)) return;
    try {
      setBtnLoading(true);
      await axios.patch(`/api/admin/users/${u._id}/make-admin`);
      fetchUsers();
    } catch (err) {
      alert("Failed to update role");
    } finally {
      setBtnLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setBtnLoading(true);
      await axios.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    } finally {
      setBtnLoading(false);
    }
  };

  // --- Reports Actions ---
  const updateReportStatus = async (report, newStatus) => {
    // Schema enum: ['open', 'in-progress', 'resolved', 'closed']
    // UI: "pending" -> open, "on work" -> in-progress, "completed" -> resolved

    try {
      setBtnLoading(true);
      await axios.patch(`/api/reports/${report._id}`, { status: newStatus });
      fetchReports();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setBtnLoading(false);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      setBtnLoading(true);
      await axios.delete(`/api/reports/${id}`);
      fetchReports();
    } catch (err) {
      console.error(err);
      alert("Failed to delete report");
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Portal</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Card */}
          <div className="bg-white rounded-lg shadow-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Users</h2>
              <button
                onClick={fetchUsers}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <div className="mr-1">↺</div> Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-gray-600 font-semibold">
                      Username
                    </th>
                    <th className="pb-3 text-gray-600 font-semibold">Email</th>
                    <th className="pb-3 text-gray-600 font-semibold">Role</th>
                    <th className="pb-3 text-gray-600 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {users.map((u) => (
                    <tr key={u._id} className="border-b last:border-b-0">
                      <td className="py-4 text-blue-600 font-medium">
                        {u.username}
                      </td>
                      <td className="py-4 text-orange-500">{u.email}</td>
                      <td className="py-4 text-gray-600">
                        {u.role === "admin" ? "Admin" : "User"}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleRole(u)}
                            disabled={u.role === "admin"}
                            className={`px-3 py-1 rounded flex items-center ${
                              u.role === "admin"
                                ? "bg-blue-100 text-blue-400 cursor-not-allowed"
                                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                            }`}
                          >
                            ✎ Role
                          </button>
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="bg-red-100 text-red-500 px-3 py-1 rounded hover:bg-red-200 flex items-center"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Reports Card */}
          <div className="bg-white rounded-lg shadow-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">User Reports</h2>
              <button
                onClick={fetchReports}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <div className="mr-1">↺</div> Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-gray-600 font-semibold">Title</th>
                    <th className="pb-3 text-gray-600 font-semibold">
                      Category
                    </th>
                    <th className="pb-3 text-gray-600 font-semibold">Status</th>
                    <th className="pb-3 text-gray-600 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {reports.map((p) => (
                    <tr key={p._id} className="border-b last:border-b-0">
                      <td className="py-4 font-medium text-gray-800">
                        {p.title}
                      </td>
                      <td className="py-4 text-gray-600 capitalize">
                        {p.category}
                      </td>
                      <td className="py-4">
                        <span
                          className={`capitalize ${
                            p.status === "resolved" || p.status === "closed"
                              ? "text-green-600"
                              : p.status === "in-progress"
                              ? "text-blue-600"
                              : "text-orange-500"
                          }`}
                        >
                          {p.status === "in-progress"
                            ? "On Work"
                            : p.status === "resolved"
                            ? "Completed"
                            : p.status === "open"
                            ? "Pending"
                            : p.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => updateReportStatus(p, "open")}
                              className={`px-2 py-1 text-xs rounded border ${
                                p.status === "open"
                                  ? "bg-orange-100 text-orange-600 border-orange-200"
                                  : "text-gray-500 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              pending
                            </button>
                            <button
                              onClick={() =>
                                updateReportStatus(p, "in-progress")
                              }
                              className={`px-2 py-1 text-xs rounded border ${
                                p.status === "in-progress"
                                  ? "bg-green-100 text-green-600 border-green-200"
                                  : "text-gray-500 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              on work
                            </button>
                            <button
                              onClick={() => updateReportStatus(p, "resolved")}
                              className={`px-2 py-1 text-xs rounded border ${
                                p.status === "resolved"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "text-gray-500 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              completed
                            </button>
                          </div>
                          <button
                            onClick={() => deleteReport(p._id)}
                            className="bg-red-100 text-red-500 px-3 py-1 rounded hover:bg-red-200 w-max flex items-center text-xs"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
