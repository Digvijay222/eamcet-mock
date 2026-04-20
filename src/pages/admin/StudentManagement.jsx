// src/pages/admin/StudentManagement.jsx
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import Card, { CardHeader, CardBody } from "../../components/UI/Card";
import Input from "../../components/UI/Input";
import { FiSearch, FiFilter, FiDownload } from "react-icons/fi";

const StudentManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const API_URL = "http://localhost:8080";
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${API_URL}/admin/students`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        // Fallback to localStorage if API fails
        const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
        setStudents(localStudents);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
      setStudents(localStudents);
    } finally {
      setLoading(false);
    }
  };

  const getStudentStatus = (student) => {
    const results = JSON.parse(localStorage.getItem('examResults') || '[]');
    const studentResult = results.find(r => r.studentId === student.hallTicket);
    
    if (studentResult) return "completed";
    if (student.active === false) return "pending";
    return "registered";
  };

  const getStudentScore = (student) => {
    const results = JSON.parse(localStorage.getItem('examResults') || '[]');
    const studentResult = results.find(r => r.studentId === student.hallTicket);
    return studentResult ? studentResult.score : "-";
  };

  const getStudentDate = (student) => {
    if (student.registeredAt) {
      return new Date(student.registeredAt).toLocaleDateString();
    }
    return "-";
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (s.hallTicket || "").includes(search);
    const studentStatus = getStudentStatus(s);
    const matchesStatus = statusFilter === "all" || studentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const API_URL = "http://localhost:8080";
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${API_URL}/admin/students/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: export current data
        exportLocalToCSV();
      }
    } catch (error) {
      console.error("Export failed:", error);
      exportLocalToCSV();
    } finally {
      setExporting(false);
    }
  };

  const exportLocalToCSV = () => {
    const headers = ["Hall Ticket", "Name", "Status", "Score", "Registered Date"];
    const rows = filteredStudents.map(s => [
      s.hallTicket,
      s.name,
      getStudentStatus(s),
      getStudentScore(s),
      getStudentDate(s)
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "completed":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Completed</span>;
      case "registered":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Registered</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Pending</span>;
    }
  };

  if (loading) {
    return (
      <Layout title="Student Management">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Student Management">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name or hall ticket..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="registered">Registered</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <button 
              onClick={exportToCSV}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 disabled:opacity-50"
            >
              <FiDownload /> {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hall Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const status = getStudentStatus(student);
                    const score = getStudentScore(student);
                    const date = getStudentDate(student);
                    
                    return (
                      <tr key={student.id || student.hallTicket} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.hallTicket}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.name}</td>
                        <td className="px-6 py-4">{getStatusBadge(status)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-600">{score}%</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{date}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className="mt-4 pt-4 border-t flex justify-between text-sm text-gray-500">
            <span>Total Students: {students.length}</span>
            <span>Completed: {students.filter(s => getStudentStatus(s) === "completed").length}</span>
            <span>Registered: {students.filter(s => getStudentStatus(s) === "registered").length}</span>
          </div>
        </CardBody>
      </Card>
    </Layout>
  );
};

export default StudentManagement;