// src/components/UI/Card.jsx
import React from "react";

const Card = ({ children, className, hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100
        ${hover ? "hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer" : ""}
        ${className || ""}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => (
  <div className={`p-6 pb-4 border-b border-gray-100 ${className || ""}`}>{children}</div>
);

export const CardBody = ({ children, className }) => (
  <div className={`p-6 ${className || ""}`}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
  <div className={`p-6 pt-4 border-t border-gray-100 ${className || ""}`}>{children}</div>
);

export default Card;