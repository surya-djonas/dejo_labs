"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  remainingTime: number | null;
  isPaused: boolean;
  className?: string;
}

export function QuizTimer({ remainingTime, isPaused, className }: QuizTimerProps) {
  const [displayTime, setDisplayTime] = useState(remainingTime);
  
  useEffect(() => {
    setDisplayTime(remainingTime);
  }, [remainingTime]);
  
  if (remainingTime === null) {
    return (
      <div className={cn("quiz-timer", className)}>
        <span className="text-muted-foreground">Waiting...</span>
      </div>
    );
  }
  
  const getTimerClass = () => {
    if (remainingTime <= 10) return "danger";
    if (remainingTime <= 30) return "warning";
    return "";
  };
  
  return (
    <div className={cn("quiz-timer", getTimerClass(), className)}>
      {isPaused && <span className="text-yellow-500 text-sm mr-2">PAUSED</span>}
      <span>{formatDuration(displayTime || 0)}</span>
    </div>
  );
}
