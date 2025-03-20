
// Initialize Phaser before the game loads to avoid issues
window.phaserGameLoaded = false;

// Load Phaser from CDN when needed to ensure it's available for the game
function loadPhaserIfNeeded() {
  if (!window.Phaser && !window.phaserLoading) {
    window.phaserLoading = true;
    console.log("Loading Phaser from CDN...");
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js';
    script.async = true;
    script.onload = () => {
      console.log("Phaser loaded successfully");
      window.phaserLoading = false;
      window.phaserGameLoaded = true;
      
      // Dispatch event to notify game component
      window.dispatchEvent(new CustomEvent('phaser-loaded'));
    };
    script.onerror = () => {
      console.error("Failed to load Phaser from CDN");
      window.phaserLoading = false;
    };
    
    document.head.appendChild(script);
  }
}

// Listen for game init request
window.addEventListener('load-phaser-game', loadPhaserIfNeeded);
