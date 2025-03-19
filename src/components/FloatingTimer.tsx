
import React from "react";
import { formatTime } from "@/utils/timerUtils";
import { TimerState } from "@/types";
import { Timer as TimerIcon, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingTimerProps {
  isOpen: boolean;
  timerState: TimerState;
  togglePopup: () => void;
}

const FloatingTimer: React.FC<FloatingTimerProps> = ({
  isOpen,
  timerState,
  togglePopup
}) => {
  const { timeRemaining, isRunning, mode, completed } = timerState;
  
  const isTimerActive = isRunning && !isOpen;
  
  return (
    <button 
      onClick={togglePopup}
      className={cn(
        "fixed bottom-6 right-6 z-[10000] shadow-lg flex items-center justify-center transition-all duration-300 rounded-full",
        isTimerActive 
          ? "bg-focus-purple hover:bg-focus-purple-dark w-auto min-w-[110px] h-14 px-4" 
          : "bg-focus-purple hover:bg-focus-purple-dark w-14 h-14"
      )}
      aria-label={isOpen ? "Close Focus Timer" : "Open Focus Timer"}
    >
      {isTimerActive ? (
        <div className="font-mono font-bold text-white text-xl tracking-wider flex items-center">
          {mode === 'break' ? 
            <Coffee size={20} className="text-white mr-2" /> : 
            <TimerIcon size={20} className="text-white mr-2" />
          }
          {formatTime(timeRemaining)}
        </div>
      ) : (
        mode === 'break' ? 
          <Coffee size={24} className="text-white" /> :
          <TimerIcon size={24} className="text-white" />
      )}
    </button>
  );
};

export default FloatingTimer;
