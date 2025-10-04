import { useState, useEffect, useRef } from 'react';

interface UsePomodoroProps {
  initialTime?: number; // en segundos
  onComplete?: () => void;
}

export function usePomodoro({ 
  initialTime = 25 * 60, 
  onComplete 
}: UsePomodoroProps = {}) {
  const [tiempoRestante, setTiempoRestante] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && !isPaused && tiempoRestante > 0) {
      intervalRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsPaused(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, tiempoRestante, onComplete]);

  const iniciar = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pausar = () => {
    setIsPaused(true);
  };

  const reanudar = () => {
    setIsPaused(false);
  };

  const resetear = () => {
    setTiempoRestante(initialTime);
    setIsRunning(false);
    setIsPaused(false);
  };

  const setTiempo = (nuevoTiempo: number) => {
    setTiempoRestante(nuevoTiempo);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: remainingSeconds.toString().padStart(2, '0'),
    };
  };

  const { minutes, seconds } = formatTime(tiempoRestante);

  return {
    tiempoRestante,
    isRunning,
    isPaused,
    minutes,
    seconds,
    iniciar,
    pausar,
    reanudar,
    resetear,
    setTiempo,
  };
}
