// src/utils/validators.js
export const validateStudentId = (id) => {
  return /^[0-9]{10}$/.test(id);
};

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};

export const calculateScore = (questions, answers) => {
  let correct = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) correct++;
  });
  return {
    correct,
    incorrect: Object.keys(answers).length - correct,
    unanswered: questions.length - Object.keys(answers).length,
    percentage: (correct / questions.length) * 100,
  };
};