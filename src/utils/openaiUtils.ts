
import { toast } from "sonner";

// Add a flag to localStorage to track if API key has been validated
export const getApiKey = (): string | null => {
  return localStorage.getItem("openai_api_key");
};

export const setApiKey = (key: string): void => {
  // Basic validation for OpenAI API key format (starts with "sk-")
  if (!key.startsWith("sk-")) {
    toast.error("Invalid API key format. OpenAI API keys typically start with 'sk-'");
    throw new Error("Invalid API key format");
  }
  
  localStorage.setItem("openai_api_key", key);
  // Set as validated when a user enters a key
  setApiKeyValidated(true);
};

export const clearApiKey = (): void => {
  localStorage.removeItem("openai_api_key");
  localStorage.removeItem("openai_api_key_validated");
};

// Set a flag when API key is validated
export const setApiKeyValidated = (isValid: boolean): void => {
  localStorage.setItem("openai_api_key_validated", isValid ? "true" : "false");
};

// Check if API key has been validated before
export const isApiKeyValidated = (): boolean => {
  return localStorage.getItem("openai_api_key_validated") === "true";
};

export const validateApiKey = async (): Promise<boolean> => {
  const apiKey = getApiKey();
  if (!apiKey) return false;
  
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    
    const isValid = response.ok;
    setApiKeyValidated(isValid);
    return isValid;
  } catch (error) {
    console.error("Error validating API key:", error);
    setApiKeyValidated(false);
    return false;
  }
};

// Fallback responses for when the API is unavailable
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
    const apiKey = getApiKey();
    
    // No API key, use fallback responses
    if (!apiKey) {
      return getFallbackResponse(message);
    }

    // Try to use the OpenAI API if we have a key
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using OpenAI's latest model for best performance/cost ratio
          messages: [
            { role: "system", content: "You are a helpful assistant focused on productivity and well-being. Keep your responses concise and practical." },
            { role: "user", content: message }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.warn("OpenAI API error:", errorData);
        
        if (response.status === 401) {
          // Invalid API key
          clearApiKey(); // Clear the invalid key
          return "Your OpenAI API key appears to be invalid. Please check your key and try again.";
        }
        
        return getFallbackResponse(message);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (apiError) {
      console.error("Error in OpenAI API call:", apiError);
      return getFallbackResponse(message);
    }
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return getFallbackResponse(message);
  }
};

// Function to get a fallback response when the API is unavailable
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
