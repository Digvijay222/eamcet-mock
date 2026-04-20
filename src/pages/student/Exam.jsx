// src/pages/student/Exam.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import Timer from "../../components/Exam/Timer";
import QuestionPalette from "../../components/Exam/QuestionPalette";
import QuestionPanel from "../../components/Exam/QuestionPanel";
import Button from "../../components/UI/Button";
import { FiChevronLeft, FiChevronRight, FiSend, FiFlag, FiAlertCircle } from "react-icons/fi";

const Exam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    questions, 
    answers, 
    markedForReview, 
    timeLeft, 
    setTimeLeft, 
    saveAnswer,
    toggleMarkForReview,
    submitExam, 
    isSubmitted 
  } = useExam();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSubject, setCurrentSubject] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const fullScreenCheckRef = useRef(null);

  // Sections
  const sections = useMemo(() => {
    const subjectMap = new Map();
    questions.forEach((question, index) => {
      if (!subjectMap.has(question.subject)) {
        subjectMap.set(question.subject, {
          name: question.subject,
          startIndex: index,
          endIndex: index,
          questions: []
        });
      }
      const section = subjectMap.get(question.subject);
      section.endIndex = index;
      section.questions.push(question);
    });
    return Array.from(subjectMap.values()).map(section => ({
      name: section.name,
      startIndex: section.startIndex,
      endIndex: section.endIndex,
      count: section.questions.length
    }));
  }, [questions]);

  useEffect(() => {
    const section = sections.find(s => 
      currentIndex >= s.startIndex && currentIndex <= s.endIndex
    );
    if (section) setCurrentSubject(section.name);
  }, [currentIndex, sections]);

  // Force Full Screen Function
  const forceFullScreen = useCallback(() => {
    if (examSubmitted) return;
    
    const elem = document.documentElement;
    const isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    
    if (!isFullScreen) {
      // Enter full screen
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log("Full screen error:", err));
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
  }, [examSubmitted]);

  // Continuous Full Screen Monitor - Runs every 50ms
  useEffect(() => {
    if (examSubmitted) return;
    
    // Initial full screen
    setTimeout(() => forceFullScreen(), 100);
    
    // Check every 50 milliseconds
    fullScreenCheckRef.current = setInterval(() => {
      if (!examSubmitted) {
        const isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (!isFullScreen) {
          forceFullScreen();
        }
      }
    }, 50);
    
    return () => {
      if (fullScreenCheckRef.current) {
        clearInterval(fullScreenCheckRef.current);
      }
    };
  }, [forceFullScreen, examSubmitted]);

  // Block ESC and other keys
  useEffect(() => {
    if (examSubmitted) return;

    const handleKeyDown = (e) => {
      // Block ESC key - Most important
      if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        
        // Show warning
        const warning = document.createElement('div');
        warning.className = 'fixed top-20 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] text-sm font-bold';
        warning.innerHTML = '🔒 ESC KEY IS DISABLED! 🔒';
        document.body.appendChild(warning);
        setTimeout(() => warning.remove(), 2000);
        
        // Force full screen immediately
        setTimeout(() => forceFullScreen(), 10);
        return false;
      }
      
      // Block F5, F11, F12
      if (e.key === 'F5' || e.key === 'F11' || e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Block Ctrl+R, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P
      if (e.ctrlKey) {
        if (e.key === 'r' || e.key === 'R' || e.key === 's' || e.key === 'S' ||
            e.key === 'p' || e.key === 'P' || e.key === 'u' || e.key === 'U') {
          e.preventDefault();
          return false;
        }
        if (e.shiftKey && (e.key === 'I' || e.key === 'i')) {
          e.preventDefault();
          return false;
        }
      }
      
      // Block Alt+Tab, Alt+F4
      if (e.altKey && (e.key === 'Tab' || e.key === 'F4')) {
        e.preventDefault();
        return false;
      }
      
      // Block Windows key
      if (e.key === 'Meta' || e.key === 'Win') {
        e.preventDefault();
        return false;
      }
    };

    // Block copy-paste
    const blockCopyPaste = (e) => {
      e.preventDefault();
      const warning = document.createElement('div');
      warning.className = 'fixed top-20 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] text-sm';
      warning.innerHTML = '📋 Copy-Paste is disabled!';
      document.body.appendChild(warning);
      setTimeout(() => warning.remove(), 1500);
      return false;
    };

    // Block right-click
    const blockRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    // Tab switching warning
    const handleVisibilityChange = () => {
      if (document.hidden && !examSubmitted) {
        setWarningCount(prev => {
          const newCount = prev + 1;
          const warning = document.createElement('div');
          warning.className = 'fixed top-20 right-4 bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] text-sm';
          warning.innerHTML = `⚠️ Tab switching is not allowed! Warning ${newCount}/3 ⚠️`;
          document.body.appendChild(warning);
          setTimeout(() => warning.remove(), 2000);
          
          if (newCount >= 3) {
            alert("You have violated exam rules 3 times! Your exam will be submitted.");
            handleSubmitExam();
          }
          return newCount;
        });
      }
    };

    // Full screen change event - Re-enter if exited
    const handleFullScreenChange = () => {
      if (!examSubmitted) {
        const isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (!isFullScreen) {
          forceFullScreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', blockCopyPaste);
    document.addEventListener('cut', blockCopyPaste);
    document.addEventListener('paste', blockCopyPaste);
    document.addEventListener('contextmenu', blockRightClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', blockCopyPaste);
      document.removeEventListener('cut', blockCopyPaste);
      document.removeEventListener('paste', blockCopyPaste);
      document.removeEventListener('contextmenu', blockRightClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
    };
  }, [forceFullScreen, examSubmitted]);

  // Block browser back button
  useEffect(() => {
    if (examSubmitted) return;
    
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
      const warning = document.createElement('div');
      warning.className = 'fixed top-20 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] text-sm';
      warning.innerHTML = '🔙 Back button is disabled during exam!';
      document.body.appendChild(warning);
      setTimeout(() => warning.remove(), 2000);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [examSubmitted]);

  // Warn before refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!examSubmitted) {
        e.preventDefault();
        e.returnValue = '⚠️ Exam in progress! If you refresh, your answers will be lost! ⚠️';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examSubmitted]);

  useEffect(() => {
    if (isSubmitted) {
      setExamSubmitted(true);
      if (fullScreenCheckRef.current) {
        clearInterval(fullScreenCheckRef.current);
      }
      navigate("/result");
    }
  }, [isSubmitted, navigate]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id];
  const isMarked = markedForReview[currentQuestion?.id];

  const handleAnswer = (answer) => {
    if (currentQuestion) saveAnswer(currentQuestion.id, answer);
  };

  const handleMarkForReview = () => {
    if (currentQuestion) toggleMarkForReview(currentQuestion.id);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo({ top: 0 });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo({ top: 0 });
    }
  };

  const handleSectionChange = (sectionName) => {
    const section = sections.find(s => s.name === sectionName);
    if (section) setCurrentIndex(section.startIndex);
  };

  const handleSubmitExam = () => {
    setExamSubmitted(true);
    submitExam();
    navigate("/result");
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading questions...</div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.keys(markedForReview).filter(id => markedForReview[id]).length;

  const getSectionProgress = (sectionName) => {
    const section = sections.find(s => s.name === sectionName);
    if (!section) return { answered: 0, total: 0 };
    let answered = 0;
    for (let i = section.startIndex; i <= section.endIndex; i++) {
      if (answers[questions[i]?.id]) answered++;
    }
    return { answered, total: section.count };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Warning Counter */}
      {warningCount > 0 && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-1 text-sm z-50 font-bold">
          ⚠️ WARNING: {warningCount}/3 - Tab switching is not allowed ⚠️
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex px-4 overflow-x-auto">
            {sections.map((section) => {
              const progress = getSectionProgress(section.name);
              const isActive = currentSubject === section.name;
              return (
                <button
                  key={section.name}
                  onClick={() => handleSectionChange(section.name)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    isActive ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600"
                  }`}
                >
                  {section.name} ({progress.answered}/{section.count})
                  {progress.answered === section.count && " ✓"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center px-4 py-3">
          <div>
            <div className="text-sm font-medium">
              {currentSubject} - Q{currentIndex + 1}/{questions.length}
            </div>
            <div className="flex gap-4 mt-1 text-xs text-gray-500">
              <span>✓ Answered: {answeredCount}</span>
              <span>🔖 Marked: {markedCount}</span>
              <span>⏳ Remaining: {questions.length - answeredCount}</span>
            </div>
          </div>
          <Timer timeLeft={timeLeft} setTimeLeft={setTimeLeft} onTimeEnd={handleSubmitExam} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <QuestionPanel
            question={currentQuestion}
            currentAnswer={currentAnswer}
            onAnswer={handleAnswer}
          />
          
          <div className="flex justify-between gap-3 mt-6">
            <Button variant="secondary" onClick={handlePrevious} disabled={currentIndex === 0}>
              ← Previous
            </Button>
            
            <div className="flex gap-3">
              <Button variant={isMarked ? "danger" : "outline"} onClick={handleMarkForReview}>
                {isMarked ? "★ Unmark Review" : "☆ Mark for Review"}
              </Button>
              
              {currentIndex === questions.length - 1 ? (
                <Button variant="danger" onClick={() => setShowSubmitModal(true)}>
                  ✓ Submit Exam
                </Button>
              ) : (
                <Button variant="primary" onClick={handleNext}>
                  Next →
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-80 bg-white border-t lg:border-t-0 lg:border-l p-4">
          <QuestionPalette
            totalQuestions={questions.length}
            answers={answers}
            markedForReview={markedForReview}
            currentIndex={currentIndex}
            sections={sections}
            onQuestionClick={(index) => {
              setCurrentIndex(index);
              window.scrollTo({ top: 0 });
            }}
          />
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && !examSubmitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-center mb-4">Submit Exam?</h3>
            <p className="text-center mb-4">
              You have answered {answeredCount} out of {questions.length} questions.
            </p>
            <p className="text-red-600 text-center text-sm mb-4 font-bold">
              ⚠️ Once submitted, you cannot go back! ⚠️
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleSubmitExam}>Yes, Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;