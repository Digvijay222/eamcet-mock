// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ExamProvider } from "./contexts/ExamContext";

// Student Pages
import Verification from "./pages/student/Verification";
import Instructions from "./pages/student/Instructions";
import Exam from "./pages/student/Exam";
import Result from "./pages/student/Result";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import QuestionManagement from "./pages/admin/QuestionManagement";
import StudentManagement from "./pages/admin/StudentManagement";
import ExamSettings from "./pages/admin/ExamSettings";
import Reports from "./pages/admin/Reports";

import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ExamProvider>
          <Routes>
            {/* Student Routes */}
            <Route path="/" element={<Navigate to="/verify" />} />
            <Route path="/verify" element={<Verification />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/result" element={<Result />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/questions" element={<QuestionManagement />} />
            <Route path="/admin/students" element={<StudentManagement />} />
            <Route path="/admin/settings" element={<ExamSettings />} />
            <Route path="/admin/reports" element={<Reports />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ExamProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;