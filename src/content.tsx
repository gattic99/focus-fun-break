
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { v4 as uuidv4 } from 'uuid';

import "./index.css";

// Declare the hasRun property on the window object
declare global {
  interface Window {
    hasRun?: boolean;
  }
  var tabId: string;
}

// Generate a unique ID for this tab instance
globalThis.tabId = uuidv4();

// Check if the extension has already run in this context
if (!window.hasRun) {
  window.hasRun = true;

  // When running as an extension, set up communication between background script
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    // Set up listeners for cross-tab communication
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Handle cross-tab messages here if needed
      return true;
    });
  }

  const appContainer = document.createElement("div");
  appContainer.id = "chrome-extension-root";
  document.body.appendChild(appContainer);

  const rootElement = document.getElementById("chrome-extension-root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  }
}
