
import { toast } from "sonner";

// Use a more reliable backend URL that we control
const getBackendUrl = () => {
  // For development and testing, use a local server
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  // For production, use our deployed backend
  return 'https://focus-flow-ai-backend.onrender.com';
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
    return response.ok;
  } catch (error) {
    console.error("Error checking backend health:", error);
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

export const getAIResponse = async (message: string): Promise<string> => {
  console.log("Trying to get AI response for:", message);
  
  // First, check if we're offline
  if (!navigator.onLine) {
    console.log("Offline mode - using fallback response");
    return getFallbackResponse(message);
  }

  try {
    const backendUrl = getBackendUrl();
    console.log("Using backend URL:", backendUrl);
    
    // Quick health check first
    try {
      const healthResponse = await fetch(`${backendUrl}/api/health`, {
        method: "GET",
        signal: AbortSignal.timeout(3000)
      });
      
      if (!healthResponse.ok) {
        console.log("Health check failed, status:", healthResponse.status);
        return getFallbackResponse(message);
      }
      
      console.log("Health check passed, proceeding with chat request");
    } catch (error) {
      console.error("Health check error:", error);
      return getFallbackResponse(message);
    }
    
    // If health check passes, proceed with actual request
    console.log("Sending chat request to backend");
    const chatResponse = await fetch(`${backendUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(10000)
    });

    if (!chatResponse.ok) {
      const errorData = await chatResponse.text();
      console.warn("Backend API error:", errorData);
      return getFallbackResponse(message);
    }

    const data = await chatResponse.json();
    console.log("Received response from API:", data);
    return data.content;
  } catch (error) {
    console.error("Error fetching AI response:", error);
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
