
import React, { useEffect } from "react";
import { formatTime } from "@/utils/timerUtils";
import { TimerState } from "@/types";

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
  
  return (
    <div className="flex flex-col items-center space-y-2 animate-fade-in">
      <div 
        className="timer-display relative mb-4 rounded-full flex items-center justify-center" 
        style={{
          width: "180px",
          height: "180px",
          background: `conic-gradient(
            #9b87f5 ${progressPercentage}%,
            rgba(155, 135, 245, 0.2) ${progressPercentage}%
          )`
        }}
      >
        <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
          <div className="text-focus-purple text-4xl font-bold">
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
