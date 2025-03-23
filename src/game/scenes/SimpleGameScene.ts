
import Phaser from 'phaser';

export class SimpleGameScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private stars?: Phaser.Physics.Arcade.Group;
  private obstacles?: Phaser.Physics.Arcade.StaticGroup;
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private gameTitle?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;
  private sinaTexture?: any;
  private cristinaTexture?: any;

  constructor() {
    super({ key: 'SimpleGameScene' });
    console.log("SimpleGameScene constructor called");
  }

  preload() {
    console.log("SimpleGameScene preload started");
    
    // Load the actual image assets from the extension
    this.load.image('sina-coin', 'assets/coin-sina.png');
    this.load.image('cristina-coin', 'assets/coin-cristina.png');
    
    // Generate all textures for the game
    this.generateGameAssets();
    
    console.log("SimpleGameScene preload completed");
  }

  generateGameAssets() {
    console.log("Generating game assets locally");
    
    try {
      // Generate platform textures
      this.generateTexture('ground', 800, 20, 0xBBBBBB, (ctx) => {
        // Add some texture to ground
        ctx.fillStyle = '#999999';
        for (let i = 0; i < 800; i += 20) {
          for (let j = 0; j < 20; j += 5) {
            if ((i + j) % 3 === 0) {
              ctx.fillRect(i, j, 3, 2);
            }
          }
        }
      });
      
      this.generateTexture('platform', 200, 15, 0x8B4513, (ctx) => {
        // Add wood texture to platforms
        ctx.fillStyle = '#6B3304';
        for (let i = 0; i < 200; i += 10) {
          ctx.fillRect(i, 0, 1, 15);
        }
      });
      
      this.generateTexture('shelf', 100, 10, 0xA67C52, (ctx) => {
        // Add wood grain texture
        ctx.fillStyle = '#8B5A2B';
        for (let i = 0; i < 100; i += 8) {
          ctx.fillRect(i, 2, 1, 8);
        }
      });
      
      // Generate player character - office worker 
      this.generateTexture('player', 32, 48, 0, (ctx) => {
        // Draw a more detailed character - blue shirt, dark pants
        // Body - blue shirt
        ctx.fillStyle = '#2957ab';
        ctx.fillRect(8, 15, 16, 20);
        
        // Pants
        ctx.fillStyle = '#333333';
        ctx.fillRect(8, 35, 16, 13);
        
        // Head
        ctx.fillStyle = '#ffd699';
        ctx.beginPath();
        ctx.arc(16, 10, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair
        ctx.fillStyle = '#663300';
        ctx.beginPath();
        ctx.arc(16, 7, 8, Math.PI, 0, true);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(13, 10, 1, 0, Math.PI * 2);
        ctx.arc(19, 10, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile
        ctx.beginPath();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.arc(16, 13, 3, 0.1, Math.PI - 0.1);
        ctx.stroke();
      });
      
      // Generate obstacle textures
      this.generateTexture('tree', 40, 60, 0, (ctx) => {
        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(15, 40, 10, 20);
        
        // Tree leaves
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(2, 40);
        ctx.lineTo(38, 40);
        ctx.closePath();
        ctx.fill();
      });
      
      this.generateTexture('computer', 35, 30, 0, (ctx) => {
        // Monitor
        ctx.fillStyle = '#333333';
        ctx.fillRect(2, 2, 31, 20);
        
        // Screen
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(5, 5, 25, 14);
        
        // Stand
        ctx.fillStyle = '#555555';
        ctx.fillRect(15, 22, 5, 8);
        ctx.fillRect(10, 28, 15, 2);
      });
      
      this.generateTexture('desk', 200, 15, 0x8B4513, (ctx) => {
        // Add wood texture to desk
        ctx.fillStyle = '#6B3304';
        for (let i = 0; i < 200; i += 15) {
          ctx.fillRect(i, 2, 2, 11);
        }
      });
      
      // No need to generate coin textures as we're loading the assets directly
      
      console.log("All game textures generated successfully");
    } catch (error) {
      console.error("Error generating game textures:", error);
      
      // Fallback with even simpler shapes if the texture generation fails
      this.generateFallbackTextures();
    }
  }
  
  generateTexture(key: string, width: number, height: number, color: number, callback?: (ctx: CanvasRenderingContext2D) => void) {
    // Check if texture already exists to avoid duplicate creation
    if (this.textures.exists(key)) {
      console.log(`Texture ${key} already exists, skipping creation`);
      return;
    }
    
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);
    
    // Generate the base texture
    graphics.generateTexture(key, width, height);
    
    // If we have a callback for adding details, create a canvas texture
    if (callback) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Fill with base color
        ctx.fillStyle = color ? '#' + color.toString(16).padStart(6, '0') : 'transparent';
        ctx.fillRect(0, 0, width, height);
        
        // Call the callback to add details
        callback(ctx);
        
        // Make sure we destroy and recreate the texture to avoid caching issues
        if (this.textures.exists(key)) {
          this.textures.remove(key);
        }
        
        // Create a new texture from the canvas
        this.textures.addCanvas(key, canvas);
      }
    }
    
    graphics.clear();
    console.log(`Created texture: ${key}`);
  }
  
  generateCircleTexture(key: string, radius: number, color: number, callback?: (ctx: CanvasRenderingContext2D) => void) {
    // Check if texture already exists
    if (this.textures.exists(key)) {
      console.log(`Texture ${key} already exists, skipping creation`);
      return;
    }
    
    const diameter = radius * 2;
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(radius, radius, radius);
    
    // Generate the base texture
    graphics.generateTexture(key, diameter, diameter);
    
    // If we have a callback for adding details, create a canvas texture
    if (callback) {
      const canvas = document.createElement('canvas');
      canvas.width = diameter;
      canvas.height = diameter;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Fill with base color
        ctx.fillStyle = color ? '#' + color.toString(16).padStart(6, '0') : 'transparent';
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Call the callback to add details
        callback(ctx);
        
        // Make sure we destroy and recreate the texture to avoid caching issues
        if (this.textures.exists(key)) {
          this.textures.remove(key);
        }
        
        // Create a new texture from the canvas
        this.textures.addCanvas(key, canvas);
      }
    }
    
    graphics.clear();
    console.log(`Created circle texture: ${key}`);
  }
  
  generateFallbackTextures() {
    // Even simpler fallback textures if the first attempt fails
    const keys = ['ground', 'platform', 'player', 'tree', 'computer', 'desk'];
    const colors = [0x999999, 0x8B4513, 0x0000FF, 0x228B22, 0x333333, 0x8B4513];
    
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
      // Set background color
      this.cameras.main.setBackgroundColor('#87CEEB');
      
      // Add game title
      this.gameTitle = this.add.text(400, 30, 'Office Escape 🏃‍♂️ 🏃‍♀️', { 
        fontSize: '28px',
        color: '#7B5CCC',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // Add game instructions
      this.instructionText = this.add.text(400, 70, 
        'Dodge obstacles and collect coins—they\'re your colleagues, Sina and Cristina!\n' +
        'Everything except coins and trees will take you out! You can jump on the shelves!',
        { 
          fontSize: '14px',
          color: '#666666',
          align: 'center'
        }
      ).setOrigin(0.5);
      
      // Create control instructions
      this.add.text(650, 180, 'Arrow Keys/WASD to move, Up/Space to jump', { 
        fontSize: '12px',
        color: '#FFFFFF',
        backgroundColor: '#333333',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5);
      
      // Create static platforms
      this.platforms = this.physics.add.staticGroup();
      
      // Create the ground
      this.platforms.create(400, 580, 'ground').setScale(2).refreshBody();
      
      // Create platforms
      this.platforms.create(600, 450, 'desk');
      this.platforms.create(50, 380, 'platform');
      this.platforms.create(750, 350, 'platform');
      this.platforms.create(400, 300, 'platform');
      this.platforms.create(200, 250, 'shelf');
      this.platforms.create(500, 200, 'shelf');
      
      // Add trees on some platforms
      this.obstacles = this.physics.add.staticGroup();
      this.obstacles.create(200, 220, 'tree');
      this.obstacles.create(400, 270, 'tree');
      this.obstacles.create(600, 420, 'tree');
      
      // Add a computer on a desk
      this.obstacles.create(400, 285, 'computer');
      
      // Create player with physics
      this.player = this.physics.add.sprite(100, 450, 'player');
      this.player.setBounce(0.2);
      this.player.setCollideWorldBounds(true);
      
      // Add collider between player and platforms
      this.physics.add.collider(this.player, this.platforms);
      
      // Create stars
      this.stars = this.physics.add.group();
      
      // Create Sina coins
      for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(0, 300);
        const star = this.stars.create(x, y, 'sina-coin');
        star.setBounce(Phaser.Math.FloatBetween(0.4, 0.8));
        star.setCollideWorldBounds(true);
      }
      
      // Create Cristina coins
      for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(50, 750);
        const y = Phaser.Math.Between(0, 300);
        const star = this.stars.create(x, y, 'cristina-coin');
        star.setBounce(Phaser.Math.FloatBetween(0.4, 0.8));
        star.setCollideWorldBounds(true);
      }
      
      this.physics.add.collider(this.stars, this.platforms);
      this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
      
      // Add score text
      this.scoreText = this.add.text(50, 180, 'Score: 0', { 
        fontSize: '24px', 
        color: '#fff',
        backgroundColor: '#333',
        padding: { x: 10, y: 5 }
      });
      
      // Add cursor keys
      this.cursors = this.input.keyboard.createCursorKeys();
      
      // Add WASD keys as alternative controls
      this.input.keyboard.on('keydown-W', () => {
        this.cursors.up.isDown = true;
      });
      this.input.keyboard.on('keyup-W', () => {
        this.cursors.up.isDown = false;
      });
      this.input.keyboard.on('keydown-A', () => {
        this.cursors.left.isDown = true;
      });
      this.input.keyboard.on('keyup-A', () => {
        this.cursors.left.isDown = false;
      });
      this.input.keyboard.on('keydown-D', () => {
        this.cursors.right.isDown = true;
      });
      this.input.keyboard.on('keyup-D', () => {
        this.cursors.right.isDown = false;
      });
      this.input.keyboard.on('keydown-SPACE', () => {
        this.cursors.up.isDown = true;
      });
      this.input.keyboard.on('keyup-SPACE', () => {
        this.cursors.up.isDown = false;
      });
      
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
      // Respawn all stars
      this.stars.children.iterate((child: any) => {
        const c = child as Phaser.Physics.Arcade.Image;
        if (c && typeof c.enableBody === 'function') {
          c.enableBody(true, Phaser.Math.Between(50, 750), 0, true, true);
        }
        return true;
      });
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
    
    // Allow jumping when touching the ground
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }
  }
}
