
import React, { useState, useEffect } from "react";
import { getRelaxationSteps } from "@/utils/timerUtils";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { TimerState } from "@/types";
import { formatTime } from "@/utils/timerUtils";
import { Button } from "./ui/button";
import { AspectRatio } from "./ui/aspect-ratio";
import Timer from "./Timer";

interface RelaxGuideProps {
  onReturn: () => void;
  timerState: TimerState;
  onStart?: () => void;
  onPause?: () => void;
}

const RelaxGuide: React.FC<RelaxGuideProps> = ({ 
  onReturn, 
  timerState,
  onStart,
  onPause
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const relaxSteps = getRelaxationSteps();
  
  // Log when RelaxGuide renders for debugging
  useEffect(() => {
    console.log("RelaxGuide rendering with timer state:", {
      timeRemaining: timerState.timeRemaining,
      isRunning: timerState.isRunning
    });
  }, [timerState]);
  
  const goToNextStep = () => {
    if (currentStep < relaxSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <div className="break-card p-4 w-full max-w-md mx-auto animate-scale-in">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center mb-2">
          <Dumbbell className="text-break-green mr-2" size={20} />
          <h2 className="text-xl font-bold text-dark-text">Relax & Stretch</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Take a moment to relax your mind and body with these exercises.
        </p>
        
        {/* Include Timer component here */}
        <div className="mt-4 mb-4">
          <Timer 
            timerState={timerState}
            onStart={onStart}
            onPause={onPause}
          />
        </div>
      </div>
      
      <div className="p-4 bg-white bg-opacity-60 rounded-lg shadow-sm mb-4 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {relaxSteps.length}
          </span>
          <div className="flex space-x-1">
            <button
              onClick={goToPrevStep}
              disabled={currentStep === 0}
              className={`p-1 rounded ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-break-green'}`}
              aria-label="Previous step"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToNextStep}
              disabled={currentStep === relaxSteps.length - 1}
              className={`p-1 rounded ${currentStep === relaxSteps.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-break-green'}`}
              aria-label="Next step"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="min-h-[220px]">
          <h3 className="text-lg font-semibold mb-2">{relaxSteps[currentStep].title}</h3>
          
          {/* GIF image in aspect ratio container */}
          <div className="mb-2">
            <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
              <img 
                src={relaxSteps[currentStep].image || "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=400"} 
                alt={relaxSteps[currentStep].title}
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>
          
          {/* Shorter text description */}
          <p className="text-dark-text text-sm">{relaxSteps[currentStep].shortDescription}</p>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={onReturn} 
          className="btn-secondary text-sm py-2 px-4"
        >
          Return to Timer <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default RelaxGuide;
