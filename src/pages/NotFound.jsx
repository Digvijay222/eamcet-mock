// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import Button from "../components/UI/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-indigo-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/verify" className="mt-6 inline-block">
          <Button variant="primary">
            <FiHome className="inline mr-2" /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;