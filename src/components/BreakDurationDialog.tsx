
import React, { useState, useEffect } from "react";
import { Coffee, Minus, Plus, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface BreakDurationDialogProps {
  breakDuration: number;
  onChangeBreakDuration: (newDuration: number) => void;
  disabled?: boolean;
}

const BreakDurationDialog: React.FC<BreakDurationDialogProps> = ({
  breakDuration,
  onChangeBreakDuration,
  disabled = false
}) => {
  const [tempDuration, setTempDuration] = useState<number>(breakDuration);
  const [inputValue, setInputValue] = useState<string>(breakDuration.toString());
  const [isOpen, setIsOpen] = useState(false);
  
  // Update local state when prop changes
  useEffect(() => {
    console.log("BreakDurationDialog - breakDuration prop updated:", breakDuration);
    setTempDuration(breakDuration);
    setInputValue(breakDuration.toString());
  }, [breakDuration]);
  
  const decreaseDuration = () => {
    if (tempDuration > 1) {
      const newValue = tempDuration - 1;
      setTempDuration(newValue);
      setInputValue(newValue.toString());
    }
  };
  
  const increaseDuration = () => {
    if (tempDuration < 15) {
      const newValue = tempDuration + 1;
      setTempDuration(newValue);
      setInputValue(newValue.toString());
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // Try to parse immediately so UI updates faster
    const parsedValue = parseInt(e.target.value);
    if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 15) {
      setTempDuration(parsedValue);
    }
  };
  
  const handleInputBlur = () => {
    const newValue = parseInt(inputValue);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= 15) {
      setTempDuration(newValue);
    } else {
      // Reset to last valid value if input is invalid
      setInputValue(tempDuration.toString());
      toast.error("Please enter a number between 1 and 15 minutes");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };
  
  const handleSave = () => {
    // Make sure the value is valid before passing to parent
    const valueToSave = Math.min(Math.max(1, Number(tempDuration)), 15);
    
    console.log(`Saving break duration: ${valueToSave} minutes`);
    onChangeBreakDuration(valueToSave);
    setIsOpen(false);
    
    // Show confirmation to user
    toast.success(`Break duration set to ${valueToSave} minute${valueToSave !== 1 ? 's' : ''}`);
  };
  
  const handleCancel = () => {
    setTempDuration(breakDuration);
    setInputValue(breakDuration.toString());
    setIsOpen(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTempDuration(breakDuration);
      setInputValue(breakDuration.toString());
    }
  };

  return (
    <div className="focus-card p-4 w-full max-w-sm mx-auto mt-6 bg-gray-100 bg-opacity-80 backdrop-blur-md rounded-xl border border-focus-purple border-opacity-20 shadow-md transition-all duration-300 hover:shadow-lg">
      <Collapsible open={isOpen} onOpenChange={handleOpenChange} className="w-full rounded-xl overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button variant="outline" disabled={disabled} className="w-full px-3 py-2 flex items-center justify-between bg-transparent hover:bg-gray-200 text-gray-700 border-0 transition-all duration-200 text-xs rounded-none">
            <div className="flex items-center">
              <Coffee className="mr-1 text-focus-purple" size={15} />
              <span className="font-medium">Break duration</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1">{breakDuration} min</span>
              {isOpen ? <ChevronUp className="text-focus-purple" size={14} /> : <ChevronDown className="text-focus-purple" size={14} />}
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="bg-transparent border-0 rounded-b-xl">
          <div className="p-3">
            <p className="text-muted-foreground text-center text-xs mb-3">
              The break will start automatically after the focus timer ends.
            </p>
            
            <div className="flex items-center justify-center gap-3 mb-3">
              <button onClick={decreaseDuration} disabled={tempDuration <= 1} className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition-colors">
                <Minus size={16} />
              </button>
              
              <div className="flex items-baseline">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  className="w-12 h-12 p-0 text-4xl text-center font-bold text-focus-purple border-none bg-transparent focus:ring-0"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <span className="text-sm ml-1 text-focus-purple">min</span>
              </div>
              
              <button onClick={increaseDuration} disabled={tempDuration >= 15} className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="py-1.5 px-3 text-gray-700 border-gray-200 bg-gray-50 hover:bg-gray-200 rounded-full text-xs" onClick={handleCancel}>
                Cancel <ChevronRight size={14} className="ml-1" />
              </Button>
              <Button 
                className="py-1.5 px-3 bg-focus-purple text-white hover:bg-focus-purple-dark rounded-full text-xs" 
                onClick={handleSave}
              >
                Save <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default BreakDurationDialog;
