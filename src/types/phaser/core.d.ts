
/**
 * Core type definitions for Phaser
 * Contains basic types and interfaces
 */
declare namespace Phaser {
  namespace Types {
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

  interface Game {
    destroy(removeCanvas?: boolean, noReturn?: boolean): void;
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

  // Basic constants
  const AUTO: number;
}
