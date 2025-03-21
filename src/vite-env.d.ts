
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Ensure Phaser is defined properly
declare namespace Phaser {
  export const AUTO: number;
  export class Game {
    constructor(config: any);
    destroy(removeCanvas?: boolean, noReturn?: boolean): void;
  }
}

// Ensure Phaser is accessible globally
declare const Phaser: typeof Phaser;
