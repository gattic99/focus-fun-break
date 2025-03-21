
import React, { useEffect, useRef, useState } from 'react';
import { TimerState } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Timer from "./Timer";
import { toast } from "sonner";

interface PlatformerGameProps {
  onReturn: () => void;
  timerState: TimerState;
  onStart?: () => void;
  onPause?: () => void;
}

// Create a simpler game class that doesn't rely on external assets
class SimpleGame extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private stars?: Phaser.Physics.Arcade.Group;
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;

  constructor() {
    super('SimpleGame');
  }

  preload() {
    // Create simple graphics instead of loading external assets
    this.load.on('fileerror', (file: any) => {
      console.warn('Failed to load file:', file.key);
    });
    
    // Generate colored rectangles for game objects
    this.createColoredRectangle('ground', 400, 50, 0x009900);
    this.createColoredRectangle('platform', 200, 30, 0x00aa00);
    this.createColoredRectangle('player', 32, 48, 0x0000ff);
    this.createColoredRectangle('star', 24, 24, 0xffff00);
  }

  createColoredRectangle(key: string, width: number, height: number, color: number) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.clear();
  }

  create() {
    // Set a simple background color
    this.cameras.main.setBackgroundColor('#87CEEB');
    
    // Create static platforms
    this.platforms = this.physics.add.staticGroup();
    
    // Create the ground
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    
    // Create platforms
    this.platforms.create(600, 400, 'platform');
    this.platforms.create(50, 250, 'platform');
    this.platforms.create(750, 220, 'platform');
    
    // Create player with physics
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    
    // Add collider between player and platforms
    this.physics.add.collider(this.player, this.platforms);
    
    // Create stars
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    // Properly use the children.iterate method with type safety
    if (this.stars.children && typeof this.stars.children.iterate === 'function') {
      this.stars.children.iterate((child: any) => {
        const c = child as Phaser.Physics.Arcade.Image;
        c.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        return true;
      });
    }
    
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
    
    // Add score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', { 
      fontSize: '32px', 
      color: '#000' 
    });
    
    // Add cursor keys
    this.input.keyboard.createCursorKeys();
  }
  
  collectStar(player: Phaser.Physics.Arcade.Sprite, star: Phaser.Physics.Arcade.Image) {
    star.disableBody(true, true);
    this.score += 10;
    if (this.scoreText) {
      this.scoreText.setText('Score: ' + this.score);
    }
    
    if (this.stars && this.stars.countActive(true) === 0) {
      // Properly use the children.iterate method with type safety
      if (this.stars.children && typeof this.stars.children.iterate === 'function') {
        this.stars.children.iterate((child: any) => {
          const c = child as Phaser.Physics.Arcade.Image;
          if (c && typeof c.enableBody === 'function') {
            c.enableBody(true, c.x, 0, true, true);
          }
          return true;
        });
      }
    }
  }
  
  update() {
    if (!this.player) return;
    
    const cursors = this.input.keyboard.createCursorKeys();
    
    if (cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }
    
    if (cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}

const PlatformerGame: React.FC<PlatformerGameProps> = ({ 
  onReturn, 
  timerState,
  onStart,
  onPause
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [gameInitialized, setGameInitialized] = useState(false);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    console.log("PlatformerGame component mounted");
    
    // Clean up previous game instance if it exists
    if (gameInstanceRef.current) {
      console.log("Destroying previous game instance");
      gameInstanceRef.current.destroy(true);
      gameInstanceRef.current = null;
    }
    
    // Ensure the container is in the DOM
    if (!gameContainerRef.current) {
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
        
        // Define the game configuration
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: gameContainerRef.current || undefined,
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { x: 0, y: 300 },
              debug: false
            }
          },
          scene: [SimpleGame]
        };

        // Create and start the game
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
  }, []);

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
        {!gameInitialized && !errorState && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-focus-purple mx-auto mb-2"></div>
              <p>Loading game...</p>
            </div>
          </div>
        )}
        
        {errorState && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-2">Unable to load game</p>
              <p className="text-sm text-gray-500">{errorState}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        )}
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
