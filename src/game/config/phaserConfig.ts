
import Phaser from 'phaser';
import { SimpleGameScene } from '../scenes/SimpleGameScene';

export const createGameConfig = (container: HTMLElement | null): Phaser.Types.Core.GameConfig => {
  console.log("Creating Phaser game config with container:", container);
  
  if (!container) {
    console.warn("Container is null, game may not display correctly");
  }
  
  // Get container dimensions for responsive sizing
  const width = container ? container.clientWidth : 800;
  const height = container ? container.clientHeight : 600;
  
  console.log(`Game dimensions: ${width}x${height}`);
  
  return {
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: container || undefined,
    backgroundColor: '#87CEEB',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 300 },
        debug: false
      }
    },
    scene: [SimpleGameScene],
    // Set to false to avoid issues with browser scaling
    disableContextMenu: true,
    render: {
      pixelArt: false,
      antialias: true,
      // Disable roundPixels as it can cause rendering issues
      roundPixels: false
    }
  };
};
