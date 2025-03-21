
/**
 * Type definitions for Phaser
 * This provides basic types for Phaser usage in our project
 */
declare namespace Phaser {
  interface Game {
    destroy(removeCanvas?: boolean, noReturn?: boolean): void;
  }

  namespace Types {
    namespace Physics {
      namespace Arcade {
        interface SpriteWithDynamicBody extends Physics.Arcade.Sprite {
          body: Physics.Arcade.Body;
        }
      }
    }
    namespace Core {
      interface GameConfig {
        type: number;
        width: number;
        height: number;
        parent?: HTMLElement | string;
        scene?: Scene | Scene[] | Function | Object | any;
        physics?: PhysicsConfig;
        [key: string]: any;
      }

      interface PhysicsConfig {
        default: string;
        arcade?: {
          gravity?: { x: number; y: number };
          debug?: boolean;
        };
      }
    }
  }

  class Game {
    constructor(config: Types.Core.GameConfig);
    destroy(removeCanvas?: boolean, noReturn?: boolean): void;
  }

  class Scene {
    constructor(config: string | SceneConfig);
    add: Add;
    cameras: Cameras.SceneManager;
    input: Input;
    load: Load;
    physics: Physics;
    children: GameObjectFactory;
    generate: TextureManager;
    sys: Systems;
    createColoredRectangle(key: string, width: number, height: number, color: number): void;
    collectStar(player: any, star: any): void;
    preload(): void;
    create(): void;
    update(): void;
  }

  interface SceneConfig {
    key?: string;
    active?: boolean;
    visible?: boolean;
    pack?: any;
    cameras?: any;
    map?: any;
    physics?: any;
    loader?: any;
    plugins?: any;
  }

  namespace GameObjects {
    class Graphics extends GameObject {
      fillStyle(color: number, alpha?: number): this;
      fillRect(x: number, y: number, width: number, height: number): this;
      generateTexture(key: string, width?: number, height?: number): this;
      clear(): this;
    }

    class Text extends GameObject {
      setText(text: string): this;
    }

    class GameObject {
      scene: Scene;
      setActive(value: boolean): this;
      setVisible(value: boolean): this;
    }
    
    // Add Image class definition
    class Image extends GameObject {
      x: number;
      y: number;
      setBounceY(value: number): this;
    }
  }

  namespace Physics {
    namespace Arcade {
      class Sprite extends GameObjects.Sprite {
        body: Body;
        setBounce(value: number): this;
        setCollideWorldBounds(value: boolean): this;
        setVelocityX(x: number): this;
        setVelocityY(y: number): this;
        setScale(x: number, y?: number): this;
        refreshBody(): this;
      }

      class StaticGroup extends Group {
        create(x: number, y: number, key: string): Sprite;
        refresh(): this;
      }

      class Group {
        // Fix the children property type to include iterate method
        children: {
          entries: GameObjects.GameObject[];
          iterate(callback: Function, context?: any): any;
        };
        create(x: number, y: number, key: string): Sprite;
        createMultiple(config: any): this;
        countActive(value: boolean): number;
      }

      class Body {
        touching: {
          down: boolean;
          up: boolean;
          left: boolean;
          right: boolean;
        };
      }
      
      class Image extends GameObjects.Image {
        setBounceY(value: number): this;
        enableBody(active: boolean, x: number, y: number, enableGameObject: boolean, showGameObject: boolean): this;
        disableBody(disableGameObject: boolean, hideGameObject: boolean): this;
        x: number; // Add x property
        y: number; // Add y property
      }
    }

    interface Physics {
      add: {
        staticGroup(): Arcade.StaticGroup;
        group(config?: any): Arcade.Group;
        sprite(x: number, y: number, key: string): Arcade.Sprite;
        collider(object1: any, object2: any, collideCallback?: Function, processCallback?: Function, callbackContext?: any): any;
        overlap(object1: any, object2: any, collideCallback?: Function, processCallback?: Function, callbackContext?: any): any;
      };
      world: any;
    }
  }

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

  const AUTO: number;
  
  class GameObjectFactory {
    existing(gameObject: GameObjects.GameObject): GameObjects.GameObject;
  }
  
  class GameObjects {
    static Sprite: any;
  }
  
  // Adding Systems class for Phaser.Scene.sys
  class Systems {
    [key: string]: any;
  }
}

// Global Phaser
declare const Phaser: typeof Phaser;
