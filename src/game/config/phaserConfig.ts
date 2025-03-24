
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
    backgroundColor: '#def3fd',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 300 },
        debug: false
      }
    },
    scene: [SimpleGameScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    audio: {
      disableWebAudio: false,
      noAudio: false
    },
    // Improved asset URL handling
    loader: {
      baseURL: './',
      path: '',
      crossOrigin: 'anonymous'
    }
  };
};
