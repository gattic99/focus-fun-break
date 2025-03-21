
import Phaser from 'phaser';

export class SimpleGameScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private stars?: Phaser.Physics.Arcade.Group;
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'SimpleGameScene' });
    console.log("SimpleGameScene constructor called");
  }

  preload() {
    console.log("SimpleGameScene preload started");
    // Create simple graphics instead of loading external assets
    this.load.on('fileerror', (file: any) => {
      console.warn('Failed to load file:', file.key);
    });
    
    // Generate colored rectangles for game objects
    this.createColoredRectangle('ground', 400, 50, 0x009900);
    this.createColoredRectangle('platform', 200, 30, 0x00aa00);
    this.createColoredRectangle('player', 32, 48, 0x0000ff);
    this.createColoredRectangle('star', 24, 24, 0xffff00);
    console.log("SimpleGameScene preload completed");
  }

  createColoredRectangle(key: string, width: number, height: number, color: number) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.clear();
    console.log(`Created texture: ${key}`);
  }

  create() {
    console.log("SimpleGameScene create started");
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
    this.cursors = this.input.keyboard.createCursorKeys();
    console.log("SimpleGameScene create completed");
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
    if (!this.player || !this.cursors) return;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}
