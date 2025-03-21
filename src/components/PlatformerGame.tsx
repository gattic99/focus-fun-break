
import React, { useRef, useEffect, useState } from 'react';
import { TimerState } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronRight, RefreshCw } from "lucide-react";
import Timer from "./Timer";
import { usePhaserGame } from '@/hooks/usePhaserGame';
import LoadingState from './game/LoadingState';
import GameControls from './GameControls';

interface PlatformerGameProps {
  onReturn: () => void;
  timerState: TimerState;
  onStart?: () => void;
  onPause?: () => void;
}

const PlatformerGame: React.FC<PlatformerGameProps> = ({ 
  onReturn, 
  timerState,
  onStart,
  onPause
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { gameInitialized, errorState, retryInitialization } = usePhaserGame(gameContainerRef);
  const [isVisible, setIsVisible] = useState(false);
  
  // Log component mounting
  useEffect(() => {
    console.log("PlatformerGame component mounted");
    
    // Make the container visible after a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => {
      console.log("PlatformerGame component unmounted");
      clearTimeout(timer);
    };
  }, []);
  
  // Track when the game is initialized or has an error
  useEffect(() => {
    console.log("Game state changed:", { gameInitialized, errorState });
  }, [gameInitialized, errorState]);
  
  const handleRetry = () => {
    console.log("Manual retry requested");
    retryInitialization();
  };
  
  // Event handlers for mobile controls
  const createKeyEvent = (key: string, isDown: boolean) => {
    const eventType = isDown ? 'keydown' : 'keyup';
    const event = new KeyboardEvent(eventType, { key });
    document.dispatchEvent(event);
  };
  
  const handleLeftPress = () => createKeyEvent('ArrowLeft', true);
  const handleLeftRelease = () => createKeyEvent('ArrowLeft', false);
  const handleRightPress = () => createKeyEvent('ArrowRight', true);
  const handleRightRelease = () => createKeyEvent('ArrowRight', false);
  const handleJumpPress = () => createKeyEvent('ArrowUp', true);
  const handleJumpRelease = () => createKeyEvent('ArrowUp', false);

  return (
    <div className="break-card p-4 w-full max-w-[800px] mx-auto animate-scale-in bg-white bg-opacity-90 rounded-xl shadow-lg">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-dark-text">Platformer Game</h2>
        <p className="text-sm text-muted-foreground">
          Collect all the stars to win! Use arrow keys or touch controls.
        </p>
      </div>

      <div 
        id="phaser-game" 
        ref={gameContainerRef} 
        className={`mb-4 w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden relative transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <LoadingState 
          isLoading={!gameInitialized && !errorState} 
          error={errorState} 
          onRetry={handleRetry}
        />
      </div>
      
      <div className="flex items-center justify-center mb-4 gap-2">
        {gameInitialized ? (
          <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
            Game Loaded Successfully
          </div>
        ) : errorState ? (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRetry}
            className="text-xs"
          >
            <RefreshCw size={14} className="mr-1" /> Try Again
          </Button>
        ) : (
          <div className="text-xs text-gray-500">
            Game loading...
          </div>
        )}
      </div>
      
      {gameInitialized && (
        <GameControls 
          onLeftPress={handleLeftPress}
          onLeftRelease={handleLeftRelease}
          onRightPress={handleRightPress}
          onRightRelease={handleRightRelease}
          onJumpPress={handleJumpPress}
          onJumpRelease={handleJumpRelease}
        />
      )}
      
      <div className="mb-4 mt-4">
        {timerState && (
          <Timer 
            timerState={timerState}
            onStart={onStart}
            onPause={onPause}
            totalDuration={timerState.mode === 'break' ? 
              (timerState.timeRemaining > 0 ? timerState.timeRemaining : 300) : 0}
          />
        )}
      </div>

      <div className="flex justify-center">
        <Button onClick={onReturn} className="btn-secondary text-sm py-2 px-4">
          Return to Timer <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default PlatformerGame;
