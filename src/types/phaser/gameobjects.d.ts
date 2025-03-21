
/**
 * Type definitions for Phaser GameObjects
 */
declare namespace Phaser {
  namespace GameObjects {
    class GameObject {
      scene: Scene;
      setActive(value: boolean): this;
      setVisible(value: boolean): this;
    }

    class Graphics extends GameObject {
      fillStyle(color: number, alpha?: number): this;
      fillRect(x: number, y: number, width: number, height: number): this;
      generateTexture(key: string, width?: number, height?: number): this;
      clear(): this;
    }

    class Text extends GameObject {
      setText(text: string): this;
    }
    
    class Image extends GameObject {
      x: number;
      y: number;
      setBounceY(value: number): this;
    }
    
    class Sprite extends GameObject {
      // Basic Sprite class definition
    }
  }

  class GameObjects {
    static Sprite: any;
  }

  class GameObjectFactory {
    existing(gameObject: GameObjects.GameObject): GameObjects.GameObject;
  }
}
