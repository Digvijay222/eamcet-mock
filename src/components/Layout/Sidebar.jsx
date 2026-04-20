// src/components/Layout/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiUsers,
  FiSettings,
  FiBarChart2,
  FiLogOut,
  FiFileText,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { path: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/admin/questions", icon: FiBook, label: "Questions" },
    { path: "/admin/students", icon: FiUsers, label: "Students" },
    { path: "/admin/settings", icon: FiSettings, label: "Exam Settings" },
    { path: "/admin/reports", icon: FiBarChart2, label: "Reports" },
  ];

  const handleLogout = () => {
    logout(); // Your logout function clears everything
    navigate("/admin/login");
    if (isMobile && onClose) {
      onClose();
    }
  };

  const sidebarClasses = `
    fixed top-0 left-0 h-full bg-gray-900 text-white z-30
    transition-all duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    ${isMobile ? "w-72" : "w-64"}
    shadow-2xl
  `;

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={onClose} />
      )}
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FiFileText className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Mock EAMCET</h1>
                <p className="text-xs text-gray-400">Admin Portal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <item.icon className="text-xl" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <FiLogOut className="text-xl" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;