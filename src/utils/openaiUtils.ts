
import { toast } from "sonner";

// Determine the backend API URL based on environment
const getBackendUrl = () => {
  // Use a deployed backend URL for all environments
  // We're using a free serverless API service for demonstration
  return 'https://focus-flow-ai-backend.onrender.com';
};

// Add a flag to localStorage to track if API key has been validated
export const getApiKey = (): string | null => {
  // We're no longer using the API key directly in the frontend
  // This is kept for backward compatibility
  return null;
};

export const setApiKey = (key: string): void => {
  // This function is no longer needed but kept for backward compatibility
  toast.info("The API key is now managed securely on the server.");
};

export const clearApiKey = (): void => {
  // Clear any legacy API key storage
  localStorage.removeItem("openai_api_key");
  localStorage.removeItem("openai_api_key_validated");
};

// Set a flag when API key is validated
export const setApiKeyValidated = (isValid: boolean): void => {
  // The validation now happens on the server
  localStorage.setItem("openai_api_key_validated", isValid ? "true" : "false");
};

// Check if API key has been validated before
export const isApiKeyValidated = (): boolean => {
  // We'll assume the backend API key is valid
  return true;
};

export const validateApiKey = async (): Promise<boolean> => {
  // Check if our backend API is available
  try {
    const response = await fetch(`${getBackendUrl()}/api/health`);
    return response.ok;
  } catch (error) {
    console.error("Error checking backend health:", error);
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
  // First, check if we're offline
  if (!navigator.onLine) {
    return getFallbackResponse(message);
  }

  try {
    // Call our secure backend instead of OpenAI directly
    const response = await fetch(`${getBackendUrl()}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.warn("Backend API error:", errorData);
      return getFallbackResponse(message);
    }

    const data = await response.json();
    return data.content;
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
  
  // For other queries, return a random fallback response
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}
