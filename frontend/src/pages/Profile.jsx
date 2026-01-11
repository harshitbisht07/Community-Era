import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "../context/useAuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiTrendingUp,
  FiAlertTriangle,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser, logout } = useAuthContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchStats();
    if (user) {
      setEditName(user.username);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await axios.get("/api/auth/profile-stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch profile stats", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim() || editName === user.username) {
      setIsEditing(false);
      return;
    }

    setUpdating(true);
    try {
      const payload = { username: editName };

      const res = await axios.put("/api/auth/profile", payload);
      // Update global auth state
      updateUser(res.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete("/api/auth/me");
      logout();
      navigate("/");
      alert("Your account has been deleted.");
    } catch (err) {
      console.error("Failed to delete account", err);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={() => {
                if (isEditing) handleUpdateProfile();
                else setIsEditing(true);
              }}
              disabled={updating}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isEditing
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {updating
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Edit Profile"}
            </button>
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(user.username);
                }}
                className="ml-2 px-3 py-2 text-gray-400 hover:text-gray-600 font-medium text-sm"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 shrink-0">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="text-center md:text-left flex-1 w-full">
            {isEditing ? (
              <div className="mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent w-full md:w-1/2"
                  autoFocus
                />
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.username}
              </h1>
            )}

            <div className="flex flex-col md:flex-row gap-4 text-gray-500 text-sm justify-center md:justify-start">
              <span className="flex items-center gap-1.5">
                <FiMail /> {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <FiCalendar /> Joined{" "}
                {new Date(
                  user.id
                    ? parseInt(user.id.substring(0, 8), 16) * 1000
                    : Date.now()
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <FiFileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Reports Filed
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats?.totalReports || 0}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Issues Solved
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats?.resolvedReports || 0}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <FiTrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Comm. Impact
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats?.impactScore || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading activity...
              </div>
            ) : stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Files in {activity.category} •{" "}
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        activity.status === "resolved"
                          ? "bg-green-100 text-green-700"
                          : activity.status === "in-progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {activity.status.replace("-", " ")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 italic">
                No recent activity found. Start by filing a report!
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
          <h3 className="text-sm font-bold text-red-800 mb-4 flex items-center gap-2">
            <FiAlertTriangle /> Danger Zone
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-red-600">
              Once you delete your account, there is no going back. All your
              data will be permanently removed.
            </p>
            {showDeleteConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700"
                >
                  Confirm Delete
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-lg hover:bg-red-50 flex items-center gap-2"
              >
                <FiTrash2 /> Delete Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
