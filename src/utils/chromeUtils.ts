// Utility functions for Chrome extension functionality

import { MessageSender } from "../types/chrome";

// Performance optimization: Cache the extension context result
let isExtensionContextCache: boolean | null = null;

/**
 * Safely checks if the app is running in a Chrome extension context
 */
export const isExtensionContext = (): boolean => {
  if (isExtensionContextCache !== null) {
    return isExtensionContextCache;
  }
  
  isExtensionContextCache = typeof window !== 'undefined' && 
    typeof chrome !== 'undefined' && 
    typeof chrome.runtime !== 'undefined' && 
    typeof chrome.runtime.id !== 'undefined';
    
  return isExtensionContextCache;
};

// Cache for extension URLs to reduce calls to chrome.runtime.getURL
const urlCache = new Map<string, string>();

/**
 * Safely gets a URL from Chrome's runtime with caching
 */
export const getExtensionURL = (path: string): string => {
  if (urlCache.has(path)) {
    return urlCache.get(path)!;
  }
  
  if (isExtensionContext() && chrome.runtime && chrome.runtime.getURL) {
    const url = chrome.runtime.getURL(path);
    urlCache.set(path, url);
    return url;
  }
  return path; // Fallback to relative path
};

// Debounce helper function to prevent too many storage operations
const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<F>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Storage operation queue to prevent race conditions
let storageQueue: Promise<any> = Promise.resolve();

/**
 * Saves data to Chrome's sync storage with debouncing
 */
export const saveToStorage = async (key: string, value: any): Promise<void> => {
  if (!isExtensionContext()) return;
  
  return new Promise((resolve, reject) => {
    // Queue this operation
    storageQueue = storageQueue.then(() => {
      return new Promise<void>((innerResolve) => {
        chrome.storage.sync.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
          innerResolve();
        });
      });
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

// Debounced version of broadcast to reduce frequent updates
const debouncedBroadcast = debounce((key: string, value: any) => {
  if (!isExtensionContext()) return;
  
  chrome.runtime.sendMessage({
    action: 'stateChange',
    key,
    value,
    timestamp: Date.now(),
    tabId: globalThis.tabId
  });
}, 250); // 250ms debounce

/**
 * Saves data to Chrome's local storage (for larger objects) with optimizations
 */
export const saveToLocalStorage = async (key: string, value: any): Promise<void> => {
  if (!isExtensionContext()) return;
  
  return new Promise((resolve, reject) => {
    // Queue this operation
    storageQueue = storageQueue.then(() => {
      return new Promise<void>((innerResolve) => {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            console.error("Local storage error:", chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            // Use debounced broadcast
            debouncedBroadcast(key, value);
            resolve();
          }
          innerResolve();
        });
      });
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
  // Use the debounced version
  debouncedBroadcast(key, value);
};

// Keep track of active message listeners to avoid duplicates
const activeListeners = new Set<Function>();

/**
 * Listens for state changes from other tabs
 */
export const listenForStateChanges = (callback: (key: string, value: any) => void): (() => void) => {
  if (!isExtensionContext()) return () => {};
  
  // Create wrapper to check for duplicates
  const wrappedCallback = (message: any, sender: MessageSender, sendResponse: (response?: any) => void) => {
    // Skip messages from this tab and only process stateChange actions
    if (message.action === 'stateChange' && message.tabId !== globalThis.tabId) {
      callback(message.key, message.value);
    }
    return true;
  };
  
  // Only add if not already listening
  if (!activeListeners.has(callback)) {
    chrome.runtime.onMessage.addListener(wrappedCallback);
    activeListeners.add(callback);
  }
  
  // Return function to remove the listener
  return () => {
    chrome.runtime.onMessage.removeListener(wrappedCallback);
    activeListeners.delete(callback);
  };
};

// Audio playback throttling
const audioPlayTimes = new Map<string, number>();
const AUDIO_THROTTLE_MS = 3000; // Don't play the same sound more than once every 3 seconds

/**
 * Plays audio exactly once across all tabs with performance optimizations
 */
export const playSingleAudio = async (audioElement: HTMLAudioElement | null, audioId: string): Promise<void> => {
  if (!audioElement) return;
  
  // Check if we've played this audio recently
  const lastPlayTime = audioPlayTimes.get(audioId) || 0;
  const now = Date.now();
  
  if (now - lastPlayTime < AUDIO_THROTTLE_MS) {
    console.log(`Audio ${audioId} throttled - played too recently`);
    return;
  }
  
  if (!isExtensionContext()) {
    audioElement.play().catch(err => console.error("Error playing audio:", err));
    audioPlayTimes.set(audioId, now);
    return;
  }
  
  const audioFlagKey = `audio_playing_${audioId}`;
  
  try {
    // Try to set a flag indicating this audio is playing
    await saveToLocalStorage(audioFlagKey, {
      playing: true,
      timestamp: now,
      tabId: globalThis.tabId
    });
    
    // Double-check we're still the one that should play the audio
    const currentState = await getFromLocalStorage<{playing: boolean, timestamp: number, tabId: string}>(audioFlagKey);
    
    if (currentState && currentState.tabId === globalThis.tabId) {
      // We're allowed to play the audio
      await audioElement.play();
      audioPlayTimes.set(audioId, now);
      
      // Set a timeout to remove the flag after audio completes
      setTimeout(async () => {
        await saveToLocalStorage(audioFlagKey, null);
      }, 1000); // Reduced timeout for faster cleanup
    }
  } catch (error) {
    console.error("Error managing audio playback:", error);
  }
};

// Add a type declaration to window/global
declare global {
  var tabId: string;
}
