
import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config/phaserConfig';

export const usePhaserGame = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [gameInitialized, setGameInitialized] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    console.log("usePhaserGame hook running");
    
    // Clean up previous game instance if it exists
    if (gameInstanceRef.current) {
      console.log("Destroying previous game instance");
      gameInstanceRef.current.destroy(true);
      gameInstanceRef.current = null;
    }
    
    // Ensure the container is in the DOM
    if (!containerRef.current) {
      console.error("Game container ref is not available");
      setErrorState("Game container not available");
      return;
    }
    
    // Make sure Phaser is available
    if (typeof Phaser === 'undefined' || !window.Phaser) {
      console.error("Phaser is not defined");
      setErrorState("Game engine not available");
      return;
    }
    
    // Give the DOM time to render before initializing Phaser
    const timer = setTimeout(() => {
      try {
        console.log("Initializing Phaser game");
        
        // Create and start the game with the container reference
        const config = createGameConfig(containerRef.current);
        gameInstanceRef.current = new Phaser.Game(config);
        
        console.log("Phaser game initialized with config:", config);
        setGameInitialized(true);
      } catch (error: any) {
        console.error("Error initializing Phaser game:", error);
        setErrorState(`Failed to start game: ${error.message}`);
      }
    }, 500);

    // Clean up function to destroy the game when the component unmounts
    return () => {
      clearTimeout(timer);
      if (gameInstanceRef.current) {
        console.log("Component unmounting, destroying game");
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [containerRef]);

  return { gameInitialized, errorState };
};
