// src/components/UI/Input.jsx
import React from "react";

const Input = ({ label, error, icon, className, ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
        <input
          className={`
            w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            outline-none transition-all duration-200
            ${error ? "border-red-500" : "border-gray-300"}
            ${icon ? "pl-10" : ""}
            ${className || ""}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;