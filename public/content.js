
// Initialize Phaser before the game loads to avoid issues
window.phaserGameLoaded = false;
window.phaserLoading = false;

// Load Phaser from CDN when needed to ensure it's available for the game
function loadPhaserIfNeeded() {
  if (!window.Phaser && !window.phaserLoading) {
    window.phaserLoading = true;
    console.log("Loading Phaser from CDN...");
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js';
    script.async = true;
    script.onload = () => {
      console.log("Phaser loaded successfully!");
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
  } else if (window.Phaser && !window.phaserGameLoaded) {
    // If Phaser is already loaded but the flag isn't set
    console.log("Phaser already available, setting loaded flag");
    window.phaserGameLoaded = true;
    window.dispatchEvent(new CustomEvent('phaser-loaded'));
  }
}

// Listen for game init request
window.addEventListener('load-phaser-game', () => {
  console.log("Received load-phaser-game event");
  loadPhaserIfNeeded();
});

// Also try to preload Phaser when the extension loads
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => loadPhaserIfNeeded(), { timeout: 3000 });
  } else {
    setTimeout(loadPhaserIfNeeded, 1000);
  }
}
