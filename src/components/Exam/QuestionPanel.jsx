// src/components/Exam/QuestionPanel.jsx
import React from 'react';

const QuestionPanel = ({ question, currentAnswer, onAnswer }) => {
  if (!question) return null;

  // Convert A/B/C/D to index 0/1/2/3 for storage
  const optionToIndex = (optionLetter) => {
    const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    return map[optionLetter];
  };

  const indexToOption = (index) => {
    const map = { 0: 'A', 1: 'B', 2: 'C', 3: 'D' };
    return map[index];
  };

  const handleAnswer = (index) => {
    const answerLetter = indexToOption(index);
    onAnswer(answerLetter);
  };

  const selectedIndex = currentAnswer ? optionToIndex(currentAnswer) : -1;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <span className="font-bold text-indigo-600 text-lg">Q{question.id}.</span>
          <p className="text-gray-800 text-lg">{question.text}</p>
        </div>
      </div>

      <div className="space-y-3">
        {question.options.map((option, idx) => (
          <label
            key={idx}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
              selectedIndex === idx
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name={`question_${question.id}`}
              value={idx}
              checked={selectedIndex === idx}
              onChange={() => handleAnswer(idx)}
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-3 text-gray-700">
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + idx)}.
              </span>
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionPanel;