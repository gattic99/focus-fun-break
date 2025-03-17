
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { v4 as uuidv4 } from 'uuid';

import "./index.css";

// Declare the hasRun property on the window object
declare global {
  interface Window {
    hasRun?: boolean;
    focusflowLoaded?: boolean;
  }
  var tabId: string;
}

// Generate a unique ID for this tab instance
globalThis.tabId = uuidv4();
console.log("Tab ID generated:", globalThis.tabId);

// More efficient initialization process with proper performance optimizations
const initializeExtension = () => {
  // Skip if already initialized
  if (window.focusflowLoaded) return;
  window.focusflowLoaded = true;
  
  console.log(`[FocusFlow] Initializing extension in tab ${globalThis.tabId}`);
  
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
  document.body.appendChild(appContainer);

  // Render with reduced layout thrashing and better performance
  setTimeout(() => {
    const rootElement = document.getElementById("chrome-extension-root");
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
