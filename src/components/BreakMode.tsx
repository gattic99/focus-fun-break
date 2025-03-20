
import React, { useEffect } from "react";
import Timer from "./Timer";
import { TimerState, BreakActivity } from "@/types";
import { formatTime } from "@/utils/timerUtils";
import { AlarmClock, Gamepad, Dumbbell, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

// Component forward declaration to avoid circular imports
const PlatformerGame = React.lazy(() => import("./PlatformerGame"));
const RelaxGuide = React.lazy(() => import("./RelaxGuide"));

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
  
  // Add additional logging for monitoring breakActivity changes
  useEffect(() => {
    console.log("BreakActivity changed to:", breakActivity);
  }, [breakActivity]);
  
  // Use React.Suspense to handle lazy-loaded components
  if (breakActivity === 'game') {
    return (
      <React.Suspense fallback={
        <div className="flex justify-center items-center h-80">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-focus-purple"></div>
          <p className="text-focus-purple ml-3">Loading game...</p>
        </div>
      }>
        <PlatformerGame 
          onReturn={() => onSelectActivity(null)} 
          timerState={timerState} 
          onStart={onStart} 
          onPause={onPause} 
        />
      </React.Suspense>
    );
  }
  
  if (breakActivity === 'relax') {
    return (
      <React.Suspense fallback={
        <div className="flex justify-center items-center h-80">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-focus-purple"></div>
          <p className="text-focus-purple ml-3">Loading relaxation guide...</p>
        </div>
      }>
        <RelaxGuide onReturn={() => onSelectActivity(null)} timerState={timerState} />
      </React.Suspense>
    );
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
        
        {/* Use the Timer component with the appropriate props */}
        <div className="mb-4 mt-4">
          <Timer 
            timerState={timerState} 
            onStart={onStart}
            onPause={onPause}
            onReset={onReset}
            totalDuration={breakDuration * 60}
          />
        </div>
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
