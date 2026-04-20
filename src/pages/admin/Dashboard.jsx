// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/UI/Card";
import { BarChart } from "../../components/UI/Chart";
import { FiUsers, FiBook, FiClock, FiAward } from "react-icons/fi";
import { useExam } from "../../contexts/ExamContext";

const Dashboard = () => {
  const { questions, examSettings } = useExam();
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    questionsBank: 0,
    avgScore: 0,
    examDuration: 0
  });
  
  const [chartData, setChartData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      { label: "Students Registered", data: [0, 0, 0, 0, 0, 0], backgroundColor: "#4f46e5", borderRadius: 8 },
      { label: "Exams Completed", data: [0, 0, 0, 0, 0, 0], backgroundColor: "#10b981", borderRadius: 8 },
    ],
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data from APIs
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const token = localStorage.getItem('admin_token');
      
      // Fetch students count
      const studentsRes = await fetch(`${API_URL}/admin/students/count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const totalStudents = studentsRes.ok ? await studentsRes.json() : 0;
      
      // Fetch average score
      const avgScoreRes = await fetch(`${API_URL}/admin/exams/average-score`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const avgScore = avgScoreRes.ok ? await avgScoreRes.json() : 0;
      
      // Fetch recent activities
      const activitiesRes = await fetch(`${API_URL}/admin/activities/recent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const activities = activitiesRes.ok ? await activitiesRes.json() : [];
      
      // Fetch chart data
      const chartRes = await fetch(`${API_URL}/admin/charts/monthly`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const chartDataFromAPI = chartRes.ok ? await chartRes.json() : null;
      
      // Update stats
      setStats({
        totalStudents: totalStudents,
        questionsBank: questions.length,
        avgScore: avgScore,
        examDuration: examSettings?.duration || 180
      });
      
      // Update activities
      setRecentActivities(activities);
      
      // Update chart data
      if (chartDataFromAPI) {
        setChartData({
          labels: chartDataFromAPI.labels,
          datasets: [
            { ...chartData.datasets[0], data: chartDataFromAPI.registrations },
            { ...chartData.datasets[1], data: chartDataFromAPI.completions }
          ]
        });
      }
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayStats = [
    { title: "Total Students", value: stats.totalStudents, change: "", icon: FiUsers, color: "bg-indigo-500" },
    { title: "Questions Bank", value: stats.questionsBank, change: "", icon: FiBook, color: "bg-green-500" },
    { title: "Avg. Score", value: `${stats.avgScore}%`, change: "", icon: FiAward, color: "bg-yellow-500" },
    { title: "Exam Duration", value: `${stats.examDuration} min`, change: "", icon: FiClock, color: "bg-purple-500" },
  ];

  if (loading) {
    return (
      <Layout title="Dashboard Overview">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displayStats.map((stat, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon className={`text-xl ${stat.color.replace("bg-", "text-")}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Registration & Performance Trend</h3>
          <div className="h-80">
            <BarChart data={chartData} />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{activity.studentName} {activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
                {activity.score && <span className="text-sm text-green-600">Score: {activity.score}%</span>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;