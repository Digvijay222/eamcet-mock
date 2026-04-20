// src/pages/student/Verification.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FiUser, FiBookOpen, FiCheckCircle, FiAlertCircle, FiLogIn } from "react-icons/fi";
import Button from "../../components/UI/Button";
import Card from "../../components/UI/Card";

const Verification = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ 
    hallTicket: "", 
    name: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validateField = (name, value) => {
    switch (name) {
      case "hallTicket":
        if (!value) return "Hall Ticket is required";
        if (!/^[0-9]{10}$/.test(value)) return "Enter valid 10-digit Hall Ticket";
        return "";
      case "name":
        if (!value) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setApiError("");
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    const newTouched = {};
    
    Object.keys(formData).forEach(key => {
      newTouched[key] = true;
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched(newTouched);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // API call to your Spring Boot backend
      const response = await fetch('http://localhost:8080/student/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hallTicket: formData.hallTicket,
          name: formData.name
        })
      });

      // Your backend returns plain text "Allowed"
      const responseText = await response.text();
      
      console.log("Response:", responseText); // For debugging

      if (response.ok && responseText === "Allowed") {
        // Store student data in auth context
        login({
          hallTicket: formData.hallTicket,
          name: formData.name,
          isVerified: true
        });
        navigate("/instructions");
      } else {
        setApiError("Invalid Hall Ticket number or Name. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setApiError("Unable to connect to server. Please make sure backend is running on http://localhost:8080");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl shadow-xl mb-4 transform transition-transform hover:scale-105 duration-300">
            <FiBookOpen className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">EAMCET MOCK TEST</h1>
          <p className="text-gray-500 mt-2 font-medium">Student Login Portal</p>
        </div>

        {/* Verification Form */}
        <Card className="p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* API Error Display */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                <FiAlertCircle className="text-red-500 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Hall Ticket Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hall Ticket <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  name="hallTicket"
                  value={formData.hallTicket}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter 10-digit Hall Ticket"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 ${
                    errors.hallTicket && touched.hallTicket ? "border-red-400 bg-red-50" : "border-gray-200 focus:bg-white"
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.hallTicket && touched.hallTicket && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1 font-medium">
                  <FiAlertCircle className="text-sm" /> {errors.hallTicket}
                </p>
              )}
            </div>

            {/* Student Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 ${
                    errors.name && touched.name ? "border-red-400 bg-red-50" : "border-gray-200 focus:bg-white"
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.name && touched.name && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1 font-medium">
                  <FiAlertCircle className="text-sm" /> {errors.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin inline mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <FiLogIn className="inline mr-2 text-lg" /> Login
                </>
              )}
            </Button>
          </form>

          {/* Decorative Login Hint */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <FiCheckCircle className="text-green-400" /> Secure verification for mock test access
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400 font-medium tracking-wide">
            © 2026 EAMCET Examination. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verification;