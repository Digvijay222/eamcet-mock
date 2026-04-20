
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("exam_user");
    const storedAdmin = localStorage.getItem("exam_admin");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedAdmin) {
      setIsAdmin(true);
    }
  }, []);

  const login = (studentData) => {
    setUser(studentData);
    localStorage.setItem("exam_user", JSON.stringify(studentData));
  };

  const adminLogin = () => {
    setIsAdmin(true);
    localStorage.setItem("exam_admin", "true");
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("exam_user");
    localStorage.removeItem("exam_admin");
    localStorage.removeItem("exam_answers");
    localStorage.removeItem("exam_time_left");
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};