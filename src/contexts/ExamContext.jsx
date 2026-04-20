// src/contexts/ExamContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import questionsData from "../data/questions.json";
import settingsData from "../data/settings.json";

const ExamContext = createContext();

export const useExam = () => useContext(ExamContext);

export const ExamProvider = ({ children }) => {
  const [questions, setQuestions] = useState(questionsData.questions);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [examSettings, setExamSettings] = useState(settingsData);
  const [timeLeft, setTimeLeft] = useState(settingsData.duration * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const savedAnswers = localStorage.getItem("exam_answers");
    const savedMarked = localStorage.getItem("exam_marked");
    const savedTime = localStorage.getItem("exam_time_left");

    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
    if (savedMarked) setMarkedForReview(JSON.parse(savedMarked));
    if (savedTime && !isSubmitted) setTimeLeft(parseInt(savedTime));
  }, []);

  useEffect(() => {
    if (!isSubmitted) {
      localStorage.setItem("exam_answers", JSON.stringify(answers));
      localStorage.setItem("exam_marked", JSON.stringify(markedForReview));
      localStorage.setItem("exam_time_left", timeLeft.toString());
    }
  }, [answers, markedForReview, timeLeft, isSubmitted]);

  const saveAnswer = (questionId, answer) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: answer };
      return newAnswers;
    });
  };

  const toggleMarkForReview = (questionId) => {
    setMarkedForReview((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const submitExam = () => {
    setIsSubmitted(true);
    localStorage.removeItem("exam_answers");
    localStorage.removeItem("exam_marked");
    localStorage.removeItem("exam_time_left");
  };

  const resetExam = () => {
    setAnswers({});
    setMarkedForReview({});
    setTimeLeft(examSettings.duration * 60);
    setIsSubmitted(false);
  };

  const updateQuestion = (updatedQuestion) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
    );
  };

  const addQuestion = (newQuestion) => {
    setQuestions((prev) => [...prev, { ...newQuestion, id: Date.now() }]);
  };

  const deleteQuestion = (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const updateSettings = (newSettings) => {
    setExamSettings(newSettings);
    setTimeLeft(newSettings.duration * 60);
  };

  return (
    <ExamContext.Provider
      value={{
        questions,
        answers,
        markedForReview,
        examSettings,
        timeLeft,
        setTimeLeft,
        isSubmitted,
        saveAnswer,
        toggleMarkForReview,
        submitExam,
        resetExam,
        updateQuestion,
        addQuestion,
        deleteQuestion,
        updateSettings,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};