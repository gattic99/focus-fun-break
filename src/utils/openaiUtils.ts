import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { isExtensionContext, saveToLocalStorage, getFromLocalStorage } from "./chromeUtils";

// Cache the API key to avoid too many Firestore reads
let cachedApiKey: string | null = null;
let lastFetchTime = 0;
const CACHE_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

// API key handling
export const getApiKey = (): string | null => {
  // Check if user has provided their own API key
  const userApiKey = localStorage.getItem("openai_api_key");
  if (userApiKey) {
    return userApiKey;
  }
  
  // Otherwise return the cached Firebase key
  return cachedApiKey;
};

export const setApiKey = (key: string): void => {
  localStorage.setItem("openai_api_key", key);
  localStorage.setItem("openai_api_key_validated", "true");
  toast.success("API key saved successfully.");
};

export const clearApiKey = (): void => {
  localStorage.removeItem("openai_api_key");
  localStorage.removeItem("openai_api_key_validated");
  toast.info("API key removed.");
};

export const setApiKeyValidated = (isValid: boolean): void => {
  localStorage.setItem("openai_api_key_validated", isValid ? "true" : "false");
};

export const isApiKeyValidated = (): boolean => {
  return localStorage.getItem("openai_api_key_validated") === "true";
};

// New function to fetch API key from Firebase
export const fetchApiKeyFromFirebase = async (): Promise<string | null> => {
  // Don't fetch if we have a recently cached key
  const now = Date.now();
  if (cachedApiKey && now - lastFetchTime < CACHE_EXPIRY) {
    return cachedApiKey;
  }
  
  try {
    // Fetch the API key from Firestore
    const apiKeyDoc = await getDoc(doc(db, "secrets", "openai"));
    
    if (apiKeyDoc.exists()) {
      cachedApiKey = apiKeyDoc.data().apiKey;
      lastFetchTime = now;
      return cachedApiKey;
    } else {
      console.error("No API key found in Firestore");
      return null;
    }
  } catch (error) {
    console.error("Error fetching API key from Firebase:", error);
    return null;
  }
};

export const validateApiKey = async (): Promise<boolean> => {
  const apiKey = getApiKey();
  
  // If no API key, we'll try to fetch from Firebase
  if (!apiKey) {
    const firebaseKey = await fetchApiKeyFromFirebase();
    if (firebaseKey) {
      cachedApiKey = firebaseKey;
      return true;
    }
    return false;
  }
  
  try {
    // Simple validation by checking if we can get a model list
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(5000) // 5-second timeout
    });
    
    if (!response.ok) {
      console.error("API validation failed:", await response.text());
      setApiKeyValidated(false);
      return false;
    }
    
    setApiKeyValidated(true);
    return true;
  } catch (error) {
    console.error("Error validating API key:", error);
    setApiKeyValidated(false);
    return false;
  }
};

export const getAIResponse = async (message: string): Promise<string> => {
  // First, try to get the user's API key or the cached Firebase key
  let apiKey = getApiKey();
  
  // If no key is available, try to fetch from Firebase
  if (!apiKey) {
    apiKey = await fetchApiKeyFromFirebase();
  }
  
  // If still no key or network issues, use fallback responses
  if (!apiKey || !navigator.onLine) {
    return getFallbackResponse(message);
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Smaller, more efficient model
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant focused on productivity and well-being. Keep your responses concise and practical."
          },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
      signal: AbortSignal.timeout(10000) // 10-second timeout
    });
    
    if (!response.ok) {
      console.error("OpenAI API error:", await response.text());
      return getFallbackResponse(message);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return getFallbackResponse(message);
  }
};

// Fallback responses when API is unavailable or no key is provided
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
