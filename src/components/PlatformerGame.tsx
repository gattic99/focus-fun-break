
import React, { useEffect, useState } from 'react';
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

// Define the types we'll need for the game before import
class Preloader extends Phaser.Scene {
  constructor() {
    super({ key: 'Preloader' });
  }

  preload() {
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
      this.collectStar as any, 
      undefined, 
      this
    );

    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000' });

    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.collider(
      this.player, 
      this.bombs, 
      this.hitBomb as any, 
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
  const [gameLoaded, setGameLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [game, setGame] = useState<any | null>(null);
  
  useEffect(() => {
    let gameInstance: any = null;
    
    // Dynamic import of Phaser with proper error handling
    const loadGame = async () => {
      try {
        // Dynamically import Phaser
        const Phaser = await import('phaser');
        
        // Define the game configuration
        const config = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: 'phaser-game',
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 300 },
              debug: false
            }
          },
          scene: [Preloader, PlayGame]
        };

        // Create and start the game
        gameInstance = new Phaser.Game(config);
        setGame(gameInstance);
        setGameLoaded(true);
      } catch (error) {
        console.error("Error loading Phaser:", error);
        setLoadError("Failed to load game engine. Please try again later.");
      }
    };

    // Ensure the container exists before loading the game
    const gameContainer = document.getElementById('phaser-game');
    if (gameContainer) {
      loadGame();
    } else {
      setLoadError("Game container not found");
    }

    // Clean up function to destroy the game when the component unmounts
    return () => {
      if (gameInstance) {
        gameInstance.destroy(true);
      }
    };
  }, []);

  return (
    <div className="break-card p-4 w-full max-w-md mx-auto animate-scale-in bg-white bg-opacity-80 backdrop-blur-md rounded-xl border border-white border-opacity-20 shadow-md">
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
          <div id="phaser-game" className="mb-4 rounded overflow-hidden"></div>
          
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

export default PlatformerGame;

