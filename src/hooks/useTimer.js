// src/hooks/useTimer.js
import { useState, useEffect, useRef } from "react";

export const useTimer = (initialTime, onTimeEnd) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      onTimeEnd?.();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, onTimeEnd]);

  const resetTimer = (newTime) => {
    setTimeLeft(newTime);
  };

  return { timeLeft, resetTimer };
};