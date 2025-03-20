
/// <reference types="vite/client" />

// Extended window interface for Phaser
interface Window {
  Phaser: any;
  phaserGameLoaded: boolean;
  phaserLoading: boolean;
  dispatchEvent(event: Event): boolean;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
