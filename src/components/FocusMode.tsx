import React, { useState } from "react";
import Timer from "./Timer";
import { TimerState } from "@/types";
import { minutesToSeconds } from "@/utils/timerUtils";
import { Clock, Minus, Plus, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
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
  const [breakInputValue, setBreakInputValue] = useState(breakDuration.toString());
  const [isBreakOpen, setIsBreakOpen] = useState(false);
  const decreaseFocusDuration = () => {
    if (focusDuration > 1) {
      const newDuration = focusDuration - 1;
      onChangeFocusDuration(newDuration);
      setInputValue(newDuration.toString());
    }
  };
  const increaseFocusDuration = () => {
    if (focusDuration < 120) {
      // Changed from 60 to 120
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
      // Changed from 60 to 120
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
  const decreaseBreakDuration = () => {
    if (breakDuration > 1) {
      const newDuration = breakDuration - 1;
      onChangeBreakDuration(newDuration);
      setBreakInputValue(newDuration.toString());
    }
  };
  const increaseBreakDuration = () => {
    if (breakDuration < 15) {
      const newDuration = breakDuration + 1;
      onChangeBreakDuration(newDuration);
      setBreakInputValue(newDuration.toString());
    }
  };
  const handleBreakInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBreakInputValue(e.target.value);
  };
  const handleBreakInputBlur = () => {
    const newValue = parseInt(breakInputValue);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= 15) {
      onChangeBreakDuration(newValue);
    } else {
      setBreakInputValue(breakDuration.toString());
    }
  };
  const handleBreakKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

      <div className="focus-card p-4 w-full mt-6 animate-scale-in bg-gray-100 bg-opacity-80 backdrop-blur-md rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
        <Collapsible open={isBreakOpen} onOpenChange={setIsBreakOpen} className="w-full">
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
            <div className="flex items-center">
              <Clock className="text-focus-purple mr-2" size={18} />
              <h2 className="text-lg text-dark-text font-semibold">Break Duration</h2>
            </div>
            <div className="flex items-center">
              <span className="text-sm mr-2 text-dark-text">{breakDuration} min</span>
              {isBreakOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-2 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="text-xs text-muted-foreground mb-4">The maximum break is 15 minutes, starting automatically when focus time ends.</p>
            
            <div className="mt-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" onClick={decreaseBreakDuration} disabled={breakDuration <= 1 || timerState.isRunning} className="rounded-full bg-muted/30 hover:bg-muted/50 h-7 w-7">
                  <Minus size={14} />
                </Button>
                
                <div className="flex items-baseline">
                  <div className="relative w-12 text-center">
                    <Input type="text" value={breakInputValue} onChange={handleBreakInputChange} onBlur={handleBreakInputBlur} onKeyDown={handleBreakKeyDown} disabled={timerState.isRunning} className="w-full text-center font-bold text-focus-purple text-base px-0 py-0.5 border-none focus:ring-0 focus:outline-none h-7" />
                    <span className="text-xs ml-0.5 text-focus-purple">min</span>
                  </div>
                </div>
                
                <Button variant="outline" size="icon" onClick={increaseBreakDuration} disabled={breakDuration >= 15 || timerState.isRunning} className="rounded-full bg-muted/30 hover:bg-muted/50 h-7 w-7">
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>;
};
export default FocusMode;