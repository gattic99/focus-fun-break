
import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
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

class Preloader extends Phaser.Scene {
  constructor() {
    super({ key: 'Preloader' });
  }

  preload() {
    // Load phaser assets with error handling
    this.load.image('sky', 'assets/sky.png').on('fileerror', () => {
      console.error('Failed to load sky image');
    });
    this.load.image('ground', 'assets/platform.png').on('fileerror', () => {
      console.error('Failed to load ground image');
    });
    this.load.image('star', 'assets/star.png').on('fileerror', () => {
      console.error('Failed to load star image');
    });
    this.load.image('bomb', 'assets/bomb.png').on('fileerror', () => {
      console.error('Failed to load bomb image');
    });
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 })
    .on('fileerror', () => {
      console.error('Failed to load dude spritesheet');
    });
  }

  create() {
    this.scene.start('PlayGame');
  }
}

class PlayGame extends Phaser.Scene {
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private stars?: Phaser.Physics.Arcade.Group;
  private bombs?: Phaser.Physics.Arcade.Group;
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private gameOver: boolean = false;

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

    this.stars.children.iterate((child) => {
      const c = child as Phaser.Physics.Arcade.Image;
      c.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      return true; // Return true to continue iteration
    });

    this.physics.add.collider(this.stars, this.platforms);

    this.physics.add.overlap(
      this.player, 
      this.stars, 
      this.collectStar as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, 
      undefined, 
      this
    );

    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000' });

    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.collider(
      this.player, 
      this.bombs, 
      this.hitBomb as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, 
      undefined, 
      this
    );
  }

  update() {
    if (this.gameOver) {
      return;
    }

    if (this.cursors?.left.isDown) {
      this.player?.setVelocityX(-160);

      this.player?.anims.play('left', true);
    }
    else if (this.cursors?.right.isDown) {
      this.player?.setVelocityX(160);

      this.player?.anims.play('right', true);
    }
    else {
      this.player?.setVelocityX(0);

      this.player?.anims.play('turn');
    }

    if (this.cursors?.up.isDown && this.player?.body?.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  collectStar(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, 
    star: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const s = star as Phaser.Physics.Arcade.Image;
    s.disableBody(true, true);

    this.score += 10;
    this.scoreText?.setText('Score: ' + this.score);

    if (this.stars?.countActive(true) === 0) {
      this.stars.children.iterate((child) => {
        const c = child as Phaser.Physics.Arcade.Image;
        c.enableBody(true, c.x, 0, true, true);
        return true; // Return true to continue iteration
      });

      const playerSprite = _player as Phaser.Physics.Arcade.Sprite;
      const x = (playerSprite.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      const bomb = this.bombs?.create(x, 16, 'bomb') as Phaser.Physics.Arcade.Image;
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  hitBomb(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile, 
    _bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    this.physics.pause();

    const playerSprite = player as Phaser.Physics.Arcade.Sprite;
    playerSprite.setTint(0xff0000);
    playerSprite.anims.play('turn');

    this.gameOver = true;
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
          scene: [Preloader, PlayGame]
        };

        // Create and start the game
        gameInstanceRef.current = new Phaser.Game(config);
        console.log("Phaser game initialized with config:", config);
        setGameInitialized(true);
      } catch (error) {
        console.error("Error initializing Phaser game:", error);
      }
    }, 300);

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
        style={{ display: 'block' }}
      >
        {!gameInitialized && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-focus-purple mx-auto mb-2"></div>
              <p>Loading game...</p>
            </div>
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
    </div>
  );
};

export default PlatformerGame;
