
import { toast } from "sonner";

// Define backend service URLs with proper fallback
const PRODUCTION_BACKEND_URL = 'https://focus-flow-ai-backend.onrender.com';
const DEVELOPMENT_BACKEND_URL = 'http://localhost:3000';

// Get the appropriate backend URL based on environment
const getBackendUrl = () => {
  // Always try production URL first - this is the most reliable option
  return PRODUCTION_BACKEND_URL;
};

// These functions are kept for backward compatibility but are now simplified
export const getApiKey = (): string | null => {
  return null; // No API key needed in frontend anymore
};

export const setApiKey = (key: string): void => {
  // No longer storing API key in frontend
  toast.info("AI chat is now available to all users without needing an API key.", {
    duration: 3000,
    position: "bottom-left",
  });
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
    }, 10000); // Increased timeout to 10 seconds
    
    const response = await fetch(`${backendUrl}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache', // Added to prevent caching
      credentials: 'omit' // Simplify the request
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
  
  // Try multiple backend URLs if needed
  const urls = [
    'https://focus-flow-ai-backend.onrender.com', // Production
    'https://focus-flow-ai-backend.vercel.app',   // Backup production
    'http://localhost:3000'                       // Local development
  ];
  
  let lastError = null;
  
  // Try each URL in sequence
  for (const backendUrl of urls) {
    try {
      console.log("Trying backend URL:", backendUrl);
      
      // Set a generous timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      const chatResponse = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);

      if (!chatResponse.ok) {
        const errorData = await chatResponse.text();
        console.warn(`Backend API error from ${backendUrl}:`, errorData);
        lastError = errorData;
        continue; // Try next URL
      }

      const data = await chatResponse.json();
      console.log("Received response from API:", backendUrl);
      
      // We successfully connected, so we're not in offline mode
      isOfflineMode = false;
      
      return data.content;
    } catch (error) {
      console.error(`Error fetching AI response from ${backendUrl}:`, error);
      lastError = error;
      // Continue to next URL
    }
  }
  
  // All URLs failed
  console.error("All backend URLs failed. Last error:", lastError);
  isOfflineMode = true;
  
  // Show a small toast near the chat
  toast.warning("Using offline responses", {
    duration: 3000,
    position: "bottom-left",
    icon: "⚠️",
    className: "text-xs max-w-[200px]"
  });
  
  return getFallbackResponse(message);
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
