
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
  
  // Log when break mode renders to help with debugging
  useEffect(() => {
    console.log("BreakMode rendering with state:", {
      breakActivity,
      isRunning,
      timeRemaining
    });
  }, [breakActivity, isRunning, timeRemaining]);
  
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
    <div className="glass-panel p-6 w-full animate-scale-in">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center mb-2">
          <AlarmClock className="text-focus-purple mr-2" size={20} />
          <h2 className="text-xl font-bold text-dark-text">Break Time!</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Take a moment to relax. <br />Choose an activity from the options below.
        </p>
        
        {/* Use the Timer component with the appropriate props */}
        <div className="mt-6 mb-6">
          <Timer 
            timerState={timerState} 
            totalDuration={breakDuration * 60}
          />
          <div className="text-focus-purple text-xl font-bold mt-2">
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Button 
          onClick={handleStartOrPause} 
          className="w-full bg-focus-purple hover:bg-focus-purple-dark text-white font-semibold py-2 rounded-full text-sm mb-4"
        >
          {isRunning ? "Pause" : "Start"} <ChevronRight size={16} className="ml-1" />
        </Button>
        
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
  
  function handleStartOrPause() {
    if (timerState.isRunning) {
      onPause();
    } else {
      onStart();
    }
  }
};

export default BreakMode;
