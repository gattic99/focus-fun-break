
import React, { useEffect, useState, useRef } from 'react';
import { TimerState } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Timer from "./Timer";

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
  const [gameLoaded, setGameLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const gameInstanceRef = useRef<any>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [loadingPhaser, setLoadingPhaser] = useState(false);
  
  useEffect(() => {
    console.log("PlatformerGame component mounted");
    
    // Function to initialize the game once Phaser is loaded
    const initGame = () => {
      try {
        if (!window.Phaser) {
          console.error("Phaser not loaded yet");
          return;
        }
        
        if (gameInstanceRef.current) {
          console.log("Game already initialized, skipping");
          return;
        }
        
        console.log("Initializing Phaser game...");
        
        // Define game scenes
        class Preloader extends window.Phaser.Scene {
          constructor() {
            super({ key: 'Preloader' });
          }

          preload() {
            console.log("Preloader scene: Loading assets...");
            this.load.image('sky', 'assets/sky.png');
            this.load.image('ground', 'assets/platform.png');
            this.load.image('star', 'assets/star.png');
            this.load.image('bomb', 'assets/bomb.png');
            this.load.spritesheet('dude',
              'assets/dude.png',
              { frameWidth: 32, frameHeight: 48 }
            );
          }

          create() {
            console.log("Preloader scene: Assets loaded, starting game");
            this.scene.start('PlayGame');
          }
        }

        class PlayGame extends window.Phaser.Scene {
          platforms: any;
          player: any;
          cursors: any;
          stars: any;
          bombs: any;
          score: number = 0;
          scoreText: any;
          gameOver: boolean = false;

          constructor() {
            super({ key: 'PlayGame' });
          }

          create() {
            this.add.image(400, 300, 'sky');

            this.platforms = this.physics.add.staticGroup();

            this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

            this.platforms.create(600, 400, 'ground');
            this.platforms.create(50, 250, 'ground');
            this.platforms.create(750, 220, 'ground');

            this.player = this.physics.add.sprite(100, 450, 'dude');

            this.player.setBounce(0.2);
            this.player.setCollideWorldBounds(true);

            this.anims.create({
              key: 'left',
              frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
              frameRate: 10,
              repeat: -1
            });

            this.anims.create({
              key: 'turn',
              frames: [{ key: 'dude', frame: 4 }],
              frameRate: 20
            });

            this.anims.create({
              key: 'right',
              frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
              frameRate: 10,
              repeat: -1
            });

            this.physics.add.collider(this.player, this.platforms);

            this.cursors = this.input.keyboard.createCursorKeys();

            this.stars = this.physics.add.group({
              key: 'star',
              repeat: 11,
              setXY: { x: 12, y: 0, stepX: 70 }
            });

            this.stars.children.iterate((child: any) => {
              child.setBounceY(window.Phaser.Math.FloatBetween(0.4, 0.8));
              return true; // Return true to continue iteration
            });

            this.physics.add.collider(this.stars, this.platforms);

            this.physics.add.overlap(
              this.player, 
              this.stars, 
              this.collectStar, 
              undefined, 
              this
            );

            this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000' });

            this.bombs = this.physics.add.group();

            this.physics.add.collider(this.bombs, this.platforms);

            this.physics.add.collider(
              this.player, 
              this.bombs, 
              this.hitBomb, 
              undefined, 
              this
            );
          }

          update() {
            if (this.gameOver) {
              return;
            }

            if (this.cursors.left.isDown) {
              this.player.setVelocityX(-160);
              this.player.anims.play('left', true);
            }
            else if (this.cursors.right.isDown) {
              this.player.setVelocityX(160);
              this.player.anims.play('right', true);
            }
            else {
              this.player.setVelocityX(0);
              this.player.anims.play('turn');
            }

            if (this.cursors.up.isDown && this.player.body.touching.down) {
              this.player.setVelocityY(-330);
            }
          }

          collectStar(player: any, star: any) {
            star.disableBody(true, true);

            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);

            if (this.stars.countActive(true) === 0) {
              this.stars.children.iterate((child: any) => {
                child.enableBody(true, child.x, 0, true, true);
                return true; // Return true to continue iteration
              });

              const x = (player.x < 400) ? window.Phaser.Math.Between(400, 800) : window.Phaser.Math.Between(0, 400);

              const bomb = this.bombs.create(x, 16, 'bomb');
              bomb.setBounce(1);
              bomb.setCollideWorldBounds(true);
              bomb.setVelocity(window.Phaser.Math.Between(-200, 200), 20);
            }
          }

          hitBomb(player: any, bomb: any) {
            this.physics.pause();
            player.setTint(0xff0000);
            player.anims.play('turn');
            this.gameOver = true;
          }
        }

        // Create game configuration
        const config = {
          type: window.Phaser.AUTO,
          width: 800,
          height: 600,
          parent: gameContainerRef.current || 'phaser-game',
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 300, x: 0 }, // x:0 required by Vector2Like type
              debug: false
            }
          },
          scene: [Preloader, PlayGame]
        };

        // Create and start the game
        console.log("Creating new Phaser game instance");
        gameInstanceRef.current = new window.Phaser.Game(config);
        setGameLoaded(true);
        console.log("Phaser game created successfully");
      } catch (error) {
        console.error("Error initializing Phaser game:", error);
        setLoadError(`Failed to initialize game: ${error}`);
      }
    };

    // Setup listener for when Phaser is loaded
    const phaserLoadListener = () => {
      console.log("Phaser loaded event received");
      setLoadingPhaser(false);
      setGameLoaded(true);
      initGame();
    };
    
    window.addEventListener('phaser-loaded', phaserLoadListener);
    
    // Check if Phaser is already loaded
    if (window.phaserGameLoaded && window.Phaser) {
      console.log("Phaser already loaded, initializing game immediately");
      initGame();
    } else {
      console.log("Triggering Phaser load");
      setLoadingPhaser(true);
      // Dispatch the load-phaser-game event to tell content.js to load Phaser
      window.dispatchEvent(new CustomEvent('load-phaser-game'));
    }

    // Clean up function to destroy the game when the component unmounts
    return () => {
      window.removeEventListener('phaser-loaded', phaserLoadListener);
      if (gameInstanceRef.current) {
        console.log("Destroying Phaser game instance");
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="break-card p-4 w-full mx-auto animate-scale-in bg-white bg-opacity-80 backdrop-blur-md rounded-xl border border-white border-opacity-20 shadow-md">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-dark-text">Platformer Game</h2>
        <p className="text-sm text-muted-foreground">
          Enjoy a quick game during your break!
        </p>
      </div>

      {loadError ? (
        <div className="text-center p-4 text-red-500">
          <p>{loadError}</p>
          <Button onClick={onReturn} className="mt-4 bg-focus-purple hover:bg-focus-purple-dark">
            Return to Timer
          </Button>
        </div>
      ) : (
        <>
          <div 
            id="phaser-game" 
            ref={gameContainerRef}
            className="mb-4 rounded overflow-hidden bg-gray-100"
            style={{ width: '100%', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {(loadingPhaser || !gameLoaded) && (
              <div className="flex flex-col justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-focus-purple mb-4"></div>
                <p className="text-focus-purple">Loading game...</p>
              </div>
            )}
          </div>
          
          <div className="mb-4 mt-4">
            <Timer 
              timerState={timerState}
              onStart={onStart}
              onPause={onPause}
            />
          </div>

          <div className="flex justify-center">
            <Button onClick={onReturn} className="btn-secondary text-sm py-2 px-4">
              Return to Timer <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// Add this declaration to the global Window interface
declare global {
  interface Window {
    Phaser: any;
    phaserGameLoaded: boolean;
    phaserLoading: boolean;
  }
}

export default PlatformerGame;
