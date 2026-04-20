// src/components/Exam/QuestionPalette.jsx
import React from 'react';

const QuestionPalette = ({ 
  totalQuestions, 
  answers, 
  markedForReview, 
  currentIndex, 
  sections,
  onQuestionClick 
}) => {
  
  const getQuestionStatus = (index) => {
    const question = sections ? 
      (sections.flatMap(s => 
        Array.from({ length: s.count }, (_, i) => s.startIndex + i)
      )[index]) : index;
    
    const questionId = index + 1;
    const isAnswered = answers[questionId];
    const isMarked = markedForReview[questionId];
    
    if (isAnswered && isMarked) return "answered-marked";
    if (isAnswered) return "answered";
    if (isMarked) return "marked";
    if (currentIndex === index) return "current";
    return "not-visited";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "answered": return "bg-green-600 text-white";
      case "marked": return "bg-purple-600 text-white";
      case "answered-marked": return "bg-blue-600 text-white";
      case "current": return "bg-indigo-600 text-white ring-2 ring-indigo-300";
      default: return "bg-gray-200 text-gray-700 hover:bg-gray-300";
    }
  };

  if (!sections) {
    // Simple palette without sections
    return (
      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-lg">Question Palette</h3>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const status = getQuestionStatus(i);
            return (
              <button
                key={i}
                onClick={() => onQuestionClick(i)}
                className={`w-9 h-9 rounded text-sm font-medium transition-all ${getStatusColor(status)}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-3 text-lg">Question Palette</h3>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-600 rounded"></div>
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span>Answered & Marked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span>Not Visited</span>
        </div>
      </div>

      {/* Section-wise Questions */}
      {sections.map((section) => (
        <div key={section.name} className="mb-5">
          <div className="font-semibold text-sm text-gray-700 bg-gray-100 p-2 rounded mb-3">
            {section.name} <span className="text-xs text-gray-500">({section.count} Questions)</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: section.count }, (_, i) => {
              const questionNumber = section.startIndex + i;
              const status = getQuestionStatus(questionNumber);
              return (
                <button
                  key={questionNumber}
                  onClick={() => onQuestionClick(questionNumber)}
                  className={`w-9 h-9 rounded text-sm font-medium transition-all ${getStatusColor(status)}`}
                  title={`Question ${questionNumber + 1}`}
                >
                  {questionNumber + 1}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionPalette;