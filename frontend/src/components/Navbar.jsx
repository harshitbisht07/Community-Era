import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/useAuthContext";
import {
  FiMap,
  FiHome,
  FiFileText,
  FiBarChart2,
  FiLogOut,
  FiUser,
  FiSettings,
} from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `inline-flex items-center px-1 pt-1 text-sm font-medium ${
      isActive
        ? "text-primary-600 border-b-2 border-primary-600"
        : "text-gray-700 hover:text-primary-600 hover:border-b-2 hover:border-gray-300"
    }`;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex items-center px-2 py-2 text-xl font-bold text-primary-600 tracking-tight"
            >
              🌍 Community Era
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={getLinkClass("/")}>
                <FiHome className="mr-1" /> Home
              </Link>
              <Link to="/map" className={getLinkClass("/map")}>
                <FiMap className="mr-1" /> Map
              </Link>
              <Link to="/reports" className={getLinkClass("/reports")}>
                <FiFileText className="mr-1" /> Reports
              </Link>
              <Link to="/dashboard" className={getLinkClass("/dashboard")}>
                <FiBarChart2 className="mr-1" /> Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/map"
              className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-full shadow-md text-white bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all mr-2"
            >
              <FiMap className="mr-2" /> Report Issue
            </Link>

            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                      location.pathname.startsWith("/admin")
                        ? "text-primary-600"
                        : "text-gray-700 hover:text-primary-600"
                    }`}
                  >
                    <FiSettings className="mr-1" /> Admin
                  </Link>
                )}

                <span className="text-sm text-gray-700">
                  <FiUser className="inline mr-1" /> {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <FiLogOut className="mr-1" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
