
import React, { useRef } from 'react';
import { TimerState } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Timer from "./Timer";
import { usePhaserGame } from '@/hooks/usePhaserGame';
import LoadingState from './game/LoadingState';

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
  const { gameInitialized, errorState } = usePhaserGame(gameContainerRef);

  return (
    <div className="break-card p-4 w-full max-w-[800px] mx-auto animate-scale-in bg-white bg-opacity-90 rounded-xl shadow-lg">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-dark-text">Platformer Game</h2>
        <p className="text-sm text-muted-foreground">
          Enjoy a quick game during your break!
        </p>
      </div>

      <div 
        id="phaser-game" 
        ref={gameContainerRef} 
        className="mb-4 w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden"
      >
        <LoadingState 
          isLoading={!gameInitialized && !errorState} 
          error={errorState} 
        />
      </div>
      
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
