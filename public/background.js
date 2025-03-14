
// Simple background script for the FocusFlow extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('FocusFlow extension installed');
});

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

// Relay messages between tabs for state synchronization
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'stateChange') {
    // Forward the message to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        // Only forward to other tabs that have our extension
        if (tab.id !== sender.tab?.id) {
          chrome.tabs.sendMessage(tab.id, message).catch(err => {
            // Ignore errors from tabs where content script isn't running
          });
        }
      });
    });
  }
  return true;
});

// Handle audio playback coordination
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
  return true;
});
