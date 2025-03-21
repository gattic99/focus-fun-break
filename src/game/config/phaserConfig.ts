
import Phaser from 'phaser';
import { SimpleGameScene } from '../scenes/SimpleGameScene';

export const createGameConfig = (container: HTMLElement | null): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: container || undefined,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 300 },
        debug: false
      }
    },
    scene: [SimpleGameScene]
  };
};
