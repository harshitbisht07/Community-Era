import React from "react";
import { Link } from "react-router-dom";
import { FiMap, FiBarChart2, FiGrid, FiHome } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 inline-block">
              Community Era
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
              Empowering communities through transparency.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Platform</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/"
                  className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-600 transition-colors"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/map"
                  className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-600 transition-colors"></span>
                  Map
                </Link>
              </li>
              <li>
                <Link
                  to="/reports"
                  className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-600 transition-colors"></span>
                  Reports
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-600 transition-colors"></span>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contributors Section */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 text-lg">
              Contributors
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:harshitjantwal1804@gmail.com"
                  className="text-gray-500 hover:text-blue-600 transition-colors text-sm break-all flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  harshitjantwal1804@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:harshvardhanbisht90@gmail.com"
                  className="text-gray-500 hover:text-blue-600 transition-colors text-sm break-all flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  harshvardhanbisht90@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:mergaurav4@gmail.com"
                  className="text-gray-500 hover:text-blue-600 transition-colors text-sm break-all flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  mergaurav4@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:bhaweshpant2005@gmail.com"
                  className="text-gray-500 hover:text-blue-600 transition-colors text-sm break-all flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  bhaweshpant2005@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">© 2026 Community Era</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
