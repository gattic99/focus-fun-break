
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { v4 as uuidv4 } from 'uuid';

import "./index.css";

// Declare the hasRun property on the window object
declare global {
  interface Window {
    hasRun?: boolean;
    focusflowLoaded?: boolean;
    Phaser?: any; // Make Phaser available on window
  }
  var tabId: string;
}

// Generate a unique ID for this tab instance
globalThis.tabId = uuidv4();
console.log("Tab ID generated:", globalThis.tabId);

// Load Phaser from CDN with better error handling
const loadPhaserLibrary = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.Phaser) {
      console.log("[FocusFlow] Phaser already loaded");
      resolve();
      return;
    }

    console.log("[FocusFlow] Loading Phaser from CDN");
    
    // First try loading from a more reliable CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js';
    script.async = true;
    
    // Add more detailed error/load handling
    script.onload = () => {
      console.log("[FocusFlow] Phaser loaded successfully from jsdelivr");
      
      // Create a global function to check if Phaser is actually working
      window.Phaser = window.Phaser || {};
      
      // Verify that key Phaser components exist
      if (typeof window.Phaser.Game !== 'function') {
        console.warn("[FocusFlow] Phaser loaded but Game class not found, might be corrupted");
        
        // Try from another CDN as fallback
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.70.0/phaser.min.js';
        fallbackScript.async = true;
        
        fallbackScript.onload = () => {
          console.log("[FocusFlow] Phaser loaded successfully from fallback CDN");
          resolve();
        };
        
        fallbackScript.onerror = (error) => {
          console.error("[FocusFlow] Failed to load Phaser from fallback:", error);
          // Continue anyway, our game implementation handles missing Phaser
          resolve();
        };
        
        document.head.appendChild(fallbackScript);
      } else {
        resolve();
      }
    };
    
    script.onerror = (error) => {
      console.error("[FocusFlow] Failed to load Phaser from primary CDN:", error);
      
      // Try from another CDN as fallback
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.70.0/phaser.min.js';
      fallbackScript.async = true;
      
      fallbackScript.onload = () => {
        console.log("[FocusFlow] Phaser loaded successfully from fallback CDN");
        resolve();
      };
      
      fallbackScript.onerror = (secondError) => {
        console.error("[FocusFlow] Failed to load Phaser from fallback:", secondError);
        // Continue anyway, our game implementation handles missing Phaser
        resolve();
      };
      
      document.head.appendChild(fallbackScript);
    };
    
    document.head.appendChild(script);
  });
};

// More efficient initialization process with proper performance optimizations
const initializeExtension = async () => {
  // Skip if already initialized
  if (window.focusflowLoaded) return;
  window.focusflowLoaded = true;
  
  console.log(`[FocusFlow] Initializing extension in tab ${globalThis.tabId}`);
  
  // Try to load Phaser library
  try {
    await loadPhaserLibrary();
  } catch (error) {
    console.error("[FocusFlow] Error loading Phaser, continuing anyway:", error);
  }
  
  // When running as an extension, set up communication between background script
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log("[FocusFlow] Extension environment detected, setting up message listeners");
    
    // Set up listeners for cross-tab communication with error handling
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Only process messages we care about
      if (message.action === 'stateChange') {
        // Only log important messages
        if (message.key === 'focusflow_timer_state') {
          console.log(`[FocusFlow] Timer state received: mode=${message.value?.mode}, running=${message.value?.isRunning}`);
        } else if (message.key === 'focusflow_settings') {
          console.log(`[FocusFlow] Settings received: focus=${message.value?.focusDuration/60}min, break=${message.value?.breakDuration/60}min`);
        }
      }
      return true;
    });
  }

  // Create container with visibility hidden initially for smoother rendering
  const appContainer = document.createElement("div");
  appContainer.id = "chrome-extension-root";
  appContainer.style.visibility = "hidden";
  appContainer.style.position = "fixed";  // Use fixed positioning
  appContainer.style.zIndex = "2147483647";  // Maximum z-index
  appContainer.style.width = "100%";
  appContainer.style.height = "100%";
  appContainer.style.top = "0";
  appContainer.style.left = "0";
  appContainer.style.pointerEvents = "none"; // Let clicks pass through by default
  
  // Create an inner container that will capture clicks
  const innerContainer = document.createElement("div");
  innerContainer.style.pointerEvents = "auto"; // This element will capture clicks
  innerContainer.id = "chrome-extension-inner";
  appContainer.appendChild(innerContainer);
  
  document.body.appendChild(appContainer);

  // Render with reduced layout thrashing and better performance
  setTimeout(() => {
    const rootElement = document.getElementById("chrome-extension-inner");
    if (rootElement) {
      console.log("[FocusFlow] Rendering app");
      
      // Use a try-catch to prevent the entire content script from failing
      try {
        createRoot(rootElement).render(<App />);
        
        // Show UI only after it's rendered, with a smoother fade-in
        setTimeout(() => {
          appContainer.style.transition = "opacity 0.3s ease-in-out";
          appContainer.style.opacity = "0";
          appContainer.style.visibility = "visible";
          
          // Use RAF for smoother animation
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              appContainer.style.opacity = "1";
            });
          });
        }, 100);
      } catch (error) {
        console.error("[FocusFlow] Error rendering app:", error);
      }
    }
  }, 500); // Longer delay to prevent page load impacts
};

// Check if we should initialize now or wait
if (!window.hasRun) {
  window.hasRun = true;
  
  // Use requestIdleCallback with a timeout fallback to ensure it runs during browser idle time
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => initializeExtension(), { timeout: 2000 });
  } else {
    // Fallback to setTimeout with a longer delay for slower devices
    setTimeout(initializeExtension, 1000);
  }
}
