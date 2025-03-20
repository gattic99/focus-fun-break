
/// <reference types="vite/client" />

// Extended window interface for Phaser
interface Window {
  Phaser: any;
  phaserGameLoaded: boolean;
  phaserLoading: boolean;
}
