
import Phaser from 'phaser';
import { SimpleGameScene } from '../scenes/SimpleGameScene';

export const createGameConfig = (container: HTMLElement | null): Phaser.Types.Core.GameConfig => {
  console.log("Creating Phaser game config with container:", container);
  
  if (!container) {
    console.warn("Container is null, game may not display correctly");
  }
  
  return {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: container || undefined,
    backgroundColor: '#87CEEB',
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
