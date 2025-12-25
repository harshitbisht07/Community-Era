import React from 'react';
import { Link } from 'react-router-dom';
import { FiMap, FiFileText, FiBarChart2, FiUsers, FiClock } from 'react-icons/fi';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🌍 Community Era
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Community-driven Infrastructure Monitoring Platform
        </p>
        <p className="text-lg text-gray-500 max-w-3xl mx-auto">
          Transform scattered complaints into structured, actionable infrastructure intelligence.
          Report problems, validate priorities, and track progress through community participation.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-4 text-primary-600">
            <FiFileText />
          </div>
          <h3 className="text-xl font-semibold mb-2">Problem Reporting</h3>
          <p className="text-gray-600 mb-4">
            Report infrastructure issues with location, description, and severity level.
          </p>
          <Link
            to="/map"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Report Issue →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-4 text-primary-600">
            <FiBarChart2 />
          </div>
          <h3 className="text-xl font-semibold mb-2">Priority Ranking</h3>
          <p className="text-gray-600 mb-4">
            Vote on issues to help prioritize the most critical problems in your area.
          </p>
          <Link
            to="/reports"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Reports →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-4 text-primary-600">
            <FiUsers />
          </div>
          <h3 className="text-xl font-semibold mb-2">Participation Dashboard</h3>
          <p className="text-gray-600 mb-4">
            Track community engagement and participation awareness in your area.
          </p>
          <Link
            to="/dashboard"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Dashboard →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-4 text-primary-600">
            <FiClock />
          </div>
          <h3 className="text-xl font-semibold mb-2">Project Timelines</h3>
          <p className="text-gray-600 mb-4">
            Transparent tracking of infrastructure projects with milestone deadlines.
          </p>
          <Link
            to="/reports"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Projects →
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to make a difference?
        </h2>
        <p className="text-gray-600 mb-6">
          Join your community in identifying and prioritizing infrastructure issues.
        </p>
        <div className="space-x-4">
          <Link
            to="/register"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
          >
            Get Started
          </Link>
          <Link
            to="/map"
            className="inline-block px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-md hover:bg-primary-50 font-medium"
          >
            View Map
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

