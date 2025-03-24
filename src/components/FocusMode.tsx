import React, { useState, useEffect } from "react";
import Timer from "./Timer";
import { TimerState } from "@/types";
import { minutesToSeconds } from "@/utils/timerUtils";
import { Clock, Minus, Plus, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import BreakDurationDialog from "./BreakDurationDialog";

interface FocusModeProps {
  timerState: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  focusDuration: number;
  breakDuration: number;
  onChangeFocusDuration: (duration: number) => void;
  onChangeBreakDuration: (duration: number) => void;
}

const FocusMode: React.FC<FocusModeProps> = ({
  timerState,
  onStart,
  onPause,
  onReset,
  focusDuration,
  breakDuration,
  onChangeFocusDuration,
  onChangeBreakDuration
}) => {
  const totalDuration = minutesToSeconds(focusDuration);
  const [inputValue, setInputValue] = useState(focusDuration.toString());
  const [isBreakOpen, setIsBreakOpen] = useState(false);
  
  useEffect(() => {
    setInputValue(focusDuration.toString());
  }, [focusDuration]);

  const decreaseFocusDuration = () => {
    if (focusDuration > 1) {
      const newDuration = focusDuration - 1;
      onChangeFocusDuration(newDuration);
      setInputValue(newDuration.toString());
    }
  };
  
  const increaseFocusDuration = () => {
    if (focusDuration < 120) {
      const newDuration = focusDuration + 1;
      onChangeFocusDuration(newDuration);
      setInputValue(newDuration.toString());
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputBlur = () => {
    const newValue = parseInt(inputValue);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= 120) {
      onChangeFocusDuration(newValue);
    } else {
      setInputValue(focusDuration.toString());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };
  
  return <>
      <div className="focus-card p-4 w-full animate-scale-in bg-gray-100 bg-opacity-80 backdrop-blur-md rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
        <div className="text-center mb-2">
          <div className="flex items-center justify-left">
            <Clock className="text-focus-purple mr-2" size={18} />
            <h2 className="text-lg text-dark-text font-semibold">Focus Timer</h2>
          </div>
          <p className="text-xs text-muted-foreground text-left">The maximum focus time is 120 minutes for optimal workflow without exhaustion.</p>
        </div>
        
        <div className="relative">
          <Timer timerState={timerState} totalDuration={totalDuration} />
          
          <div className="mt-0 text-center">
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" onClick={decreaseFocusDuration} disabled={focusDuration <= 1 || timerState.isRunning} className="rounded-full bg-muted/30 hover:bg-muted/50 h-7 w-7">
                <Minus size={14} />
              </Button>
              
              <div className="flex items-baseline">
                <div className="relative w-12 text-center">
                  <Input type="text" value={inputValue} onChange={handleInputChange} onBlur={handleInputBlur} onKeyDown={handleKeyDown} disabled={timerState.isRunning} className="w-full text-center font-bold text-focus-purple text-base px-0 py-0.5 border-none focus:ring-0 focus:outline-none h-7" />
                  <span className="text-xs ml-0.5 text-focus-purple">min</span>
                </div>
              </div>
              
              <Button variant="outline" size="icon" onClick={increaseFocusDuration} disabled={focusDuration >= 120 || timerState.isRunning} className="rounded-full bg-muted/30 hover:bg-muted/50 h-7 w-7">
                <Plus size={14} />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-2 mb-2">
          <Button variant="outline" onClick={onReset} disabled={!timerState.isRunning} className="border-gray-300 text-gray-700 font-semibold px-6 py-1.5 rounded-full text-sm h-9">
            Reset <ChevronRight size={16} className="ml-1" />
          </Button>
          
          <Button onClick={timerState.isRunning ? onPause : onStart} className="bg-focus-purple hover:bg-focus-purple-dark text-white font-semibold px-6 py-1.5 rounded-full text-sm h-9">
            {timerState.isRunning ? "Pause" : "Start"} <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>

      <BreakDurationDialog 
        breakDuration={breakDuration}
        onChangeBreakDuration={onChangeBreakDuration}
        disabled={timerState.isRunning}
      />
    </>;
};

export default FocusMode;
