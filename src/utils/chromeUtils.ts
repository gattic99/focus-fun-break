
// Utility functions for Chrome extension functionality

/**
 * Safely checks if the app is running in a Chrome extension context
 */
export const isExtensionContext = (): boolean => {
  return typeof window !== 'undefined' && 
    typeof chrome !== 'undefined' && 
    typeof chrome.runtime !== 'undefined' && 
    typeof chrome.runtime.id !== 'undefined';
};

/**
 * Safely gets a URL from Chrome's runtime
 */
export const getExtensionURL = (path: string): string => {
  if (isExtensionContext() && chrome.runtime && chrome.runtime.getURL) {
    return chrome.runtime.getURL(path);
  }
  return path; // Fallback to relative path
};

/**
 * Saves data to Chrome's sync storage
 */
export const saveToStorage = async (key: string, value: any): Promise<void> => {
  if (!isExtensionContext()) return;
  
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Retrieves data from Chrome's sync storage
 */
export const getFromStorage = async <T>(key: string): Promise<T | null> => {
  if (!isExtensionContext()) return null;
  
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] || null);
      }
    });
  });
};

/**
 * Saves data to Chrome's local storage (for larger objects)
 */
export const saveToLocalStorage = async (key: string, value: any): Promise<void> => {
  if (!isExtensionContext()) return;
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        // Send a message to other tabs to notify of state change
        broadcastStateChange(key, value);
        resolve();
      }
    });
  });
};

/**
 * Retrieves data from Chrome's local storage
 */
export const getFromLocalStorage = async <T>(key: string): Promise<T | null> => {
  if (!isExtensionContext()) return null;
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] || null);
      }
    });
  });
};

/**
 * Broadcasts state changes to all other tabs
 */
export const broadcastStateChange = (key: string, value: any): void => {
  if (!isExtensionContext()) return;
  
  chrome.runtime.sendMessage({
    action: 'stateChange',
    key,
    value,
    timestamp: Date.now(),
    tabId: globalThis.tabId // This will be set in content.tsx
  });
};

/**
 * Listens for state changes from other tabs
 */
export const listenForStateChanges = (callback: (key: string, value: any) => void): (() => void) => {
  if (!isExtensionContext()) return () => {};
  
  const listener = (message: any, sender: MessageSender, sendResponse: (response?: any) => void) => {
    // Skip messages from this tab
    if (message.action === 'stateChange' && message.tabId !== globalThis.tabId) {
      callback(message.key, message.value);
    }
    return true;
  };
  
  chrome.runtime.onMessage.addListener(listener);
  
  // Return a function to remove the listener
  return () => {
    chrome.runtime.onMessage.removeListener(listener);
  };
};

/**
 * Plays audio exactly once across all tabs
 * Uses a special flag in local storage to prevent duplicate sounds
 */
export const playSingleAudio = async (audioElement: HTMLAudioElement | null, audioId: string): Promise<void> => {
  if (!audioElement || !isExtensionContext()) {
    if (audioElement) audioElement.play().catch(err => console.error("Error playing audio:", err));
    return;
  }
  
  const audioFlagKey = `audio_playing_${audioId}`;
  const timestamp = Date.now();
  
  try {
    // Try to set a flag indicating this audio is playing
    await saveToLocalStorage(audioFlagKey, {
      playing: true,
      timestamp,
      tabId: globalThis.tabId
    });
    
    // Double-check we're still the one that should play the audio
    const currentState = await getFromLocalStorage<{playing: boolean, timestamp: number, tabId: string}>(audioFlagKey);
    
    if (currentState && currentState.tabId === globalThis.tabId) {
      // We're allowed to play the audio
      await audioElement.play();
      
      // Set a timeout to remove the flag after audio completes
      setTimeout(async () => {
        await saveToLocalStorage(audioFlagKey, null);
      }, audioElement.duration * 1000 + 500); // Audio duration + small buffer
    }
  } catch (error) {
    console.error("Error managing audio playback:", error);
    // Fallback - just play the audio
    audioElement.play().catch(err => console.error("Error playing audio fallback:", err));
  }
};

// Add a type declaration to window/global
declare global {
  var tabId: string;
}
