
import React, { useEffect } from "react";
import Timer from "./Timer";
import { TimerState, BreakActivity } from "@/types";
import { formatTime } from "@/utils/timerUtils";
import PlatformerGame from "./PlatformerGame";
import RelaxGuide from "./RelaxGuide";
import { AlarmClock, Gamepad, Dumbbell } from "lucide-react";

interface BreakModeProps {
  timerState: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSelectActivity: (activity: BreakActivity) => void;
  breakDuration: number;
  onChangeBreakDuration: (duration: number) => void;
}

const BreakMode: React.FC<BreakModeProps> = ({
  timerState,
  onStart,
  onPause,
  onReset,
  onSelectActivity,
  breakDuration,
  onChangeBreakDuration
}) => {
  const { breakActivity, timeRemaining } = timerState;
  
  // Start the timer automatically when component mounts
  useEffect(() => {
    if (!timerState.isRunning) {
      onStart();
    }
  }, []);
  
  if (breakActivity === 'game') {
    return <PlatformerGame onReturn={() => onSelectActivity(null)} timerState={timerState} />;
  }
  
  if (breakActivity === 'relax') {
    return <RelaxGuide onReturn={() => onSelectActivity(null)} timerState={timerState} />;
  }
  
  return (
    <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-xl border border-white border-opacity-20 shadow-md p-6 w-full max-w-xl mx-auto animate-scale-in">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <AlarmClock className="text-focus-purple mr-2" size={20} />
          <h2 className="text-xl font-bold text-dark-text">Break Time</h2>
          <span className="ml-2 text-sm font-medium text-focus-purple">{formatTime(timeRemaining)}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Take a moment to relax. Choose an activity below.
        </p>
      </div>
      
      <div className="mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div 
            className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg border border-white border-opacity-20 shadow-sm p-3 flex flex-col items-center animate-slide-up cursor-pointer hover:bg-gray-50 transition-colors" 
            onClick={() => onSelectActivity('game')}
          >
            <Gamepad size={22} className="mb-2 text-focus-purple" />
            <h4 className="text-sm font-medium">Play Game</h4>
          </div>
          
          <div 
            className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg border border-white border-opacity-20 shadow-sm p-3 flex flex-col items-center animate-slide-up cursor-pointer hover:bg-gray-50 transition-colors" 
            style={{ animationDelay: '0.1s' }}
            onClick={() => onSelectActivity('relax')}
          >
            <Dumbbell size={22} className="mb-2 text-focus-purple" />
            <h4 className="text-sm font-medium">Relax & Stretch</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakMode;
