// src/pages/student/Instructions.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FiClock, FiFileText, FiAlertCircle, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import Button from "../../components/UI/Button";
import Card from "../../components/UI/Card";

const Instructions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agreed, setAgreed] = useState(false);

  const instructions = [
    { icon: FiClock, title: "Duration", text: "Total exam duration is 180 minutes (3 hours)" },
    { icon: FiFileText, title: "Questions", text: "160 multiple choice questions across Physics, Chemistry, Mathematics" },
    { icon: FiAlertCircle, title: "Marking Scheme", text: "+1 for correct answer, No negative marking" },
    { icon: FiCheckCircle, title: "Navigation", text: "You can navigate between questions using the palette" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Exam Instructions</h1>
          <p className="text-gray-500 mt-2">Welcome, {user?.name} | {user?.hallTicket}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {instructions.map((inst, idx) => (
            <Card key={idx} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <inst.icon className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{inst.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{inst.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Important Rules:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• The timer will start automatically when you begin the exam</li>
            <li>• You can mark questions for review and come back later</li>
            <li>• The exam will auto-submit when the timer reaches zero</li>
            <li>• Do not refresh the page during the exam</li>
            <li>• Ensure stable internet connection throughout</li>
          </ul>
        </Card>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-gray-700">I have read and agree to all the instructions and rules</span>
          </label>
          <Button
            variant="primary"
            disabled={!agreed}
            onClick={() => navigate("/exam")}
            className="flex items-center gap-2"
          >
            Start Exam <FiArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;