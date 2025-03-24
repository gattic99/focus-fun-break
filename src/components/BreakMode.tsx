import React, { useEffect } from "react";
import Timer from "./Timer";
import { TimerState, BreakActivity } from "@/types";
import { formatTime } from "@/utils/timerUtils";
import PlatformerGame from "./PlatformerGame";
import RelaxGuide from "./RelaxGuide";
import { AlarmClock, Gamepad, Dumbbell, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

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
  const { breakActivity, timeRemaining, isRunning } = timerState;
  
  // Display the timer at the top of the break mode
  const displayTimer = () => (
    <div className="mb-4">
      <Timer timerState={timerState} />
      <div className="flex justify-center gap-4 mt-2">
        <Button variant="outline" onClick={onReset} disabled={!isRunning} className="border-gray-300 text-gray-700 font-semibold px-6 py-1.5 rounded-full text-sm h-9">
          Reset <ChevronRight size={16} className="ml-1" />
        </Button>
        
        <Button onClick={isRunning ? onPause : onStart} className="bg-focus-purple hover:bg-focus-purple-dark text-white font-semibold px-6 py-1.5 rounded-full text-sm h-9">
          {isRunning ? "Pause" : "Start"} <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
  
  if (breakActivity === 'game') {
    return <PlatformerGame 
      onReturn={() => onSelectActivity(null)} 
      timerState={timerState} 
      onStart={onStart} 
      onPause={onPause} 
    />;
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
        
        {/* Display the timer in break mode */}
        {displayTimer()}
      </div>
      
      <div className="mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div 
            className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg border border-white border-opacity-20 shadow-sm p-3 flex flex-col items-center animate-slide-up cursor-pointer hover:bg-gray-50 transition-colors" 
            onClick={() => onSelectActivity('game')}
          >
            <Gamepad size={22} className="mb-2 text-focus-purple" />
            <h4 className="text-sm font-medium">Play Game <ChevronRight size={14} className="inline-block ml-1" /></h4>
          </div>
          
          <div 
            className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg border border-white border-opacity-20 shadow-sm p-3 flex flex-col items-center animate-slide-up cursor-pointer hover:bg-gray-50 transition-colors" 
            style={{ animationDelay: '0.1s' }}
            onClick={() => onSelectActivity('relax')}
          >
            <Dumbbell size={22} className="mb-2 text-focus-purple" />
            <h4 className="text-sm font-medium">Relax & Stretch <ChevronRight size={14} className="inline-block ml-1" /></h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakMode;
