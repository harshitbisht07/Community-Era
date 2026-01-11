import React from "react";
import { Link } from "react-router-dom";
import { FiX, FiLock } from "react-icons/fi";

const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={20} />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <FiLock size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Login Required
          </h3>
          <p className="text-sm text-gray-500 mb-6 px-4">
            Join the community to vote on issues, comment, and track reports.
          </p>

          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="block w-full py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
