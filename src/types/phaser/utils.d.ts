
/**
 * Type definitions for Phaser utility classes and functions
 */
declare namespace Phaser {
  class Load {
    on(event: string, callback: Function, context?: any): this;
  }

  class TextureManager {
    texture(key: string, width: number, height: number): any;
  }

  class Add {
    graphics(config?: any): GameObjects.Graphics;
    sprite(x: number, y: number, key: string): Physics.Arcade.Sprite;
    text(x: number, y: number, text: string, style?: any): GameObjects.Text;
  }

  class Input {
    keyboard: {
      createCursorKeys(): {
        left: { isDown: boolean };
        right: { isDown: boolean };
        up: { isDown: boolean };
        down: { isDown: boolean };
        space: { isDown: boolean };
      };
    };
  }

  namespace Cameras {
    class SceneManager {
      main: Camera;
    }
    
    class Camera {
      setBackgroundColor(color: string): this;
    }
  }

  namespace Math {
    function FloatBetween(min: number, max: number): number;
  }
  
  // Systems class for Phaser.Scene.sys
  class Systems {
    [key: string]: any;
  }
}
