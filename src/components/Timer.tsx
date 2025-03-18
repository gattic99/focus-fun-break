
import React, { useEffect } from "react";
import { formatTime } from "@/utils/timerUtils";
import { TimerState } from "@/types";
import { Pause, Play, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface TimerProps {
  timerState: TimerState;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  totalDuration?: number;
}

const Timer: React.FC<TimerProps> = ({
  timerState,
  onStart,
  onPause,
  onReset,
  totalDuration
}) => {
  const {
    timeRemaining,
    mode,
    isRunning
  } = timerState;
  
  // Debug log to see if timer values are updating
  useEffect(() => {
    console.log("Timer component rendering with:", { 
      timeRemaining, 
      isRunning, 
      mode,
      totalDuration
    });
  }, [timeRemaining, isRunning, mode, totalDuration]);
  
  // Calculate the progress percentage for visual indicator
  const progressPercentage = totalDuration ? Math.min(100, Math.max(0, (timeRemaining / totalDuration) * 100)) : 0;
  
  // Always use purple regardless of mode
  const timerTextColor = 'text-focus-purple';
  
  return (
    <div className="flex flex-col items-center space-y-2 animate-fade-in">
      <div 
        className="timer-display relative mb-0 rounded-full flex items-center justify-center" 
        style={{
          width: "140px",
          height: "140px",
          background: `conic-gradient(
            rgba(124, 58, 237, ${progressPercentage * 0.01}) ${progressPercentage}%,
            rgba(124, 58, 237, 0.2) ${progressPercentage}%
          )`
        }}
      >
        <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
          <div className={`timer-text ${timerTextColor} text-3xl font-bold`}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
