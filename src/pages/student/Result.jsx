// src/pages/student/Result.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExam } from "../../contexts/ExamContext";
import { FiCheckCircle, FiXCircle, FiClock, FiAward, FiHome } from "react-icons/fi";
import Button from "../../components/UI/Button";
import Card from "../../components/UI/Card";
import { DoughnutChart } from "../../components/UI/Chart";

const Result = () => {
  const navigate = useNavigate();
  const { questions, answers, examSettings } = useExam();
  const [score, setScore] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setPercentage((correct / questions.length) * 100);
  }, [questions, answers]);

  const chartData = {
    labels: ["Correct", "Incorrect", "Unanswered"],
    datasets: [
      {
        data: [
          score,
          Object.keys(answers).length - score,
          questions.length - Object.keys(answers).length,
        ],
        backgroundColor: ["#10b981", "#ef4444", "#6b7280"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Score Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg mb-4">
            <FiAward className="text-white text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Exam Completed!</h1>
          <p className="text-gray-500 mt-2">Thank you for participating in Mock EAMCET</p>
        </div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600">{score}</div>
            <div className="text-sm text-gray-500 mt-1">Correct Answers</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-red-500">{questions.length - score}</div>
            <div className="text-sm text-gray-500 mt-1">Incorrect Answers</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-500">{questions.length - Object.keys(answers).length}</div>
            <div className="text-sm text-gray-500 mt-1">Unanswered</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{percentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-500 mt-1">Percentage</div>
          </Card>
        </div>

        {/* Chart and Details */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Performance Overview</h3>
            <div className="h-64">
              <DoughnutChart data={chartData} />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Exam Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Total Questions</span>
                <span className="font-semibold">{questions.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Time Taken</span>
                <span className="font-semibold">{examSettings.duration} minutes</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Qualifying Status</span>
                <span className={`font-semibold ${percentage >= 40 ? "text-green-600" : "text-red-600"}`}>
                  {percentage >= 40 ? "Qualified" : "Not Qualified"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Answer Review Section */}
        <Card className="p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Answer Review</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={q.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Q{idx + 1}. {q.text}</p>
                      <div className="mt-2 text-sm">
                        <p className={isCorrect ? "text-green-600" : "text-red-600"}>
                          Your Answer: {userAnswer || "Not answered"}
                        </p>
                        <p className="text-green-600">Correct Answer: {q.correctAnswer}</p>
                      </div>
                    </div>
                    {isCorrect ? (
                      <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                    ) : (
                      <FiXCircle className="text-red-500 text-xl flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={() => navigate("/verify")}>
            <FiHome className="inline mr-2" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Result;