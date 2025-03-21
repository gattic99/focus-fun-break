
import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config/phaserConfig';

export const usePhaserGame = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [gameInitialized, setGameInitialized] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const initAttempts = useRef(0);

  useEffect(() => {
    console.log("usePhaserGame hook running, containerRef:", containerRef.current);
    
    // Clean up previous game instance if it exists
    if (gameInstanceRef.current) {
      console.log("Destroying previous game instance");
      try {
        gameInstanceRef.current.destroy(true);
      } catch (e) {
        console.error("Error destroying previous game instance:", e);
      }
      gameInstanceRef.current = null;
    }
    
    // Reset states
    setGameInitialized(false);
    setErrorState(null);
    
    // Ensure the container is in the DOM
    if (!containerRef.current) {
      console.error("Game container ref is not available");
      setErrorState("Game container not available");
      return;
    }
    
    console.log("Container dimensions:", {
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
      clientWidth: containerRef.current.clientWidth,
      clientHeight: containerRef.current.clientHeight
    });
    
    // Check if Phaser is available globally
    const isPhaserAvailable = typeof window !== 'undefined' && 
                             window.Phaser !== undefined && 
                             typeof window.Phaser === 'object';
    
    console.log("Phaser available globally:", isPhaserAvailable);
    
    // If Phaser isn't available globally, check if it's available as an import
    if (!isPhaserAvailable && typeof Phaser === 'undefined') {
      console.error("Phaser is not defined");
      setErrorState("Game engine not available - Phaser not defined");
      return;
    }
    
    // Increment the initialization attempt counter
    initAttempts.current += 1;
    
    // Give the DOM time to render before initializing Phaser
    const timer = setTimeout(() => {
      try {
        console.log(`Initializing Phaser game (attempt ${initAttempts.current})`);
        
        // Create the container element is absolutely positioned and visible
        containerRef.current.style.position = 'relative';
        containerRef.current.style.visibility = 'visible';
        containerRef.current.style.zIndex = '1';
        
        // Create and start the game with the container reference
        const config = createGameConfig(containerRef.current);
        console.log("Using config:", config);
        
        // Initialize the Phaser game instance
        gameInstanceRef.current = new Phaser.Game(config);
        
        // Add a listener to check if the game actually initializes
        if (gameInstanceRef.current) {
          console.log("Phaser game created, waiting for it to initialize...");
          
          // Set a timeout to check if the game initialized successfully
          const successCheckTimer = setTimeout(() => {
            if (gameInstanceRef.current && 
                gameInstanceRef.current.isBooted && 
                gameInstanceRef.current.scene.scenes.length > 0) {
              console.log("Phaser game initialized successfully!");
              setGameInitialized(true);
            } else {
              console.error("Phaser game created but failed to initialize properly");
              setErrorState("Game failed to initialize properly");
              
              // Try to clean up the failed instance
              if (gameInstanceRef.current) {
                try {
                  gameInstanceRef.current.destroy(true);
                } catch (e) {
                  console.error("Error destroying failed game instance:", e);
                }
                gameInstanceRef.current = null;
              }
            }
          }, 2000); // Give it 2 seconds to initialize
          
          return () => clearTimeout(successCheckTimer);
        } else {
          setErrorState("Failed to create game instance");
        }
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
        try {
          gameInstanceRef.current.destroy(true);
        } catch (e) {
          console.error("Error destroying game on unmount:", e);
        }
        gameInstanceRef.current = null;
      }
    };
  }, [containerRef, initAttempts.current]);

  // Provide a retry function the component can call
  const retryInitialization = () => {
    console.log("Manually retrying game initialization");
    initAttempts.current += 1;
    
    // Clean up previous instance if it exists
    if (gameInstanceRef.current) {
      try {
        gameInstanceRef.current.destroy(true);
      } catch (e) {
        console.error("Error destroying game during retry:", e);
      }
      gameInstanceRef.current = null;
    }
    
    // Reset states
    setGameInitialized(false);
    setErrorState(null);
  };

  return { gameInitialized, errorState, retryInitialization };
};
