import React, { useState } from "react";
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
  FiMenu,
  FiX,
} from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  const getLinkClass = (path, isMobile = false) => {
    const isActive = location.pathname === path;
    const baseClass = isMobile
      ? "block px-3 py-2 rounded-md text-base font-medium"
      : "inline-flex items-center px-1 pt-1 text-sm font-medium";

    return `${baseClass} ${
      isActive
        ? "text-primary-600 bg-blue-50 sm:bg-transparent sm:border-b-2 sm:border-primary-600"
        : "text-gray-700 hover:text-primary-600 hover:bg-gray-50 sm:hover:bg-transparent sm:hover:border-b-2 sm:hover:border-gray-300"
    }`;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[9999] shadow-sm transition-all">
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

          <div className="hidden sm:flex items-center space-x-4">
            <Link
              to="/map"
              className="hidden sm:inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-bold rounded-full shadow-md text-white bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all mr-2"
            >
              <FiMap className="mr-1 md:mr-2" /> Report Issue
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

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? "block" : "hidden"} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1 px-4">
          {/* Mobile Report Button */}
          <Link
            to="/map"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center px-4 py-3 mb-4 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            <FiMap className="mr-2" /> Report Issue
          </Link>

          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={getLinkClass("/", true)}
          >
            <FiHome className="mr-1 inline" /> Home
          </Link>
          <Link
            to="/map"
            onClick={() => setIsOpen(false)}
            className={getLinkClass("/map", true)}
          >
            <FiMap className="mr-1 inline" /> Map
          </Link>
          <Link
            to="/reports"
            onClick={() => setIsOpen(false)}
            className={getLinkClass("/reports", true)}
          >
            <FiFileText className="mr-1 inline" /> Reports
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className={getLinkClass("/dashboard", true)}
          >
            <FiBarChart2 className="mr-1 inline" /> Dashboard
          </Link>
        </div>
        <div className="pt-4 pb-4 border-t border-gray-200 px-4">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user.username}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user.email || "User"}
                  </div>
                </div>
              </div>

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  <FiSettings className="mr-1 inline" /> Admin Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <FiLogOut className="mr-1 inline" /> Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
