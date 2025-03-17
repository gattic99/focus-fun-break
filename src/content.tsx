
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

// Create a more efficient initialization process
const initializeExtension = () => {
  // Skip if already initialized
  if (window.focusflowLoaded) return;
  window.focusflowLoaded = true;
  
  // When running as an extension, set up communication between background script
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log("Extension environment detected, setting up message listeners");
    
    // Set up listeners for cross-tab communication
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Only process messages we care about
      if (message.action === 'stateChange' || message.action === 'playAudio') {
        console.log("Message received in content script:", message);
      }
      return true;
    });
  }

  // Create container with visibility hidden initially for smoother rendering
  const appContainer = document.createElement("div");
  appContainer.id = "chrome-extension-root";
  appContainer.style.visibility = "hidden"; 
  document.body.appendChild(appContainer);

  // Render with a slight delay to ensure minimum impact on page load
  setTimeout(() => {
    const rootElement = document.getElementById("chrome-extension-root");
    if (rootElement) {
      createRoot(rootElement).render(<App />);
      // Show UI only after it's rendered
      setTimeout(() => {
        appContainer.style.visibility = "visible";
      }, 100);
    }
  }, 300);
};

// Check if we should initialize now or wait
if (!window.hasRun) {
  window.hasRun = true;
  
  // Use requestIdleCallback if available to run during browser idle time
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => initializeExtension());
  } else {
    // Fallback to setTimeout with a delay
    setTimeout(initializeExtension, 500);
  }
}
