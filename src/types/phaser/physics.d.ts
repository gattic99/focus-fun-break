
/**
 * Type definitions for Phaser Physics
 */
declare namespace Phaser {
  namespace Types {
    namespace Physics {
      namespace Arcade {
        interface SpriteWithDynamicBody extends Physics.Arcade.Sprite {
          body: Physics.Arcade.Body;
        }
      }
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
        x: number;
        y: number;
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
}
