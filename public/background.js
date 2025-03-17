
// Simple background script for the FocusFlow extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('FocusFlow extension installed');
  
  // Initialize default settings if not already present
  chrome.storage.local.get(['focusflow_settings'], function(result) {
    if (!result.focusflow_settings) {
      chrome.storage.local.set({
        'focusflow_settings': {
          focusDuration: 25 * 60, // 25 minutes in seconds
          breakDuration: 5 * 60   // 5 minutes in seconds
        }
      });
    }
  });
});

// Cache to track recent messages to avoid duplicates
const messageCache = new Map();
const CACHE_EXPIRY_MS = 2000; // 2 seconds

// Relay messages between tabs for state synchronization
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Skip processing if this isn't a stateChange action
  if (message.action !== 'stateChange') {
    return true;
  }
  
  // Check message cache to prevent duplicate processing
  const messageId = `${message.action}-${message.key}-${message.tabId}-${message.timestamp}`;
  if (messageCache.has(messageId)) {
    return true;
  }
  
  // Add to cache with expiry
  messageCache.set(messageId, true);
  setTimeout(() => messageCache.delete(messageId), CACHE_EXPIRY_MS);
  
  // Forward the message to all tabs
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      // Make sure the tab has an ID
      if (tab.id) {
        // Only forward to other tabs that have our extension
        if (!sender.tab || tab.id !== sender.tab.id) {
          chrome.tabs.sendMessage(tab.id, message).catch(err => {
            // Ignore errors from tabs where content script isn't running
          });
        }
      }
    });
  });
  
  // Return true to indicate you want to send a response asynchronously
  return true;
});

// Handle audio playback coordination with improved performance
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'playAudio') {
    // Store which tab is playing the audio
    chrome.storage.local.set({
      'audio_playing': {
        tabId: sender.tab?.id,
        audioType: message.audioType,
        timestamp: Date.now()
      }
    });
    
    sendResponse({ allowed: true });
  }
  
  // Return true to indicate you want to send a response asynchronously
  return true;
});

// Clean up old audio flags periodically
setInterval(() => {
  const ONE_MINUTE = 60 * 1000;
  
  chrome.storage.local.get(['audio_playing'], (result) => {
    if (result.audio_playing && Date.now() - result.audio_playing.timestamp > ONE_MINUTE) {
      chrome.storage.local.remove('audio_playing');
    }
  });
  
  // Also clean up any audio_playing_* flags
  chrome.storage.local.get(null, (items) => {
    const audioKeys = Object.keys(items).filter(key => 
      key.startsWith('audio_playing_') && 
      items[key]?.timestamp && 
      Date.now() - items[key].timestamp > ONE_MINUTE
    );
    
    if (audioKeys.length > 0) {
      chrome.storage.local.remove(audioKeys);
    }
  });
}, 5 * 60 * 1000); // Run every 5 minutes
