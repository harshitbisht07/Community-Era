import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/useAuthContext";
import {
  FiMap,
  FiFileText,
  FiBarChart2,
  FiUsers,
  FiClock,
  FiArrowRight,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";
import Footer from "../components/Footer";

const Home = () => {
  const { user } = useAuthContext();
  const isLoggedIn = !!user;

  const [stats, setStats] = useState({
    totalReports: 0,
    resolutionRate: 0,
    activeCities: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/participation");
        const data = await res.json();
        setStats({
          totalReports: data.totalReports || 0,
          resolutionRate: data.resolutionRate || 0,
          activeCities: data.activeCities || 0,
        });
      } catch (err) {
        console.error("Failed to fetch home stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            Empowering Communities for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Better Infrastructure
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed delay-100 animate-slide-up opacity-0">
            Transform scattered complaints into structured action. Report
            problems, validate priorities, and track progress together.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in delay-300 opacity-0">
            <Link
              to="/map"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
            >
              Report an Issue
              <FiArrowRight className="ml-2" />
            </Link>
            <Link
              to={isLoggedIn ? "/dashboard" : "/map"}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-xl hover:bg-gray-50 border border-gray-200 shadow-sm transition-all hover:-translate-y-1"
            >
              {isLoggedIn ? "Go to Dashboard" : "View Live Map"}
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {[
            {
              icon: <FiFileText className="w-8 h-8" />,
              title: "Easy Reporting",
              desc: "Report issues with location and photos in seconds.",
              link: "/map",
              linkText: "Report Issue",
            },
            {
              icon: <FiBarChart2 className="w-8 h-8" />,
              title: "Smart Priority",
              desc: "Vote to surface the most critical problems in your area.",
              link: "/reports",
              linkText: "View Reports",
            },
            {
              icon: <FiUsers className="w-8 h-8" />,
              title: "Community Power",
              desc: "Track engagement and see your neighborhood improve.",
              link: "/dashboard",
              linkText: "View Dashboard",
            },
            {
              icon: <FiClock className="w-8 h-8" />,
              title: "Track Progress",
              desc: "Transparent timelines from report to resolution.",
              link: "/reports",
              linkText: "View Timelines",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              style={{ animationDelay: `${idx * 150}ms` }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all group animate-scale-in opacity-0"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.desc}
              </p>
              <Link
                to={feature.link}
                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700"
              >
                {feature.linkText} <FiArrowRight className="ml-1 text-sm" />
              </Link>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 pb-20 border-b border-gray-100 mb-20 animate-fade-in delay-500">
          <div className="flex items-center gap-5 p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-4 bg-green-100 rounded-full text-green-600">
              <FiCheckCircle size={32} />
            </div>
            <div>
              <p className="text-4xl font-extrabold text-gray-900">
                {stats.totalReports > 0 ? stats.totalReports : "120+"}
              </p>
              <p className="text-lg text-gray-500 font-medium">
                Issues Reported
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
              <FiActivity size={32} />
            </div>
            <div>
              <p className="text-4xl font-extrabold text-gray-900">
                {stats.resolutionRate > 0 ? `${stats.resolutionRate}%` : "65%"}
              </p>
              <p className="text-lg text-gray-500 font-medium">
                Resolution Rate
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-4 bg-purple-100 rounded-full text-purple-600">
              <FiMap size={32} />
            </div>
            <div>
              <p className="text-4xl font-extrabold text-gray-900">
                {stats.activeCities > 0
                  ? `${stats.activeCities} Cities`
                  : "4 Cities"}
              </p>
              <p className="text-lg text-gray-500 font-medium">
                Active Communities
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-900 rounded-3xl p-12 text-center relative overflow-hidden animate-slide-up delay-500 opacity-0">
          {/* Abstract background blobs could go here */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full blur-3xl opacity-50 -mr-32 -mt-32 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl opacity-50 -ml-32 -mb-32 animate-float delay-1000"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to make a difference?
            </h2>
            <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of citizens improving their cities one report at a
              time.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={isLoggedIn ? "/dashboard" : "/register"}
                className="px-8 py-3 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                {isLoggedIn ? "Go to Dashboard" : "Create Account"}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
