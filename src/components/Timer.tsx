
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
  
  // Always use purple regardless of mode
  const timerTextColor = 'text-focus-purple';
  
  return (
    <div className="flex flex-col items-center space-y-2 animate-fade-in">
      <div className="timer-display mb-0" style={{
        width: "140px",
        height: "140px"
      }}>
        <div className={`timer-text ${timerTextColor} text-3xl font-bold`}>
          {formatTime(timeRemaining)}
        </div>
      </div>
    </div>
  );
};

export default Timer;
