
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
    
    // Generate colored rectangles for game objects directly instead of loading external assets
    this.generateGameAssets();
    
    console.log("SimpleGameScene preload completed");
  }

  generateGameAssets() {
    console.log("Generating game assets locally");
    
    try {
      // Generate ground texture (green rectangle)
      this.generateTexture('ground', 400, 50, 0x009900);
      
      // Generate platform texture (lighter green rectangle)
      this.generateTexture('platform', 200, 30, 0x00aa00);
      
      // Generate player texture (blue rectangle)
      this.generateTexture('player', 32, 48, 0x0000ff);
      
      // Generate star texture (yellow circle)
      this.generateCircleTexture('star', 12, 0xffff00);
      
      console.log("All game textures generated successfully");
    } catch (error) {
      console.error("Error generating game textures:", error);
      
      // Fallback with even simpler shapes if the texture generation fails
      this.generateFallbackTextures();
    }
  }
  
  generateTexture(key: string, width: number, height: number, color: number) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.clear();
    console.log(`Created rectangle texture: ${key}`);
  }
  
  generateCircleTexture(key: string, radius: number, color: number) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(radius, radius, radius);
    graphics.generateTexture(key, radius * 2, radius * 2);
    graphics.clear();
    console.log(`Created circle texture: ${key}`);
  }
  
  generateFallbackTextures() {
    // Even simpler fallback textures if the first attempt fails
    const keys = ['ground', 'platform', 'player', 'star'];
    const colors = [0x009900, 0x00aa00, 0x0000ff, 0xffff00];
    
    keys.forEach((key, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(colors[index], 1);
      graphics.fillRect(0, 0, 50, 50);
      graphics.generateTexture(key, 50, 50);
      graphics.clear();
    });
    
    console.log("Fallback textures created");
  }

  create() {
    console.log("SimpleGameScene create started");
    
    try {
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
      
      console.log("SimpleGameScene create completed successfully");
    } catch (error) {
      console.error("Error in create method:", error);
      // Add a text message in the center of the screen to indicate the error
      this.add.text(400, 300, 'Game Error: Please try again', {
        fontSize: '24px',
        color: '#FF0000'
      }).setOrigin(0.5);
    }
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
