
import { toast } from "sonner";

// Define backend service URLs with proper fallback
const PRODUCTION_BACKEND_URL = 'https://focus-flow-ai-backend.onrender.com';
const DEVELOPMENT_BACKEND_URL = 'http://localhost:3000';

// Get the appropriate backend URL based on environment
const getBackendUrl = () => {
  // Check for running in extension context
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return PRODUCTION_BACKEND_URL;
  }
  
  // For development and testing
  if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Try the development URL first
    return DEVELOPMENT_BACKEND_URL;
  }
  
  // Default to production backend
  return PRODUCTION_BACKEND_URL;
};

// These functions are kept for backward compatibility but are now simplified
export const getApiKey = (): string | null => {
  return null; // No API key needed in frontend anymore
};

export const setApiKey = (key: string): void => {
  // No longer storing API key in frontend
  toast.info("AI chat is now available to all users without needing an API key.");
};

export const clearApiKey = (): void => {
  // Clear any legacy API key storage
  localStorage.removeItem("openai_api_key");
  localStorage.removeItem("openai_api_key_validated");
};

export const setApiKeyValidated = (isValid: boolean): void => {
  // The backend handles API key validation
  localStorage.setItem("openai_api_key_validated", "true"); // Always assume it's valid
};

export const isApiKeyValidated = (): boolean => {
  // We'll always return true since the backend handles authentication
  return true;
};

// Variable to track if we're in offline mode
let isOfflineMode = false;

// Improved validation check with better error handling
export const validateApiKey = async (): Promise<boolean> => {
  try {
    console.log("Checking backend API status...");
    const backendUrl = getBackendUrl();
    console.log("Using backend URL:", backendUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log("Health check request timed out");
    }, 5000);
    
    const response = await fetch(`${backendUrl}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log("Backend health check failed with status:", response.status);
      isOfflineMode = true;
      return false;
    }
    
    const data = await response.json();
    console.log("Backend health check passed:", data);
    isOfflineMode = false;
    return true;
  } catch (error) {
    console.error("Error checking backend health:", error);
    isOfflineMode = true;
    // Don't show error toast during initial silent check
    return false;
  }
};

// Enhanced fallback responses for when the API is unavailable
const fallbackResponses = [
  "I'm here to help you stay focused and productive. What would you like assistance with today?",
  "Having a productive day? I can suggest techniques to help you maintain focus.",
  "Looking for a productivity tip? Regular breaks can actually improve your overall focus and output.",
  "Need help organizing your tasks? I recommend prioritizing them by importance and urgency.",
  "Remember that taking short breaks during focused work can help prevent burnout and maintain productivity.",
  "Is there something specific about productivity or focus that you'd like to learn more about?",
  "The Pomodoro Technique involves 25-minute focused work sessions followed by 5-minute breaks. Would you like to try it?",
  "Setting clear goals for each work session can significantly improve your productivity and focus.",
  "I'm here to support your productivity journey. What challenges are you facing today?",
  "Sometimes a change of environment can help refresh your focus. Have you tried working from a different location?"
];

// Improved AI response function with retry mechanism and better error handling
export const getAIResponse = async (message: string): Promise<string> => {
  console.log("Getting AI response for:", message);
  
  // First, check if we're offline
  if (!navigator.onLine) {
    console.log("Browser is offline - using fallback response");
    return getFallbackResponse(message);
  }

  // If we're in known offline mode, do a quick validation check
  if (isOfflineMode) {
    const isAvailable = await validateApiKey();
    if (!isAvailable) {
      console.log("Still in offline mode - using fallback response");
      return getFallbackResponse(message);
    }
  }

  try {
    const backendUrl = getBackendUrl();
    console.log("Using backend URL for chat:", backendUrl);
    
    // Try to make the actual request with a reasonable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const chatResponse = await fetch(`${backendUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ message }),
      signal: controller.signal,
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);

    if (!chatResponse.ok) {
      const errorData = await chatResponse.text();
      console.warn("Backend API error:", errorData);
      
      // Try to validate the API again to update offline status
      await validateApiKey();
      
      toast.error("Unable to connect to AI service, using offline response");
      return getFallbackResponse(message);
    }

    const data = await chatResponse.json();
    console.log("Received response from API");
    
    // We successfully connected, so we're not in offline mode
    isOfflineMode = false;
    
    return data.content;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    
    // Update offline status
    isOfflineMode = true;
    
    // Only show the toast if it's not an abort error (user intentionally cancelled)
    if (!(error instanceof DOMException && error.name === "AbortError")) {
      toast.error("Unable to connect to AI service, using offline response");
    }
    
    return getFallbackResponse(message);
  }
};

// Improved function to get a fallback response when the API is unavailable
function getFallbackResponse(message: string): string {
  console.log("Using fallback response for:", message);
  
  // For simple questions, provide standard responses
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hello! I'm your productivity assistant. How can I help you today?";
  }
  
  if (message.toLowerCase().includes("how are you")) {
    return "I'm functioning well and ready to help you with your productivity needs!";
  }
  
  if (message.toLowerCase().includes("thank")) {
    return "You're welcome! Feel free to ask if you need more assistance.";
  }
  
  // For other queries, return a random fallback response
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}
