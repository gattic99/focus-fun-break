
import { toast } from "sonner";

// Always use the deployed backend API URL
const getBackendUrl = () => {
  // Check if in development environment (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000'; // Use local backend in development
  }
  // For production and preview environments
  return 'https://focus-flow-ai-backend.onrender.com'; // Update this with your actual deployed backend URL
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

export const validateApiKey = async (): Promise<boolean> => {
  // Check if our backend API is available
  try {
    const response = await fetch(`${getBackendUrl()}/api/health`, {
      // Adding timeout to avoid long waits on network errors
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      // If backend responds but doesn't have OpenAI configured, still return true
      // but show a notification that simulated responses will be used
      if (!data.aiAvailable) {
        console.info("Backend is available but using simulated AI responses");
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking backend health:", error);
    // Don't show error toast during initial silent check
    return false;
  }
};

export const getAIResponse = async (message: string): Promise<string> => {
  // First, check if we're offline
  if (!navigator.onLine) {
    return getFallbackResponse(message);
  }

  try {
    // Make a proper request to our backend API
    const chatResponse = await fetch(`${getBackendUrl()}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message }),
      // Adding timeout to avoid long waits
      signal: AbortSignal.timeout(10000)
    });

    if (!chatResponse.ok) {
      console.warn("Backend API error:", await chatResponse.text());
      return getFallbackResponse(message);
    }

    const data = await chatResponse.json();
    
    // If we got a valid response, return it
    if (data && data.content) {
      // If response indicates we're using fallback mode, log it
      if (data.usingFallback) {
        console.info("Using fallback AI responses (no API key on server)");
      }
      return data.content;
    } else {
      console.warn("Invalid response from backend:", data);
      return getFallbackResponse(message);
    }
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return getFallbackResponse(message);
  }
};

// Improved function to get a fallback response when the API is unavailable
function getFallbackResponse(message: string): string {
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
  
  // For other queries, return a random fallback response from the backend
  // These are duplicated here in case the backend is completely unreachable
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
  
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}
