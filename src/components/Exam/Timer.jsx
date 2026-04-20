// src/components/Exam/Timer.jsx
import React, { useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

const Timer = ({ timeLeft, setTimeLeft, onTimeEnd }) => {
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, setTimeLeft, onTimeEnd]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 300; // Less than 5 minutes

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold ${
      isLowTime ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-800'
    }`}>
      <FiClock className={isLowTime ? 'text-white' : 'text-gray-600'} />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;